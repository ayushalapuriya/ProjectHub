const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const http = require("http")
const socketIo = require("socket.io")
require("dotenv").config()

const app = express()
const server = http.createServer(app)

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Make io accessible to routes
app.set("io", io)

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Socket.io connection handling
const connectedUsers = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Handle user authentication and join rooms
  socket.on("authenticate", (userData) => {
    if (userData && userData.userId) {
      connectedUsers.set(socket.id, {
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      })

      // Join user-specific room
      socket.join(`user_${userData.userId}`)

      // Join project rooms based on user's projects
      if (userData.projects && userData.projects.length > 0) {
        userData.projects.forEach((projectId) => {
          socket.join(`project_${projectId}`)
        })
      }

      console.log(`User ${userData.name} authenticated and joined rooms`)

      // Notify others that user is online
      socket.broadcast.emit("user_online", {
        userId: userData.userId,
        name: userData.name,
        timestamp: new Date(),
      })
    }
  })

  // Handle joining project rooms
  socket.on("join_project", (projectId) => {
    socket.join(`project_${projectId}`)
    console.log(`Socket ${socket.id} joined project room: project_${projectId}`)
  })

  // Handle leaving project rooms
  socket.on("leave_project", (projectId) => {
    socket.leave(`project_${projectId}`)
    console.log(`Socket ${socket.id} left project room: project_${projectId}`)
  })

  // Handle task updates
  socket.on("task_updated", (data) => {
    const user = connectedUsers.get(socket.id)
    if (user?.userId && data?.projectId) {
      socket.to(`project_${data.projectId}`).emit("task_updated", {
        ...data,
        updatedBy: user,
        timestamp: new Date(),
      })
    }
  })

  // Handle project updates
  socket.on("project_updated", (data) => {
    const user = connectedUsers.get(socket.id)
    if (user?.userId && data?.projectId) {
      socket.to(`project_${data.projectId}`).emit("project_updated", {
        ...data,
        updatedBy: user,
        timestamp: new Date(),
      })
    }
  })

  // Handle new comments
  socket.on("new_comment", (data) => {
    const user = connectedUsers.get(socket.id)
    if (user?.userId) {
      // Emit to project room
      if (data?.projectId) {
        socket.to(`project_${data.projectId}`).emit("new_comment", {
          ...data,
          author: user,
          timestamp: new Date(),
        })
      }

      // Emit to mentioned users
      if (data?.mentionedUsers?.length > 0) {
        data.mentionedUsers.forEach((userId) => {
          socket.to(`user_${userId}`).emit("notification", {
            type: "mention",
            title: "You were mentioned",
            message: `${user.name} mentioned you in a comment`,
            data: data,
            timestamp: new Date(),
          })
        })
      }
    }
  })

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const user = connectedUsers.get(socket.id)
    if (user?.userId && data?.projectId) {
      socket.to(`project_${data.projectId}`).emit("user_typing", {
        userId: user.userId,
        name: user.name,
        location: data.location, // task, project, etc.
        locationId: data.locationId,
      })
    }
  })

  socket.on("typing_stop", (data) => {
    const user = connectedUsers.get(socket.id)
    if (user?.userId && data?.projectId) {
      socket.to(`project_${data.projectId}`).emit("user_stopped_typing", {
        userId: user.userId,
        location: data.location,
        locationId: data.locationId,
      })
    }
  })

  // Handle notifications
  socket.on("send_notification", (data) => {
    if (data.targetUserId) {
      socket.to(`user_${data.targetUserId}`).emit("notification", {
        ...data,
        timestamp: new Date(),
      })
    }
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      console.log(`User ${user.name} disconnected`)

      // Notify others that user is offline
      socket.broadcast.emit("user_offline", {
        userId: user.userId,
        name: user.name,
        timestamp: new Date(),
      })

      connectedUsers.delete(socket.id)
    }
  })
})

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/projects", require("./routes/projects"))
app.use("/api/tasks", require("./routes/tasks"))
app.use("/api/resources", require("./routes/resources"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/project_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

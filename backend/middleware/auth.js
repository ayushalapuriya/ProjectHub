const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    console.log("Auth middleware token:", token)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    console.log("Auth middleware decoded token:", decoded)
    const user = await User.findById(decoded.id).select("-password")
    console.log("Auth middleware user role:", user?.role)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    })
  }
}

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      })
    }
    next()
  }
}

module.exports = { auth, authorize }

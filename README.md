# ProjectHub - MERN Stack Project Management Application

A comprehensive full-stack project management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS. This application facilitates project planning, task management, and resource allocation to improve project transparency and delivery timelines.

## ✨ Features

### 🎯 Core Functionality
- **Project Management**: Create, update, and manage multiple projects with detailed information
- **Task Scheduling**: Add tasks with deadlines, assignees, priorities, and dependencies
- **Gantt Chart Visualization**: Interactive timeline representation of project progress
- **Real-time Notifications**: Live updates for task changes and project updates via Socket.io
- **Resource Tracking**: Monitor and allocate resources across different projects
- **Team Collaboration**: User management with role-based access control

### 🎨 User Experience
- **Modern UI**: Clean and intuitive interface built with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live notifications and updates across all connected users
- **Interactive Dashboard**: Comprehensive overview of projects, tasks, and deadlines
- **Advanced Filtering**: Search and filter projects and tasks by various criteria

### 🔧 Technical Features
- **Authentication & Authorization**: JWT-based secure authentication system
- **Role-based Access**: Admin, Manager, and Member roles with appropriate permissions
- **File Attachments**: Support for task attachments and comments
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Notification System**: In-app and real-time notifications for important updates

## 🛠 Tech Stack

### Frontend
- **React.js 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router**: Client-side routing for single-page application
- **Axios**: HTTP client for API communication
- **Socket.io Client**: Real-time communication
- **React Icons**: Comprehensive icon library
- **React Toastify**: Toast notifications
- **Moment.js**: Date and time manipulation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast and minimalist web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **Socket.io**: Real-time bidirectional event-based communication
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation middleware

### Development Tools
- **Nodemon**: Development server with auto-restart
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📁 Project Structure

```
ProjectHub/
├── backend/                 # Node.js/Express.js API server
│   ├── config/             # Database and configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose data models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── tests/             # Backend tests
│   ├── .env               # Environment variables
│   ├── .env.example       # Environment variables template
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── frontend/               # React.js application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── charts/    # Chart components (Gantt, Progress)
│   │   │   ├── common/    # Common UI components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── notifications/ # Notification components
│   │   │   └── resources/ # Resource tracking components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions and constants
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Application entry point
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js  # PostCSS configuration
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── setup.sh               # Unix setup script
└── setup.bat              # Windows setup script
```

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

### Quick Setup

#### Option 1: Automated Setup (Recommended)

**For Unix/Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

#### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ProjectHub
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/project_management
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

5. **Start MongoDB service**

   **On macOS (with Homebrew):**
   ```bash
   brew services start mongodb/brew/mongodb-community
   ```

   **On Ubuntu/Debian:**
   ```bash
   sudo systemctl start mongod
   ```

   **On Windows:**
   ```cmd
   net start MongoDB
   ```

6. **Run the application**

   **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

   **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   ```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all projects | Yes |
| POST | `/api/projects` | Create new project | Yes (Manager/Admin) |
| GET | `/api/projects/:id` | Get project details | Yes |
| PUT | `/api/projects/:id` | Update project | Yes (Manager/Admin) |
| DELETE | `/api/projects/:id` | Delete project | Yes (Manager/Admin) |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| GET | `/api/tasks/:id` | Get task details | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| POST | `/api/tasks/:id/comments` | Add comment to task | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/:id` | Get user details | Yes |
| PUT | `/api/users/:id` | Update user | Yes (Admin) |
| DELETE | `/api/users/:id` | Delete user | Yes (Admin) |
| GET | `/api/users/dashboard` | Get dashboard data | Yes |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |
| GET | `/api/notifications/stats` | Get notification stats | Yes |

## 🎮 Usage Guide

### Getting Started

1. **Register an Account**
   - Visit http://localhost:3000/register
   - Fill in your details (name, email, password, department, skills)
   - Choose your role (member by default)

2. **Login**
   - Use your email and password to login
   - You'll be redirected to the dashboard

3. **Dashboard Overview**
   - View your active projects and tasks
   - Check upcoming deadlines
   - Monitor project progress
   - Access quick actions

### Creating Projects

1. **Navigate to Projects**
   - Click "Projects" in the sidebar
   - Click "New Project" button

2. **Fill Project Details**
   - Project name and description
   - Start and end dates
   - Assign project manager
   - Add team members
   - Set priority and budget
   - Define resources

3. **Project Management**
   - View project timeline with Gantt chart
   - Track progress and milestones
   - Manage team members
   - Monitor resource allocation

### Managing Tasks

1. **Create Tasks**
   - Navigate to Tasks or within a project
   - Click "New Task" button
   - Fill in task details (title, description, assignee, dates, priority)
   - Set dependencies if needed

2. **Task Features**
   - Update task status (To Do, In Progress, Review, Completed)
   - Add comments and attachments
   - Track time and progress
   - Set subtasks and dependencies

### Team Collaboration

1. **User Roles**
   - **Admin**: Full system access, user management
   - **Manager**: Project creation, team management
   - **Member**: Task execution, project participation

2. **Real-time Features**
   - Live notifications for task updates
   - Real-time project changes
   - Instant messaging through comments
   - Live status updates

### Resource Management

1. **Add Resources**
   - Navigate to project details
   - Add human resources, equipment, software, or other resources
   - Set allocation and availability

2. **Track Utilization**
   - Monitor resource allocation across projects
   - Identify over-allocated resources
   - Optimize resource distribution

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Test Coverage

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm test -- --coverage
```

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-production-db-url
   JWT_SECRET=your-super-secure-jwt-secret
   JWT_EXPIRE=30d
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

### Deployment Options

#### Option 1: Traditional Server Deployment

1. **Backend Deployment**
   - Deploy to services like DigitalOcean, AWS EC2, or Heroku
   - Set up MongoDB Atlas or self-hosted MongoDB
   - Configure environment variables
   - Use PM2 for process management

2. **Frontend Deployment**
   - Deploy build folder to Netlify, Vercel, or AWS S3
   - Configure API endpoints
   - Set up custom domain

#### Option 2: Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Option 3: Cloud Platform Deployment

- **Heroku**: Easy deployment with Git integration
- **Vercel**: Excellent for React frontend
- **Netlify**: Great for static site deployment
- **AWS**: Comprehensive cloud solution
- **Google Cloud**: Scalable cloud platform

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/project_management | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 30d | No |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 | No |

### Database Configuration

The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `projects` - Project information and settings
- `tasks` - Task details and relationships
- `notifications` - User notifications

### Socket.io Configuration

Real-time features are powered by Socket.io with the following events:
- `join` - User joins their notification room
- `join-project` - User joins project room
- `task-update` - Task update notifications
- `project-update` - Project update notifications
- `notification` - General notifications

## 🤝 Contributing

We welcome contributions to ProjectHub! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new features**
5. **Ensure all tests pass**
6. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Follow React best practices

### Reporting Issues

- Use GitHub Issues to report bugs
- Provide detailed reproduction steps
- Include environment information
- Add screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing React framework
- **MongoDB** for the flexible database solution
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.io** for real-time communication
- **Express.js** for the fast web framework
- **Open Source Community** for the incredible tools and libraries

## 📞 Support

If you have any questions or need help with the project:

- 📧 Email: support@projecthub.com
- 💬 Discord: [Join our community](https://discord.gg/projecthub)
- 📖 Documentation: [Full documentation](https://docs.projecthub.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/projecthub/issues)

---

**Made with ❤️ by the ProjectHub Team**

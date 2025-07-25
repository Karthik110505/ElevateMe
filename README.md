# ElevateMe 🚀

**A modern platform connecting developers and employers through portfolio showcase and project collaboration.**

ElevateMe is a full-stack MERN application that enables developers to showcase their work, discover interesting projects, and connect with potential employers or collaborators. The platform features secure authentication, project management, and a clean, modern interface built with React and Tailwind CSS.

---

## � Screenshots

### Landing Page
![Landing Page](./docs/screenshots/landing-page.png)
*Modern landing page with hero section and feature highlights*

### Explore Projects
![Explore Projects](./docs/screenshots/explore-projects.png)
*Discover and browse projects from the developer community*

### My Profile
![My Profile](./docs/screenshots/my-profile.png)
*Personal profile management and project showcase*

### Upload Project
![Upload Project](./docs/screenshots/upload-project.png)
*Intuitive project upload with image and detail management*

---

## ✨ Features

### 🔐 Authentication & Security
- **OAuth Integration**: Login with Google, GitHub, and LinkedIn
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Express sessions with MongoDB store
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using Joi and express-validator

### 📁 Project Management
- **Project Upload**: Upload projects with images, descriptions, and tags
- **Image Storage**: Cloudinary integration for optimized image handling
- **Project Discovery**: Browse and search through community projects
- **Project Details**: Detailed project pages with full information

### 👤 User Profiles
- **Profile Management**: Comprehensive user profile system
- **Public Profiles**: Shareable public profile pages
- **Project Showcase**: Display personal projects and achievements

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, fully responsive layout
- **Tailwind CSS**: Modern utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Clean Interface**: Intuitive and professional design

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Image storage and optimization
- **Helmet** - Security middleware

### Development Tools
- **Nodemon** - Development server auto-restart
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **Morgan** - HTTP request logger

---

## 📁 Project Structure

```
elevateme/
├── README.md
├── backend/                    # Node.js/Express backend
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── config/                # Configuration files
│   │   └── passport.js        # Passport authentication setup
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── upload.js         # File upload middleware
│   │   └── validation.js     # Input validation middleware
│   ├── models/               # Mongoose models
│   │   ├── User.js          # User model
│   │   └── Project.js       # Project model
│   └── routes/              # Express routes
│       ├── auth.js          # Authentication routes
│       ├── users.js         # User management routes
│       ├── projects.js      # Project management routes
│       └── health.js        # Health check routes
├── frontend/                 # React frontend
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main App component
│   │   ├── components/      # Reusable components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── TopNavigation.jsx
│   │   └── pages/           # Page components
│   │       ├── LandingPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── SignupPage.jsx
│   │       ├── ExploreProjects.jsx
│   │       ├── UploadProject.jsx
│   │       ├── ProjectDetail.jsx
│   │       ├── PublicProfile.jsx
│   │       ├── AuthSuccess.jsx
│   │       └── OAuthCallback.jsx
└── docs/                    # Documentation
    ├── BACKEND_SETUP.md     # Backend setup guide
    ├── DATABASE_SCHEMA.md   # Database schema documentation
    ├── MONGODB_ATLAS_SETUP.md # MongoDB Atlas setup guide
    ├── OAUTH_SETUP_GUIDE.md # OAuth configuration guide
    └── screenshots/         # Application screenshots
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `SESSION_SECRET` | Secret key for sessions | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | ✅ |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID | ✅ |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth client secret | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |

### OAuth Setup

For detailed OAuth setup instructions, see:
- [OAuth Setup Guide](./docs/OAUTH_SETUP_GUIDE.md)
- [MongoDB Atlas Setup](./docs/MONGODB_ATLAS_SETUP.md)

---

## 🛡️ Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Prevents brute force attacks
- **Input Sanitization**: Validates and sanitizes all inputs
- **JWT Authentication**: Secure token-based authentication
- **Session Security**: Secure session configuration
- **Password Hashing**: BCrypt for password security

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/elevateme.git
cd elevateme
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/elevateme
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elevateme

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## � API Endpoints

### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
GET    /api/auth/me              # Get current user
GET    /api/auth/google          # Google OAuth
GET    /api/auth/github          # GitHub OAuth
GET    /api/auth/linkedin        # LinkedIn OAuth
```

### Users
```
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update user profile
GET    /api/users/:id            # Get public profile
```

### Projects
```
GET    /api/projects             # Get all projects
POST   /api/projects             # Create new project
GET    /api/projects/:id         # Get project by ID
PUT    /api/projects/:id         # Update project
DELETE /api/projects/:id         # Delete project
GET    /api/projects/user/:id    # Get user's projects
```

### Health
```
GET    /api/health               # Health check
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your preferred hosting (Vercel, Netlify, etc.)

### Database
- Use MongoDB Atlas for production
- Configure connection strings and security settings

---

## 📖 Documentation

- [Backend Setup Guide](./docs/BACKEND_SETUP.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [MongoDB Atlas Setup](./docs/MONGODB_ATLAS_SETUP.md)
- [OAuth Setup Guide](./docs/OAUTH_SETUP_GUIDE.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## � Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Inspiration from modern portfolio platforms
- Special thanks to contributors and testers

---

## 📞 Support

If you have any questions or need help, please:
1. Check the [documentation](./docs/)
2. Open an issue on GitHub
3. Contact the maintainers

---

**Made with ❤️ and React**

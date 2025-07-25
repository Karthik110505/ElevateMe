# ElevateMe Database Schema

## Overview
ElevateMe uses MongoDB with Mongoose ODM. The platform connects developers and employers through project showcases.

## Collections

### 1. Users Collection (`users`)

**Purpose**: Store user accounts, profiles, and authentication data

```javascript
{
  _id: ObjectId,
  
  // Authentication
  fullName: String (required),
  email: String (required, unique),
  password: String (hashed),
  userType: "developer" | "employer" (required),
  
  // OAuth Integration
  oauthProvider: "google" | "github" | "linkedin" | null,
  oauthId: String,
  
  // Profile Information
  profilePicture: String (URL),
  bio: String (max 500 chars),
  location: String (max 100 chars),
  website: String (URL),
  
  // Developer-Specific Fields
  skills: [String],
  experience: "entry" | "junior" | "mid" | "senior" | "lead",
  github: String (GitHub username),
  linkedin: String (LinkedIn URL),
  portfolio: String (Portfolio URL),
  
  // Employer-Specific Fields
  company: String,
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+",
  industry: String,
  
  // Account Status
  isEmailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  
  // Verification Tokens
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique)
- `userType`
- `skills` (for developer search)
- `location` (for location-based search)

**Virtual Fields**:
- `projects` - References user's projects

---

### 2. Projects Collection (`projects`)

**Purpose**: Store project information, media, and engagement data

```javascript
{
  _id: ObjectId,
  
  // Basic Project Information
  title: String (required, 3-100 chars),
  description: String (required, 10-1000 chars),
  shortDescription: String (10-200 chars),
  
  // Categorization
  technologies: [String] (required, min 1),
  category: "web-development" | "mobile-development" | "desktop-application" | 
           "data-science" | "machine-learning" | "blockchain" | 
           "game-development" | "devops" | "other",
  tags: [String],
  difficulty: "beginner" | "intermediate" | "advanced" (required),
  status: "in-progress" | "completed" | "on-hold",
  
  // Project Links
  liveUrl: String (URL),
  githubUrl: String (GitHub URL),
  videoUrl: String (Demo video URL),
  
  // Media
  images: [{
    url: String (required),
    caption: String (max 200 chars),
    isMain: Boolean
  }],
  
  // Project Timeline
  startDate: Date,
  endDate: Date,
  duration: String (max 50 chars),
  
  // Ownership & Collaboration
  owner: ObjectId (ref: User, required),
  collaborators: [{
    user: ObjectId (ref: User),
    role: "frontend" | "backend" | "fullstack" | "designer" | "other"
  }],
  
  // Engagement Metrics
  views: Number (default: 0),
  likes: [ObjectId] (ref: User),
  
  // Project Settings
  isPublic: Boolean (default: true),
  featured: Boolean (default: false),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `owner`
- `category`
- `technologies`
- `difficulty`
- `tags`
- `isPublic`
- `featured`
- `createdAt`
- Text index on `title`, `description`, `shortDescription` for search

**Virtual Fields**:
- `likeCount` - Computed from likes array length

**Methods**:
- `incrementViews()` - Increment view count
- `toggleLike(userId)` - Add/remove user like

**Static Methods**:
- `getFeatured(limit)` - Get featured projects
- `searchProjects(query, filters)` - Search with text and filters

---

## Relationships

1. **User → Projects**: One-to-Many
   - One user can own multiple projects
   - Projects populate owner information

2. **User → Project Likes**: Many-to-Many
   - Users can like multiple projects
   - Projects track which users liked them

3. **User → Project Collaborators**: Many-to-Many
   - Users can collaborate on multiple projects
   - Projects can have multiple collaborators

---

## API Endpoints Structure

### Authentication (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- OAuth routes for Google, GitHub, LinkedIn

### Users (`/api/users`)
- `GET /` - List users with filters
- `GET /:id` - Get user profile
- `GET /:id/projects` - Get user's projects
- `GET /search/developers` - Search developers

### Projects (`/api/projects`)
- `GET /` - List projects with filters and search
- `GET /featured` - Get featured projects
- `GET /:id` - Get single project
- `POST /` - Create project (auth required)
- `PUT /:id` - Update project (owner only)
- `DELETE /:id` - Delete project (owner only)
- `PUT /:id/like` - Like/unlike project
- `GET /user/my-projects` - Get current user's projects

---

## Sample Data Structure

### Sample User (Developer)
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "John Developer",
  "email": "john@example.com",
  "userType": "developer",
  "bio": "Full-stack developer passionate about React and Node.js",
  "location": "San Francisco, CA",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "experience": "mid",
  "github": "johndev",
  "linkedin": "https://linkedin.com/in/johndev",
  "profilePicture": "https://example.com/avatar.jpg",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Sample Project
```javascript
{
  "_id": "507f1f77bcf86cd799439022",
  "title": "E-commerce Platform",
  "description": "Full-stack e-commerce platform with React and Node.js",
  "shortDescription": "Modern e-commerce solution with payment integration",
  "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
  "category": "web-development",
  "difficulty": "intermediate",
  "status": "completed",
  "liveUrl": "https://mystore.example.com",
  "githubUrl": "https://github.com/johndev/ecommerce",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "caption": "Homepage design",
      "isMain": true
    }
  ],
  "owner": "507f1f77bcf86cd799439011",
  "views": 245,
  "likes": ["507f1f77bcf86cd799439033", "507f1f77bcf86cd799439044"],
  "isPublic": true,
  "createdAt": "2024-01-20T14:20:00Z"
}
```

---

## Performance Considerations

1. **Indexing**: Proper indexes on frequently queried fields
2. **Population**: Selective field population to reduce data transfer
3. **Pagination**: All list endpoints support pagination
4. **Caching**: Consider Redis for frequently accessed data
5. **Search**: MongoDB text search for project discovery

---

## Security Features

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Input Validation**: Express-validator for all routes
4. **Rate Limiting**: Prevent API abuse
5. **CORS**: Configured for frontend domain
6. **Password Security**: bcrypt hashing with salt

---

## File Upload Strategy

1. **Images**: Cloudinary integration for project images and user avatars
2. **Videos**: Support for external video URLs (YouTube, Vimeo)
3. **Documents**: Future enhancement for project documentation

This schema supports all the features visible in your frontend and provides a solid foundation for scaling the platform.

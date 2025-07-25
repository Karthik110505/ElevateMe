# OAuth Integration Guide for ElevateMe

This guide explains how to implement real third-party authentication with Google, GitHub, and LinkedIn for your ElevateMe platform.

## Frontend Implementation ✅ COMPLETED

The frontend now includes:

- OAuth buttons in both SignupPage and LoginPage
- Proper redirect handling with user type preservation
- OAuth callback component for handling authentication responses
- Error handling and loading states

## Backend Implementation Required

### 1. Install Required Packages

```bash
npm install passport passport-google-oauth20 passport-github2 passport-linkedin-oauth2 express-session
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Session Secret
SESSION_SECRET=your_session_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. OAuth Provider Setup

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`

#### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3001/api/auth/github/callback`

#### LinkedIn OAuth Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add redirect URL: `http://localhost:3001/api/auth/linkedin/callback`

### 4. Backend Routes Structure

```javascript
// routes/auth.js

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const User = require("../models/User"); // Your user model

const router = express.Router();

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Create new user
        const userType = req.session.pendingUserType || "developer";
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          fullName: profile.displayName,
          userType: userType,
          avatar: profile.photos[0].value,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Similar setup for GitHub and LinkedIn...

// Routes
router.get("/google", (req, res, next) => {
  req.session.pendingUserType = req.query.userType;
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET);

    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`
    );
  }
);

// Similar routes for GitHub and LinkedIn...
```

### 5. Database Schema

```javascript
// models/User.js
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String }, // Optional for OAuth users
  userType: { type: String, enum: ["developer", "employer"], required: true },

  // OAuth provider IDs
  googleId: String,
  githubId: String,
  linkedinId: String,

  avatar: String,
  createdAt: { type: Date, default: Date.now },
});
```

### 6. Frontend Integration Points

The frontend is already set up to:

1. **Redirect to OAuth providers** with user type preserved
2. **Handle OAuth callbacks** at `/auth/{provider}/callback`
3. **Store tokens** in localStorage
4. **Redirect users** based on their type (developer/employer)

### 7. Security Considerations

- Use HTTPS in production
- Implement CSRF protection
- Validate OAuth state parameter
- Sanitize user input from OAuth providers
- Implement rate limiting on auth endpoints

### 8. Testing OAuth Flow

1. Start your backend server on port 3001
2. Start your frontend on port 3000
3. Click any OAuth button
4. Complete OAuth flow with provider
5. User should be redirected back and logged in

## Current Frontend Features

✅ OAuth buttons for Google, GitHub, LinkedIn
✅ User type preservation during OAuth flow
✅ Callback handling with loading states
✅ Error handling and user feedback
✅ Token storage and user redirection
✅ Consistent UI design with your teal theme

The frontend is production-ready for OAuth integration. You just need to implement the backend OAuth handlers!

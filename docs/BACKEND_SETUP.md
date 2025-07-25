# ElevateMe Backend Setup Guide

Your backend is now set up! Here's how to get it running:

## 1. Database Setup

You have several options for MongoDB:

### Option A: MongoDB Atlas (Recommended for development) ⭐

**Step-by-step setup:**

1. **Create Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" and create an account
   - Choose the free tier (M0 Sandbox)

2. **Create Cluster**

   - Choose "Shared" (free tier)
   - Select a cloud provider and region (closest to you)
   - Keep the default cluster name or rename it
   - Click "Create Cluster"

3. **Create Database User**

   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `elevateme-user` (or any name you prefer)
   - Generate a secure password (save it!)
   - Set role to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**

   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add your specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Clusters" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `elevateme`

**Example connection string:**

```
mongodb+srv://elevateme-user:<password>@cluster0.abc123.mongodb.net/elevateme?retryWrites=true&w=majority
```

### Option B: Install MongoDB locally

```bash
# For Ubuntu/Debian
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option C: Use Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 2. Environment Configuration

**Update your `.env` file in the backend directory with your MongoDB Atlas connection:**

```env
# Database connection - MongoDB Atlas
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.abc123.mongodb.net/elevateme?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Optional: OAuth providers (set up later if needed)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**⚠️ Important Security Notes:**

- Never commit your `.env` file to version control
- Use strong, unique passwords for your database user
- For production, restrict IP access to your server's IP only

## 3. Start the Backend

```bash
cd backend
npm run dev
```

The server will start on http://localhost:3001

## 4. Test the API

Test the health endpoint:

```bash
curl http://localhost:3001/api/health
```

## 5. Next Steps

1. Set up OAuth providers (see OAUTH_SETUP_GUIDE.md)
2. Set up Cloudinary for image uploads
3. Update your frontend to connect to the backend
4. Test user registration and login

## Available Endpoints

- **Health Check**: `GET /api/health`
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Projects**: `/api/projects/*`

Check the README.md for detailed API documentation.

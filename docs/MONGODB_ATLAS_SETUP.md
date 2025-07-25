# 🌐 MongoDB Atlas Setup Guide for ElevateMe

## Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**

   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" or "Start Free"

2. **Sign Up**
   - Create account with email or sign up with Google
   - Verify your email if required

## Step 2: Create Your First Cluster

1. **Choose Deployment Option**

   - Select "Shared" (Free tier - M0 Sandbox)
   - Perfect for development and small projects

2. **Cloud Provider & Region**

   - Choose a provider (AWS, Google Cloud, or Azure)
   - Select region closest to you for better performance
   - Keep default settings

3. **Cluster Configuration**
   - Cluster Name: `ElevateMe-Cluster` (or keep default)
   - Click "Create Cluster"
   - Wait 3-5 minutes for cluster creation

## Step 3: Create Database User

1. **Navigate to Database Access**

   - In left sidebar, click "Database Access"
   - Click "Add New Database User"

2. **User Configuration**
   - Authentication Method: "Password"
   - Username: `elevateme-admin`
   - Password: Click "Autogenerate Secure Password" (copy and save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

## Step 4: Configure Network Access

1. **Navigate to Network Access**

   - In left sidebar, click "Network Access"
   - Click "Add IP Address"

2. **For Development (Choose Option A or B)**

   **Option A: Allow from Anywhere (Easy for development)**

   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - Comment: "Development - Allow All"

   **Option B: Add Current IP (More Secure)**

   - Click "Add Current IP Address"
   - Your IP will be auto-filled
   - Comment: "My Development Machine"

3. **Confirm**
   - Click "Confirm"
   - Wait for status to become "Active"

## Step 5: Get Connection String

1. **Connect to Cluster**

   - Go back to "Clusters" (or "Database" in newer UI)
   - Click "Connect" button on your cluster

2. **Choose Connection Method**

   Atlas offers several ways to connect to your database:

   ### 🚀 **For Application Development (Recommended for ElevateMe)**

   **Drivers** - Access your Atlas data using MongoDB's native drivers

   - Select "Connect your application"
   - Driver: "Node.js"
   - Version: "4.1 or later"
   - This gives you the connection string for your backend code

   ### 🧭 **For Data Exploration and Management**

   **Compass** - Explore, modify, and visualize your data with MongoDB's GUI

   - Download and install MongoDB Compass
   - Great for browsing your database visually
   - Perfect for debugging and data inspection

   **Shell** - Quickly add & update data using MongoDB's command-line interface

   - Use MongoDB's JavaScript shell
   - Execute database commands directly
   - Useful for quick data operations

   **MongoDB for VS Code** - Work with your data directly from VS Code

   - Install MongoDB extension for VS Code
   - Browse and edit data without leaving your editor
   - Integrated development experience

   ### 📊 **For Data Analysis**

   **Atlas SQL** - Connect SQL tools to Atlas for data analysis and visualization

   - Use familiar SQL syntax with MongoDB data
   - Connect BI tools like Tableau, Power BI
   - Great for reporting and analytics

3. **For ElevateMe Setup - Choose "Drivers"**

   - Select "Connect your application"
   - Copy the connection string provided

4. **Copy Connection String**

   - You'll see something like:

   ```
   mongodb+srv://elevateme-admin:<password>@elevateme-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Modify the Connection String**
   - Replace `<password>` with your actual database user password
   - Add database name before the `?` like this:
   ```
   mongodb+srv://elevateme-admin:your-actual-password@elevateme-cluster.abc123.mongodb.net/elevateme?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. **Open your .env file** in the backend directory

2. **Update MONGODB_URI** with your connection string:

   ```env
   MONGODB_URI=mongodb+srv://elevateme-admin:your-actual-password@elevateme-cluster.abc123.mongodb.net/elevateme?retryWrites=true&w=majority
   ```

3. **Save the file**

## Step 7: Test the Connection

```bash
# Navigate to backend directory
cd backend

# Test the connection
node setup-config.js --test-connection

# If successful, start your server
npm run dev
```

## Step 8: Verify Everything Works

1. **Check server startup logs** - should see "MongoDB Connected"

2. **Test the API**:

   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Expected response**:
   ```json
   {
     "status": "OK",
     "message": "ElevateMe Backend is running",
     "timestamp": "2025-07-19T..."
   }
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **"querySrv ENOTFOUND" or "failed to connect"**

   This error typically means there's an issue with your connection string format or network settings:

   **Check Connection String Format:**
   ```bash
   # ❌ Wrong - missing database name
   mongodb+srv://user:pass@cluster.abc123.mongodb.net/?retryWrites=true&w=majority
   
   # ✅ Correct - includes /elevateme database name
   mongodb+srv://user:pass@cluster.abc123.mongodb.net/elevateme?retryWrites=true&w=majority
   ```

   **Common Fixes:**
   - Ensure you have `/elevateme` before the `?` in your connection string
   - Check that your .env file has only ONE `MONGODB_URI=` line
   - Verify your cluster name matches what's in Atlas
   - Make sure there are no extra spaces or line breaks in the connection string

2. **"MongoNetworkError: failed to connect"**

   - Check your IP is whitelisted in Network Access
   - Verify your internet connection
   - Try "Allow Access from Anywhere" temporarily

3. **"Authentication failed"**

   - Double-check username and password in connection string
   - Make sure you're using the database user (not Atlas account) credentials

4. **"Cannot connect to cluster"**

   - Wait a few minutes - clusters take time to become active
   - Check cluster status in Atlas dashboard

5. **"Database name error"**
   - Make sure you added `/elevateme` before the `?` in connection string

6. **".env file issues"**
   - Ensure no duplicate `MONGODB_URI` lines
   - Remove any comments or extra text on the same line as `MONGODB_URI`
   - Check for proper formatting: `MONGODB_URI=your-connection-string`

### Still Having Issues?

1. **Check Atlas Status**: [status.cloud.mongodb.com](https://status.cloud.mongodb.com)
2. **Review Connection String**: Ensure no extra spaces or characters
3. **Test from Atlas**: Use "Connect" > "MongoDB Compass" to test connection

## 🎉 Success!

Once connected, your ElevateMe backend will automatically:

- Create the necessary database collections
- Handle user authentication
- Store projects and user data
- Provide all API endpoints for your frontend

Your MongoDB Atlas setup is complete! The free tier gives you:

- 512 MB storage
- Shared RAM and vCPU
- No time limit
- Perfect for development and small applications

## 🔌 Additional Connection Methods

Once your cluster is set up, you can connect to it in multiple ways depending on your needs:

### 🖥️ **MongoDB Compass (GUI Tool)**

Perfect for visual database management and exploration.

1. **Download**: [MongoDB Compass](https://www.mongodb.com/products/compass)
2. **Connect**: Use the same connection string from Step 5
3. **Features**:
   - Visual query builder
   - Index management
   - Performance monitoring
   - Schema analysis

### 🔧 **MongoDB Shell (Command Line)**

Great for quick database operations and scripting.

1. **Install**: [MongoDB Shell](https://www.mongodb.com/docs/mongodb-shell/install/)
2. **Connect**:
   ```bash
   mongosh "mongodb+srv://elevateme-admin:your-password@elevateme-cluster.abc123.mongodb.net/elevateme"
   ```
3. **Use Cases**:
   - Quick data queries
   - Database administration
   - Bulk operations
   - Testing queries

### 🔌 **VS Code Extension**

Work with MongoDB directly in your development environment.

1. **Install**: Search "MongoDB" in VS Code extensions
2. **Connect**: Add your connection string to the extension
3. **Benefits**:
   - Browse collections without leaving VS Code
   - Execute queries in editor
   - IntelliSense for MongoDB operations
   - Integrated with your development workflow

### 📊 **Atlas SQL Interface**

Query MongoDB using familiar SQL syntax.

1. **Access**: Through Atlas UI → Data Services → Atlas SQL
2. **Use Cases**:
   - Connect BI tools (Tableau, Power BI, Looker)
   - Generate reports
   - Data analysis with SQL
   - Integration with existing SQL workflows

### 🔗 **Connection Tips**

- **Development**: Use Compass or VS Code extension for data exploration
- **Production**: Stick to application drivers for your backend
- **Analysis**: Use Atlas SQL for reporting and BI tools
- **Administration**: Use MongoDB Shell for bulk operations

Choose the connection method that best fits your current task!

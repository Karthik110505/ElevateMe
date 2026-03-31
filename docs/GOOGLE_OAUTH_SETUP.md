# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth 2.0 authentication for ElevateMe.

## Prerequisites
- Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top left
3. Click "NEW PROJECT"
4. Name it "ElevateMe" (or similar)
5. Click "CREATE"
6. Wait for the project to be created

### 2. Enable Google+ API

1. In the Cloud Console, search for "Google+ API" in the search bar
2. Click on "Google+ API"
3. Click the "ENABLE" button
4. Wait for it to be enabled

### 3. Create OAuth 2.0 Credentials

1. In the Cloud Console, go to **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**
4. If prompted, configure the OAuth consent screen first:
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External" user type
   - Fill in the required fields:
     - App name: `ElevateMe`
     - User support email: Your email
     - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - For scopes, add: `email`, `profile`
   - Click "SAVE AND CONTINUE"
   - Review and click "BACK TO DASHBOARD"

5. Back to credentials, click **+ CREATE CREDENTIALS** again
6. Select **OAuth client ID**
7. Choose **Web application**
8. Fill in the details:
   - Name: `ElevateMe Web Client`

### 4. Add Authorized Redirect URIs

In the "Authorized redirect URIs" section, add:

**For Development:**
```
http://localhost:3001/api/auth/google/callback
```

**For Production (update when deploying):**
```
https://yourdomain.com/api/auth/google/callback
```

Click "CREATE"

### 5. Copy Your Credentials

1. A modal will appear with your Client ID and Client Secret
2. Copy both values
3. Or click on the OAuth 2.0 Client ID you just created to view them again

### 6. Update Your .env File

In `backend/.env`, replace:
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

With your actual credentials from Google Cloud Console:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxx
```

### 7. Test OAuth Flow

1. Start your backend server: `npm run dev`
2. Start your frontend: `npm run dev`
3. Navigate to the signup page
4. Click "Continue with Google"
5. You should be redirected to Google login

## Troubleshooting

### "Missing required parameter: client_id" Error
- Check that `GOOGLE_CLIENT_ID` is correctly set in `.env`
- Make sure to restart the backend after updating `.env`

### "Access blocked: Authorisation error" Error
- Verify the Client ID and Client Secret are correct
- Check that your redirect URI matches in Google Cloud Console
- For development, ensure `http://localhost:3001/api/auth/google/callback` is added

### Redirect URI Mismatch Error
- In Google Cloud Console, go to Credentials
- Click on your OAuth 2.0 Client ID
- Verify the "Authorized redirect URIs" matches your app's callback URL
- Common URLs:
  - Development: `http://localhost:3001/api/auth/google/callback`
  - Production: `https://yourdomain.com/api/auth/google/callback`

### Still Getting Errors?
1. Restart the backend server after changing `.env`
2. Clear browser cache and cookies
3. Check the backend console logs for detailed error messages
4. Verify Google Cloud Console shows your project is selected (top left)

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file with real credentials to version control
- Keep your `GOOGLE_CLIENT_SECRET` confidential
- Use environment variables in production, never hardcode credentials
- Rotate your credentials periodically

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth2 for Web Servers](https://developers.google.com/identity/protocols/oauth2/web-server)

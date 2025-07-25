const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const router = express.Router();

// OAuth clients
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, userType } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      userType,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
          },
        });
      }
    );
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// @route   POST /api/auth/signup
// @desc    Register user (alias for register)
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, userType } = req.body;

    // Validation
    if (!fullName || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      userType,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
          },
        });
      }
    );
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check for user
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get("/google", (req, res) => {
  const { userType } = req.query;

  // Store userType in session or pass as state
  const state = Buffer.from(JSON.stringify({ userType })).toString("base64");

  const authUrl =
    `https://accounts.google.com/o/oauth2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(
      "http://localhost:3001/api/auth/google/callback"
    )}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent("profile email")}&` +
    `state=${state}`;

  res.redirect(authUrl);
});

// @route   GET /api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    // Parse state to get userType
    let userType = "developer";
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, "base64").toString());
        userType = stateData.userType || "developer";
      } catch (e) {
        console.log("Error parsing state:", e.message);
      }
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `http://localhost:3001/api/auth/google/callback`,
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const profile = profileResponse.data;
    const { email, name, picture } = profile;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        fullName: name,
        email,
        userType: userType || "developer",
        oauthProvider: "google",
        oauthId: profile.id,
        profilePicture: picture,
      });
      await user.save();
    } else {
      // Update existing user with OAuth info if not already set
      if (!user.oauthProvider) {
        user.oauthProvider = "google";
        user.oauthId = profile.id;
        if (picture) user.profilePicture = picture;
        await user.save();
      }
    }

    // Create JWT payload
    const jwtPayload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    };

    // Sign JWT
    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
      (err, jwtToken) => {
        if (err) {
          console.error("JWT signing error:", err);
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=authentication_failed`
          );
        }

        // Redirect to frontend with token and user data as URL params
        const userData = encodeURIComponent(
          JSON.stringify({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
            profilePicture: user.profilePicture,
          })
        );

        res.redirect(
          `${process.env.FRONTEND_URL}/auth/success?token=${jwtToken}&user=${userData}`
        );
      }
    );
  } catch (error) {
    console.error("Google OAuth error:", error.message);
    if (error.response) {
      console.error(
        "Google API Error:",
        error.response.status,
        error.response.data
      );
    }
    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/login?error=oauth_failed&message=${encodeURIComponent(error.message)}`
    );
  }
});

// @route   GET /api/auth/linkedin
// @desc    Initiate LinkedIn OAuth
// @access  Public
router.get("/linkedin", (req, res) => {
  const { userType } = req.query;

  const state = Buffer.from(JSON.stringify({ userType })).toString("base64");

  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(
      process.env.FRONTEND_URL + "/auth/linkedin/callback"
    )}&` +
    `scope=r_liteprofile%20r_emailaddress&` +
    `state=${state}`;

  res.redirect(authUrl);
});

// @route   POST /api/auth/linkedin/callback
// @desc    Handle LinkedIn OAuth callback
// @access  Public
router.post("/linkedin/callback", async (req, res) => {
  try {
    const { code, state } = req.body;

    // Parse state to get userType
    let userType = "developer";
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, "base64").toString());
        userType = stateData.userType || "developer";
      } catch (e) {
        console.log("Error parsing state:", e.message);
      }
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.FRONTEND_URL}/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress,profilePicture(displayImage~:playableStreams))",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const profile = profileResponse.data;
    const email = profile.emailAddress;
    const fullName = `${profile.firstName.localized.en_US} ${profile.lastName.localized.en_US}`;
    const profilePicture =
      profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]
        ?.identifier || null;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        fullName,
        email,
        userType: userType || "developer",
        oauthProvider: "linkedin",
        oauthId: profile.id,
        profilePicture,
      });
      await user.save();
    } else {
      // Update existing user with OAuth info if not already set
      if (!user.oauthProvider) {
        user.oauthProvider = "linkedin";
        user.oauthId = profile.id;
        if (profilePicture) user.profilePicture = profilePicture;
        await user.save();
      }
    }

    // Create JWT payload
    const jwtPayload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    };

    // Sign JWT
    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
      (err, jwtToken) => {
        if (err) throw err;
        res.json({
          success: true,
          token: jwtToken,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
            profilePicture: user.profilePicture,
          },
        });
      }
    );
  } catch (error) {
    console.error("LinkedIn OAuth error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during LinkedIn authentication",
    });
  }
});

// @route   GET /api/auth/github
// @desc    Initiate GitHub OAuth
// @access  Public
router.get("/github", (req, res) => {
  const { userType } = req.query;

  const state = Buffer.from(JSON.stringify({ userType })).toString("base64");

  const authUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(
      process.env.FRONTEND_URL + "/auth/github/callback"
    )}&` +
    `scope=user:email&` +
    `state=${state}`;

  res.redirect(authUrl);
});

// @route   POST /api/auth/github/callback
// @desc    Handle GitHub OAuth callback
// @access  Public
router.post("/github/callback", async (req, res) => {
  try {
    const { code, state } = req.body;

    // Parse state to get userType
    let userType = "developer";
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, "base64").toString());
        userType = stateData.userType || "developer";
      } catch (e) {
        console.log("Error parsing state:", e.message);
      }
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });

    // Get user email (GitHub emails might be private)
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `token ${access_token}`,
        },
      }
    );

    const profile = profileResponse.data;
    const emails = emailResponse.data;
    const primaryEmail =
      emails.find((email) => email.primary)?.email || emails[0]?.email;

    if (!primaryEmail) {
      return res.status(400).json({
        success: false,
        message: "No email found in GitHub account",
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: primaryEmail });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        fullName: profile.name || profile.login,
        email: primaryEmail,
        userType: userType || "developer",
        oauthProvider: "github",
        oauthId: profile.id.toString(),
        profilePicture: profile.avatar_url,
      });
      await user.save();
    } else {
      // Update existing user with OAuth info if not already set
      if (!user.oauthProvider) {
        user.oauthProvider = "github";
        user.oauthId = profile.id.toString();
        if (profile.avatar_url) user.profilePicture = profile.avatar_url;
        await user.save();
      }
    }

    // Create JWT payload
    const jwtPayload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    };

    // Sign JWT
    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
      (err, jwtToken) => {
        if (err) throw err;
        res.json({
          success: true,
          token: jwtToken,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
            profilePicture: user.profilePicture,
          },
        });
      }
    );
  } catch (error) {
    console.error("GitHub OAuth error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during GitHub authentication",
    });
  }
});

module.exports = router;

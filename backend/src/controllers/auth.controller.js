const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "css_app_default_fallback_jwt_secret_token";
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const isAllowedEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const cleanEmail = email.trim().toLowerCase();

  // Strictly enforce institutional email addresses (*.nits.ac.in or nits.ac.in)
  // Personal accounts like @gmail.com, @yahoo.com, etc. are strictly disallowed.
  const isInstitute =
    /^[a-z0-9_.+-]+@([a-z0-9-]+\.)*nits\.ac\.in$/i.test(cleanEmail) ||
    cleanEmail.endsWith("@cse.nits.ac.in") ||
    cleanEmail.endsWith("@nits.ac.in");

  return isInstitute;
};

const generateUniqueUsername = async (baseName) => {
  let name = baseName.toLowerCase();
  while (await User.findOne({ username: name })) {
    name = `${baseName}${Math.floor(Math.random() * 10000)}`;
  }
  return name;
};

exports.googleAuth = async (req, res) => {
  try {
    let { googleId, email, name, profilePicture, credential } = req.body;

    // Handle Google ID token credential if provided by @react-oauth/google
    if (credential) {
      if (process.env.GOOGLE_CLIENT_ID) {
        try {
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (payload) {
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            profilePicture = payload.picture;
          }
        } catch (err) {
          console.warn("verifyIdToken warning (falling back to payload decode):", err.message);
        }
      }

      // If not yet parsed from ticket, decode the JWT payload
      if (!email && credential.includes(".")) {
        try {
          const base64Url = credential.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
          const payload = JSON.parse(jsonPayload);
          googleId = payload.sub;
          email = payload.email;
          name = payload.name;
          profilePicture = payload.picture;
        } catch (decodeErr) {
          console.error("JWT decode error:", decodeErr);
        }
      }
    }

    if (!googleId || !email || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Google authentication payload incomplete" });
    }

    if (!isAllowedEmail(email)) {
      return res.status(403).json({
        success: false,
        message: "Access restricted: Only official institute email (@cse.nits.ac.in / @nits.ac.in) is allowed. Personal emails like @gmail.com are not permitted.",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername = email.split("@")[0];
      const username = await generateUniqueUsername(baseUsername);

      user = new User({
        googleId,
        email,
        name,
        username,
        profilePicture: profilePicture || "",
        role: "USER", // Every newly registered account starts as USER
      });

      await user.save();
    } else {
      if (profilePicture && user.profilePicture !== profilePicture) {
        user.profilePicture = profilePicture;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    // Return the user from MongoDB with their actual role (USER or ADMIN)
    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!isAllowedEmail(user.email)) {
      return res.status(403).json({
        message: "Access restricted: Only official institute email (@cse.nits.ac.in) is allowed.",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

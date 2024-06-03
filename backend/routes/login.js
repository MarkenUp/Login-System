import express from "express";
import { sql, poolPromise } from "../config/dbConfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import crypto from "crypto";

const router = express.Router();
// eslint-disable-next-line no-undef
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";
// eslint-disable-next-line no-undef
const COOKIE_SECRET = process.env.COOKIE_SECRET || "your_cookie_secret";

router.use(cookieParser(COOKIE_SECRET));

const algorithm = "aes-256-gcm";
const key = crypto.pbkdf2Sync(COOKIE_SECRET, "salt", 100000, 32, "sha256");

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
};

const decrypt = (text) => {
  const [ivHex, encrypted, authTagHex] = text.split(":");
  // eslint-disable-next-line no-undef
  const iv = Buffer.from(ivHex, "hex");
  // eslint-disable-next-line no-undef
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Endpoint to handle user login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Get a connection pool from  the pool promise
    const pool = await poolPromise;

    // Query to check if the user exist with provided username
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(
        `SELECT u.id, u.username, u.password, r.RoleName FROM Users u
            INNER JOIN UserRoles ur ON u.Id = ur.UserId
            INNER JOIN Roles r On ur.RoleId = r.Id 
            WHERE u.Username = @username`
      );

    // Check if user exists
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Extract user data and roles
    const user = result.recordset[0];
    const roles = result.recordset.map((record) => record.RoleName);

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    //Generate JWT token
    const token = jwt.sign({ username: user.username, roles }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set cookies
    res.cookie("token", encrypt(token), {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });
    res.cookie("roles", encrypt(JSON.stringify(roles)), {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });
    res.cookie("userId", encrypt(user.id.toString()), {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });
    res.cookie("username", encrypt(user.username), {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });

    // User authentication successful
    return res.status(200).json({
      message: "Login successful.",
      token,
      roles,
      username: user.username,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error occurred during login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/verifyToken", async (req, res) => {
  try {
    const token = req.cookies.token ? decrypt(req.cookies.token) : null;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Failed to authenticate token" });
      }

      return res.status(200).json({
        message: "Token is valid",
        username: decoded.username,
        roles: decoded.roles,
      });
    });
  } catch (error) {
    console.error("Error occurred during token verification:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
/* 
(async () => {
  // eslint-disable-next-line no-undef
  console.log(process.env.SECRET_KEY);
})(); */

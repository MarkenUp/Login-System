import express from "express";
import { sql, poolPromise } from "../config/dbConfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();
const SECRET_KEY = "your_secret_key";

router.use(cookieParser());

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
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.cookie("roles", JSON.stringify(roles), {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.cookie("userId", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.cookie("username", user.username, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
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
    const token = req.cookies.token;
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

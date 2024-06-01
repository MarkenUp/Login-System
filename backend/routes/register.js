import express from "express";
import { sql, poolPromise } from "../config/dbConfig.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pool = await poolPromise;

    // Check if username already exist
    const userCheckResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (userCheckResult.recordset.legnth > 0) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the User table
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .query(
        "INSERT INTO Users (Username, Password) VALUES (@username, @password)"
      );

    // Get the newly created user's ID
    const userResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT Id FROM Users WHERE Username = @username");

    const userId = userResult.recordset[0].Id;

    const roleResult = await pool
      .request()
      .input("roleName", sql.NVarChar, role)
      .query("SELECT Id FROM Roles WHERE RoleName = @roleName");

    const roleId = roleResult.recordset[0].Id;

    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("roleId", sql.Int, roleId)
      .query(
        "INSERT INTO UserRoles (UserId, RoleId) VALUES (@userId, @roleId)"
      );

    res.status(201).json({ message: "User registered succesfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

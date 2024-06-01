import express from "express";
import { sql, poolPromise } from "../config/dbConfig.js";

const router = express.Router();

router.get("/total", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `
        SELECT COUNT(*) AS total FROM Users u
        INNER JOIN UserRoles ur ON u.Id = ur.UserId
        INNER JOIN Roles r ON ur.RoleId = r.Id
        WHERE r.RoleName = 'User'
      `
    );
    const totalUsers = result.recordset[0].total;
    res.status(200).json({ total: totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/tRole", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT COUNT(*) AS total FROM Roles");
    const totalRoles = result.recordset[0].total;
    res.status(200).json({ total: totalRoles });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `
        SELECT u.Id, u.Username, r.RoleName AS Role
        FROM Users u
        INNER JOIN UserRoles ur ON u.Id = ur.UserId
        INNER JOIN Roles r ON ur.RoleId = r.Id
      `
    );
    const allUsers = result.recordset;
    res.status(200).json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { Username, Role } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Id", sql.Int, id)
      .input("Username", sql.NVarChar, Username)
      .input("Role", sql.NVarChar, Role)
      .query(
        `
          UPDATE Users 
          SET Username = @Username 
          WHERE Id = @Id

          UPDATE UserRoles 
          SET RoleId = (SELECT Id FROM Roles WHERE RoleName = @Role) 
          WHERE UserId = @Id;
        `
      );
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

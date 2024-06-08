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

// Fetch all the client data
router.get("/clients", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Client");
    const allClients = result.recordset;
    res.status(200).json({ clients: allClients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Adding new Client
router.post("/addClient", async (req, res) => {
  const { CompanyName, CompanyAddress, ContactPerson, ContactNumber, Email } =
    req.body;

  if (!CompanyName || !CompanyAddress || !ContactPerson || !ContactNumber) {
    return res
      .status(400)
      .json({ message: "All fields except Email are required." });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("CompanyName", sql.NVarChar, CompanyName)
      .input("CompanyAddress", sql.NVarChar, CompanyAddress)
      .input("ContactPerson", sql.NVarChar, ContactPerson)
      .input("ContactNumber", sql.NVarChar, ContactNumber)
      .input("Email", sql.NVarChar, Email).query(`
        INSERT INTO Client (CompanyName, CompanyAddress, ContactPerson, ContactNumber, Email)
        VALUES (@CompanyName, @CompanyAddress, @ContactPerson, @ContactNumber, @Email)
      `);
    res.status(201).json({ message: "Client added successfully" });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/clients/:id", async (req, res) => {
  const { id } = req.params;
  const { CompanyName, CompanyAddress, ContactPerson, ContactNumber, Email } =
    req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Id", sql.Int, id)
      .input("CompanyName", sql.NVarChar, CompanyName)
      .input("CompanyAddress", sql.NVarChar, CompanyAddress)
      .input("ContactPerson", sql.NVarChar, ContactPerson)
      .input("ContactNumber", sql.NVarChar, ContactNumber)
      .input("Email", sql.NVarChar, Email).query(`
        UPDATE Client 
        SET CompanyName = @CompanyName, CompanyAddress = @CompanyAddress, ContactPerson = @ContactPerson, ContactNumber = @ContactNumber, Email = @Email 
        WHERE Id = @Id 
      `);
    res.status(201).json({ message: "Client edited succesfully" });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Id", sql.Int, id)
      .query("DELETE FROM Client WHERE Id = @Id");
    res.status(200).json({ message: "Client deleted succesfully." });
  } catch (error) {
    console.error("Error deleting memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

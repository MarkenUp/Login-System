import express from "express";
import { sql, poolPromise } from "../config/dbConfig.js";

const router = express.Router();

// Fetch all memos for a specific user
router.get("/memos/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserId", userId)
      .query("SELECT * FROM Memo WHERE UserId = @UserId ORDER BY Date DESC");
    const memos = result.recordset;
    res.status(200).json({ memos });
  } catch (error) {
    console.error("Error fetching memos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new memo
router.post("/memos", async (req, res) => {
  const { UserId, Date, Memo } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserId", UserId)
      .input("Date", Date)
      .input("Memo", Memo)
      .query(
        "INSERT INTO Memo (UserId, Date, Memo) VALUES (@UserId, @Date, @Memo)"
      );
    res.status(201).json({ message: "Memo created succesfully" });
  } catch (error) {
    console.error("Error creating memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch memo for a specific user and date
router.get("/memo/:userId/:date", async (req, res) => {
  const { userId, date } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("Date", sql.Date, date)
      .query(
        "SELECT * FROM Memo WHERE UserId = @UserId AND Date = @Date ORDER BY Date DESC"
      );

    const memo = result.recordset;
    res.status(200).json({ memo });
  } catch (error) {
    console.error("Error fetching memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a memo by id
router.delete("/memos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Id", sql.Int, id)
      .query("DELETE FROM Memo WHERE Id = @Id");
    res.status(200).json({ message: "Memo deleted succesfully" });
  } catch (error) {
    console.error("Error deleting memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update the memo by Id
router.put("/memos/:id", async (req, res) => {
  const { id } = req.params;
  const { Memo, Date } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Id", sql.Int, id)
      .input("Memo", sql.NVarChar, Memo)
      .input("Date", sql.Date, Date)
      .query("UPDATE Memo SET Memo = @Memo, Date = @Date WHERE Id = @Id");

    res.status(200).json({ message: "Memo updated successfully" });
  } catch (error) {
    console.error("Error updating memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

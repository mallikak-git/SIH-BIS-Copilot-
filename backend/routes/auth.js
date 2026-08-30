const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "bis-copilot-secret-key";

/* =========================
   REGISTER
   POST /api/auth/register
========================= */

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email.trim().toLowerCase());

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
      )
      .run(
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword
      );

    const token = jwt.sign(
      {
        userId: result.lastInsertRowid,
        email: email.trim().toLowerCase(),
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: result.lastInsertRowid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});


/* =========================
   LOGIN
   POST /api/auth/login
========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = db
      .prepare(
        "SELECT id, name, email, password FROM users WHERE email = ?"
      )
      .get(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});


module.exports = router;

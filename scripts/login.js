require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change to your MySQL username
  password: "Password123", // Change to your MySQL password
  database: "ministry_app",
});

db.connect((err) => {
  if (err) console.error("Database connection failed: ", err);
  else console.log("Connected to MySQL database");
});

// Secret Key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

// ----------------- RENDER LOGIN & REGISTER PAGES -----------------
app.get("/", (req, res) => {
  res.render("index"); // Render the EJS file for login/register
});

async function register(username, email, password, role) {
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  console.log('login')
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [username, email, hashedPassword, role || "user"], (err, result) => {
      if (err) return res.status(500).json({ error: "Error registering user", details: err });
      res.redirect("/"); // Redirect back to login page
    });
  } catch (error) {
    res.status(500).json({ error: "Error hashing password" });
  }
}

// ----------------- REGISTER ROUTE -----------------
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [username, email, hashedPassword, role || "user"], (err, result) => {
      if (err) return res.status(500).json({ error: "Error registering user", details: err });
      res.redirect("/"); // Redirect back to login page
    });
  } catch (error) {
    res.status(500).json({ error: "Error hashing password" });
  }
});

// ----------------- LOGIN ROUTE -----------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });

    if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    res.redirect("/profile"); // Redirect to profile page
  });
});

// ----------------- PROTECTED PROFILE ROUTE -----------------
app.get("/profile", (req, res) => {
  res.render("profile"); // Render the profile page
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Password123",
  database: "ministry_app",
});

connection.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to MySQL database");
});

module.exports = connection;
const mysql = require('mysql2');


const db = mysql.createConnection({

const connection = mysql.createConnection({

  host: "localhost",
  user: "root",
  password: "Password123",
  database: "ministry_app",
});


db.connect((err) => {
  if (err) console.error("DB connection failed:", err);
  else console.log("Connected to MySQL DB");
});

module.exports = db;

connection.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to MySQL database");
});

module.exports = connection;


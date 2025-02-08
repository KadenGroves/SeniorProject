const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost', // Change this if your database is hosted elsewhere
    user: 'root',
    password: 'Password123',
    database: 'app' // Replace with your actual database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database.\n');

    // Query to get all table names in the database
    const getTablesQuery = `SHOW TABLES`;

    connection.query(getTablesQuery, (err, tables) => {
        if (err) {
            console.error('Error fetching tables:', err);
            connection.end();
            return;
        }

        if (tables.length === 0) {
            console.log('No tables found in the database.');
            connection.end();
            return;
        }

        console.log(`Tables found:`);
        tables.forEach((tableRow, index) => {
            const tableName = Object.values(tableRow)[0]; // Extract table name
            console.log(`${index + 1}. ${tableName}`);
        });

        console.log('\nFetching columns for each table...\n');

        // Fetch columns for each table
        let pendingTables = tables.length;
        tables.forEach((tableRow) => {
            const tableName = Object.values(tableRow)[0]; // Extract table name
            const getColumnsQuery = `SHOW COLUMNS FROM ${tableName}`;

            connection.query(getColumnsQuery, (err, columns) => {
                if (err) {
                    console.error(`Error fetching columns for table ${tableName}:`, err);
                } else {
                    console.log(`Table: ${tableName}`);
                    console.log('----------------------------------');
                    columns.forEach((column) => {
                        console.log(`Field: ${column.Field} | Type: ${column.Type} | Null: ${column.Null} | Key: ${column.Key}`);
                    });
                    console.log('\n');
                }

                // Close connection after processing all tables
                pendingTables--;
                if (pendingTables === 0) {
                    connection.end();
                }
            });
        });
    });
});

module.exports = connection;

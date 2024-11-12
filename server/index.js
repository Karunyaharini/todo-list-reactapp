const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "Apple@123",
    database: 'sys'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to database successfully");
    }
});

// Check for duplicate task
const isDuplicateTask = (task, callback) => {
    const query = 'SELECT * FROM todos WHERE task = ?';
    db.query(query, [task], (err, results) => {
        if (err) {
            console.error("Error checking for duplicate task:", err);
            callback(err, null);
        } else {
            callback(null, results.length > 0); // Return true if duplicates found
        }
    });
};

// Endpoint to add a new task
app.post('/new-task', (req, res) => {
    const task = req.body.task;
    console.log("Received new task:", task);
    
    // Check for duplicate task
    isDuplicateTask(task, (err, exists) => {
        if (err) {
            return res.status(500).send("Server error");
        }
        if (exists) {
            return res.status(400).send("Duplicate task not allowed");
        }

        // Insert new task
        const query = 'INSERT INTO todos (task, createdAt, status) VALUES (?, ?, ?)';
        db.query(query, [task, new Date(), 'active'], (err, result) => {
            if (err) {
                console.error('Failed to store task:', err);
                return res.status(500).send("Failed to store task");
            }
            console.log('Task saved successfully');

            // Fetch updated task list and send it as a response
            const updatedTasksQuery = 'SELECT * FROM todos';
            db.query(updatedTasksQuery, (error, newList) => {
                if (error) {
                    console.error("Failed to fetch updated tasks:", error);
                    return res.status(500).send("Failed to fetch updated tasks");
                }
                res.send(newList); // Return the updated task list
            });
        });
    });
});

// Endpoint to read all tasks
app.get('/read-tasks', (req, res) => {
    const query = 'SELECT * FROM todos';
    db.query(query, (err, result) => {
        if (err) {
            console.error("Failed to read tasks:", err);
            return res.status(500).send("Failed to read tasks");
        }
        console.log("Fetched tasks successfully from database");
        res.send(result);
    });
});

// Endpoint to update a task
app.post('/update-task', (req, res) => {
    const { task, updateId } = req.body;
    console.log("Updating task:", req.body);

    const query = 'UPDATE todos SET task = ? WHERE id = ?';
    db.query(query, [task, updateId], (err, result) => {
        if (err) {
            console.error('Failed to update task:', err);
            return res.status(500).send("Failed to update task");
        }
        console.log('Task updated successfully');

        // Fetch updated task list
        db.query('SELECT * FROM todos', (error, updatedList) => {
            if (error) {
                console.error("Failed to fetch updated tasks:", error);
                return res.status(500).send("Failed to fetch updated tasks");
            }
            res.send(updatedList); // Return the updated task list
        });
    });
});

// Endpoint to delete a task
app.post('/delete-task', (req, res) => {
    const { id } = req.body;
    console.log("Deleting task with ID:", id);

    const query = 'DELETE FROM todos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Failed to delete task:', err);
            return res.status(500).send("Failed to delete task");
        }
        console.log('Task deleted successfully');

        // Fetch updated task list
        db.query('SELECT * FROM todos', (error, newList) => {
            if (error) {
                console.error("Failed to fetch tasks after deletion:", error);
                return res.status(500).send("Failed to fetch updated tasks");
            }
            res.send(newList); // Return the updated task list
        });
    });
});

// Endpoint to mark a task as complete
app.post('/complete-task', (req, res) => {
    const { id } = req.body;
    console.log("Completing task with ID:", id);

    const query = 'UPDATE todos SET status = ? WHERE id = ?';
    db.query(query, ['completed', id], (err, result) => {
        if (err) {
            console.error('Failed to mark task as complete:', err);
            return res.status(500).send("Failed to complete task");
        }
        
        // Fetch updated task list
        db.query('SELECT * FROM todos', (error, newList) => {
            if (error) {
                console.error("Failed to fetch tasks after completion:", error);
                return res.status(500).send("Failed to fetch updated tasks");
            }
            res.send(newList); // Return the updated task list
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

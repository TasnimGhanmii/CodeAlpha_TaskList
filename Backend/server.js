const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Read tasks from tasks.json
function readTasks() {
    const data = fs.readFileSync(path.join(__dirname, 'tasks.json'), 'utf8');
    return JSON.parse(data);
}

// Write tasks to tasks.json
function writeTasks(tasks) {
    fs.writeFileSync(path.join(__dirname, 'tasks.json'), JSON.stringify(tasks, null, 2), 'utf8');
}

// API: Get all tasks
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// API: Add a new task
app.post('/api/tasks', (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Task text is required' });

        const tasks = readTasks();
        const newTask = { id: Date.now().toString(), text, completed: false };
        tasks.push(newTask);
        writeTasks(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// API: Update a task
app.put('/api/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;

        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

        if (text !== undefined) tasks[taskIndex].text = text;
        if (completed !== undefined) tasks[taskIndex].completed = completed;

        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// API: Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;

        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

        const deletedTask = tasks.splice(taskIndex, 1);
        writeTasks(tasks);

        res.json(deletedTask[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
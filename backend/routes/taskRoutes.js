const express = require('express');
const router = express.Router();
const { createTask, getProjectTasks, updateTaskStatus } = require('../controllers/taskController');

// Route to create a task: POST /api/tasks
router.post('/', createTask);

// Route to get all tasks for a project: GET /api/tasks/project/:projectId
router.get('/project/:projectId', getProjectTasks);

// Route to update a task's status: PUT /api/tasks/:taskId
router.put('/:taskId', updateTaskStatus);

module.exports = router;
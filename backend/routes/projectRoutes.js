const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');

// Route to create a project: POST /api/projects
router.post('/', createProject);

// Route to get all projects: GET /api/projects
router.get('/', getProjects);

module.exports = router;
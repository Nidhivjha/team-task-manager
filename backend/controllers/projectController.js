const Project = require('../models/Project');

// 1. CREATE A NEW PROJECT (Admin Only)
exports.createProject = async (req, res) => {
  try {
    const { name, description, userId, userRole } = req.body;

    // Security Check: Verify if the user making this request is an Admin
    if (userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Admins can create projects.' });
    }

    // Create the project and link it to the creator's user ID
    const newProject = new Project({
      name,
      description,
      owner: userId
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully!', project: newProject });

  } catch (error) {
    res.status(500).json({ message: 'Server error creating project', error: error.message });
  }
};

// 2. GET ALL PROJECTS (Everyone can see them)
exports.getProjects = async (req, res) => {
  try {
    // Fetch all projects from the database and populate the 'owner' field with their name and email
    const projects = await Project.find().populate('owner', 'name email');
    res.status(200).json(projects);

  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects', error: error.message });
  }
};
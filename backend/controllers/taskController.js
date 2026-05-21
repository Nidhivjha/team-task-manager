const Task = require('../models/Task');

// 1. CREATE A TASK (Admin Only)
exports.createTask = async (req, res) => {
  try {
    const { title, dueDate, projectId, assignedTo, userRole } = req.body;

    // Security Check: Only Admins can create tasks
    if (userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Admins can create tasks.' });
    }

    const newTask = new Task({
      title,
      dueDate,
      project: projectId,
      assignedTo // The ID of the user this task is given to
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully!', task: newTask });

  } catch (error) {
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};

// 2. GET TASKS FOR A SPECIFIC PROJECT (Everyone)
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find all tasks belonging to this project and populate the assigned user's name
    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');
    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks', error: error.message });
  }
};

// 3. UPDATE TASK STATUS (Admin or Assigned Member)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // e.g., 'In Progress' or 'Completed'

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the status and save
    task.status = status;
    await task.save();

    res.status(200).json({ message: 'Task status updated!', task });

  } catch (error) {
    res.status(500).json({ message: 'Server error updating task', error: error.message });
  }
};
import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all projects (all authenticated users)
router.get('/', getProjects);

// Get single project (all authenticated users)
router.get('/:id', getProjectById);

// Create project (Admin and Manager only)
router.post('/', authorizeRole('Admin', 'Manager'), createProject);

// Update project (Admin and Manager only)
router.put('/:id', authorizeRole('Admin', 'Manager'), updateProject);

// Delete project (Admin only)
router.delete('/:id', authorizeRole('Admin'), deleteProject);

export default router;

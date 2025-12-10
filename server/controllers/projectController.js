import db from '../config/db.js';

// Create new project
export const createProject = async (req, res) => {
    const { name, description, budget, start_date, end_date } = req.body;

    try {
        // Validate input
        if (!name || !budget) {
            return res.status(400).json({ error: 'Project name and budget are required.' });
        }

        const result = await db.query(
            `INSERT INTO projects (name, description, budget, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [name, description, budget, start_date, end_date]
        );

        res.status(201).json({
            message: 'Project created successfully',
            project: result.rows[0]
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Server error creating project.' });
    }
};

// Get all projects
export const getProjects = async (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM projects';
        let params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);

        res.json({
            count: result.rows.length,
            projects: result.rows
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Server error fetching projects.' });
    }
};

// Get single project by ID
export const getProjectById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        res.json({ project: result.rows[0] });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Server error fetching project.' });
    }
};

// Update project
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, budget, spent, progress, status, start_date, end_date } = req.body;

    try {
        // Check if project exists
        const projectCheck = await db.query('SELECT * FROM projects WHERE id = $1', [id]);

        if (projectCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const result = await db.query(
            `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           budget = COALESCE($3, budget),
           spent = COALESCE($4, spent),
           progress = COALESCE($5, progress),
           status = COALESCE($6, status),
           start_date = COALESCE($7, start_date),
           end_date = COALESCE($8, end_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
            [name, description, budget, spent, progress, status, start_date, end_date, id]
        );

        res.json({
            message: 'Project updated successfully',
            project: result.rows[0]
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Server error updating project.' });
    }
};

// Delete project
export const deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        res.json({
            message: 'Project deleted successfully',
            project: result.rows[0]
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Server error deleting project.' });
    }
};

export default { createProject, getProjects, getProjectById, updateProject, deleteProject };

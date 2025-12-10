import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { projectsAPI, insightsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [riskData, setRiskData] = useState({});
    const { hasAnyRole } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: '',
        spent: '0',
        progress: '0',
        status: 'Active',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data.projects);

            // Fetch risk data for each project
            const riskPromises = response.data.projects.map(project =>
                insightsAPI.getProjectRisk(project.id).catch(() => null)
            );
            const riskResults = await Promise.all(riskPromises);

            const riskMap = {};
            riskResults.forEach((result, index) => {
                if (result) {
                    riskMap[response.data.projects[index].id] = result.data;
                }
            });
            setRiskData(riskMap);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProject) {
                await projectsAPI.update(selectedProject.id, formData);
            } else {
                await projectsAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            alert(error.response?.data?.error || 'Failed to save project');
        }
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            budget: project.budget,
            spent: project.spent,
            progress: project.progress,
            status: project.status,
            start_date: project.start_date ? project.start_date.split('T')[0] : '',
            end_date: project.end_date ? project.end_date.split('T')[0] : '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectsAPI.delete(id);
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
                alert(error.response?.data?.error || 'Failed to delete project');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            budget: '',
            spent: '0',
            progress: '0',
            status: 'Active',
            start_date: '',
            end_date: '',
        });
        setSelectedProject(null);
    };

    const getRiskBadgeClass = (level) => {
        switch (level) {
            case 'Critical': return 'badge-danger';
            case 'High': return 'badge-warning';
            case 'Medium': return 'badge-info';
            default: return 'badge-success';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Completed': return 'badge-success';
            case 'On Hold': return 'badge-warning';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-primary';
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="projects-page">
                <div className="container">
                    <div className="page-header">
                        <div>
                            <h1>Projects</h1>
                            <p className="text-muted">Manage your construction projects</p>
                        </div>
                        {hasAnyRole('Admin', 'Manager') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                            >
                                <span>➕</span> New Project
                            </button>
                        )}
                    </div>

                    <div className="projects-grid">
                        {projects.map((project) => {
                            const risk = riskData[project.id];
                            const budgetPercent = (parseFloat(project.spent) / parseFloat(project.budget)) * 100;

                            return (
                                <div key={project.id} className="project-card fade-in">
                                    <div className="project-header">
                                        <h3>{project.name}</h3>
                                        <div className="project-badges">
                                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                                                {project.status}
                                            </span>
                                            {risk && (
                                                <span className={`badge ${getRiskBadgeClass(risk.riskLevel)}`}>
                                                    {risk.riskLevel} Risk
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {project.description && (
                                        <p className="project-description text-muted">{project.description}</p>
                                    )}

                                    <div className="project-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Budget</span>
                                            <span className="stat-value">${parseFloat(project.budget).toLocaleString()}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Spent</span>
                                            <span className="stat-value">${parseFloat(project.spent).toLocaleString()}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Progress</span>
                                            <span className="stat-value">{project.progress}%</span>
                                        </div>
                                    </div>

                                    <div className="progress-bar-container">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-label">{project.progress}% Complete</span>
                                    </div>

                                    <div className="progress-bar-container">
                                        <div className="progress-bar budget-bar">
                                            <div
                                                className="progress-fill budget-fill"
                                                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-label">{budgetPercent.toFixed(1)}% Budget Used</span>
                                    </div>

                                    {project.start_date && (
                                        <div className="project-dates">
                                            <span>📅 {new Date(project.start_date).toLocaleDateString()}</span>
                                            {project.end_date && (
                                                <span>→ {new Date(project.end_date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    )}

                                    {hasAnyRole('Admin', 'Manager') && (
                                        <div className="project-actions">
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleEdit(project)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            {hasAnyRole('Admin') && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(project.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {projects.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🏗️</div>
                            <h3>No Projects Yet</h3>
                            <p className="text-muted">Create your first project to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedProject ? 'Edit Project' : 'New Project'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Project Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Budget ($) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Spent ($)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.spent}
                                        onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Progress (%)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.progress}
                                        onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {selectedProject ? 'Update' : 'Create'} Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Projects;

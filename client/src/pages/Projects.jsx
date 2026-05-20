import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Folder,
  Plus,
  Users,
  Calendar,
  Trash2,
  Edit2,
  FolderOpen,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const createProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(5, 'Project description must be at least 5 characters'),
  status: z.enum(['active', 'completed', 'on_hold']).default('active')
});

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createProjectSchema)
  });

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      if (response.data && response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to retrieve projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    reset();
    setEditId(null);
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    reset();
    setEditId(project._id);
    setValue('title', project.title);
    setValue('description', project.description);
    setValue('status', project.status);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editId) {
        const response = await API.put(`/projects/${editId}`, data);
        if (response.data.success) {
          toast.success('Project updated successfully!');
        }
      } else {
        const response = await API.post('/projects', data);
        if (response.data.success) {
          toast.success('Project created successfully!');
        }
      }
      setModalOpen(false);
      reset();
      fetchProjects();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? All associated tasks will remain or require migration.')) {
      return;
    }

    try {
      const response = await API.delete(`/projects/${id}`);
      if (response.data.success) {
        toast.success('Project deleted successfully!');
        fetchProjects();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-44 bg-dark-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-dark-800 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-dark-900 border border-dark-800 rounded-xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? 'Manage projects, assign teams, and review roadmap timelines.' : 'View your assigned project workspace portals.'}
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreateModal} className="btn-primary shrink-0 self-start sm:self-auto">
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center text-slate-500 max-w-xl mx-auto mt-10">
          <Folder className="w-12 h-12 text-dark-700 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-300">No Projects Found</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm">
            {isAdmin
              ? 'Get started by creating your very first project workspace and adding team members.'
              : 'You are currently not assigned to any projects. Please contact your workspace Admin.'}
          </p>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn-primary mt-6">
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="glass-card glass-card-hover p-6 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Card top details */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                    <FolderOpen className="w-5.5 h-5.5" />
                  </div>
                  
                  {/* Status Pill */}
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                    project.status === 'completed'
                      ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                      : project.status === 'on_hold'
                      ? 'bg-yellow-950/20 text-yellow-500 border-yellow-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="font-bold text-lg text-slate-100 group-hover:text-white transition-colors block leading-snug"
                >
                  {project.title}
                </Link>
                <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Card Footer details */}
              <div className="border-t border-dark-800/60 pt-4 mt-5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5" title={`${project.members?.length || 0} Team Members`}>
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-300">
                    {project.members?.length || 0} members
                  </span>
                </div>

                {/* Card admin actions */}
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1.5 rounded hover:bg-dark-800 hover:text-white transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="p-1.5 rounded hover:bg-rose-950/30 hover:text-rose-400 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <Link
                    to={`/projects/${project._id}`}
                    className="p-1.5 rounded hover:bg-dark-800 hover:text-slate-200 transition-colors"
                    title="Open Project Hub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Create/Edit Project */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          
          <div className="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-xl shadow-glow z-10 p-6 sm:p-8 animate-fadeIn relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Folder className="w-5.5 h-5.5 text-white" />
              {editId ? 'Edit Project Settings' : 'Create New Project Workspace'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Project Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Dashboard Redesign"
                  disabled={submitting}
                  className={`input-field ${errors.title ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="A short overview explaining the business requirements, target goals, and scope of work..."
                  rows={4}
                  disabled={submitting}
                  className={`input-field resize-none ${errors.description ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Project Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Status State
                </label>
                <select
                  disabled={submitting}
                  className="input-field"
                  {...register('status')}
                >
                  <option value="active">Active (In Development)</option>
                  <option value="completed">Completed (Archived)</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-dark-800/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2 px-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editId ? 'Save Changes' : 'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

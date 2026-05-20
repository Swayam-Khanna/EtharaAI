import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckSquare,
  Plus,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  X,
  Loader2,
  Inbox,
  Filter,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(3, 'Task description must be at least 3 characters'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['Todo', 'In Progress', 'Done']).default('Todo'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid due date'
  }),
  assignedTo: z.string().min(1, 'Please assign this task to a user'),
  project: z.string().min(1, 'Please select a project')
});

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProjectId, setFilterProjectId] = useState('');
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
    resolver: zodResolver(createTaskSchema)
  });

  const fetchData = async () => {
    try {
      // Build tasks API url with filter
      let tasksUrl = '/tasks';
      if (filterProjectId) {
        tasksUrl += `?projectId=${filterProjectId}`;
      }

      const tasksRes = await API.get(tasksUrl);
      const projectsRes = await API.get('/projects');

      if (tasksRes.data && tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
      if (projectsRes.data && projectsRes.data.success) {
        setProjects(projectsRes.data.data);
      }

      // If Admin, fetch all users for the assignee dropdown selection
      if (isAdmin) {
        const usersRes = await API.get('/users');
        if (usersRes.data && usersRes.data.success) {
          setUsersList(usersRes.data.data);
        }
      }
    } catch (error) {
      console.error('[Tasks] Error retrieving workspace data:', error.message);
      toast.error('Failed to load workspace tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterProjectId]);

  const openCreateModal = () => {
    reset();
    setEditId(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    reset();
    setEditId(task._id);
    setValue('title', task.title);
    setValue('description', task.description);
    setValue('priority', task.priority);
    setValue('status', task.status);
    setValue('project', task.project?._id);
    setValue('assignedTo', task.assignedTo?._id);
    
    // Format date string to YYYY-MM-DD for form input
    if (task.dueDate) {
      const formattedDate = new Date(task.dueDate).toISOString().split('T')[0];
      setValue('dueDate', formattedDate);
    }
    
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editId) {
        const response = await API.put(`/tasks/${editId}`, data);
        if (response.data.success) {
          toast.success('Task updated successfully!');
        }
      } else {
        const response = await API.post('/tasks', data);
        if (response.data.success) {
          toast.success('Task created successfully!');
        }
      }
      setModalOpen(false);
      reset();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task permanently?')) return;

    try {
      const response = await API.delete(`/tasks/${id}`);
      if (response.data.success) {
        toast.success('Task deleted successfully!');
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (id, newStatus, assignedToId) => {
    // Member verification
    if (!isAdmin && assignedToId !== user?.id) {
      toast.error('Forbidden: You can only update tasks assigned to you');
      return;
    }

    try {
      // Put status change
      const response = await API.put(`/tasks/${id}`, { status: newStatus });
      if (response.data.success) {
        toast.success('Task status updated!');
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change task status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-44 bg-dark-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-dark-800 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-dark-900 border border-dark-800 rounded-xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  // Group tasks by status swimlanes
  const swimlanes = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Task Board</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? 'Manage task deliverables, status swimlanes, and workload assignments.' : 'Review and update status on your assigned tasks.'}
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreateModal} className="btn-primary shrink-0 self-start sm:self-auto">
            <Plus className="w-5 h-5" />
            New Task
          </button>
        )}
      </div>

      {/* Filter and Overview portal */}
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-dark-900/30">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold shrink-0">
          <Filter className="w-4 h-4 text-slate-500" />
          Filter by Project:
        </div>
        <select
          value={filterProjectId}
          onChange={(e) => setFilterProjectId(e.target.value)}
          className="bg-dark-950 border border-dark-850 text-slate-100 rounded-lg text-xs px-3 py-2 w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board Grid */}
      <div className="flex flex-col lg:flex-row lg:overflow-x-auto gap-6 items-start pb-6 scrollbar-thin">
        {Object.entries(swimlanes).map(([laneTitle, laneTasks]) => (
          <div key={laneTitle} className="swimlane w-full lg:w-[360px] lg:shrink-0">
            {/* Lane Header */}
            <div className="flex items-center justify-between pb-2 border-b border-dark-800/60 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  laneTitle === 'Done'
                    ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                    : laneTitle === 'In Progress'
                    ? 'bg-slate-300'
                    : 'bg-slate-600'
                }`}></span>
                <span className="font-bold text-sm text-slate-200 uppercase tracking-wider">{laneTitle}</span>
              </div>
              <span className="text-xs text-slate-500 bg-dark-900 border border-dark-800 px-2 py-0.5 rounded-full font-bold">
                {laneTasks.length}
              </span>
            </div>

            {/* Lane Cards */}
            <div className="space-y-3.5 overflow-y-auto max-h-[600px] pr-0.5 py-1">
              {laneTasks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-dark-800 rounded-lg text-slate-500 text-xs">
                  Empty Lane
                </div>
              ) : (
                laneTasks.map((task) => {
                  const assignedToMe = task.assignedTo?._id === user?.id;
                  const canChangeStatus = isAdmin || assignedToMe;
                  const daysRemaining = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const overdue = task.status !== 'Done' && daysRemaining < 0;

                  return (
                    <div
                      key={task._id}
                      className="bg-dark-900/80 border border-dark-800 p-4.5 rounded-xl shadow-md hover:border-white/20 transition-all duration-300 flex flex-col justify-between gap-4 group"
                    >
                      <div>
                        {/* Priority / Project Header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-dark-950 border border-dark-850 px-2 py-0.5 rounded truncate max-w-[120px]" title={task.project?.title}>
                            {task.project?.title}
                          </span>

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                            task.priority === 'High'
                              ? 'bg-rose-950/20 text-rose-400 border-rose-500/25'
                              : task.priority === 'Medium'
                              ? 'bg-yellow-950/20 text-yellow-500 border-yellow-500/25'
                              : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/25'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-sm text-slate-200 mt-3 group-hover:text-white transition-colors leading-snug">
                          {task.title}
                        </h4>
                        
                        {/* Description */}
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      </div>

                      {/* Card Footer Detail Row */}
                      <div className="border-t border-dark-800/60 pt-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          {/* Calendar Countdown */}
                          <div className="flex items-center gap-1">
                            <Clock className={`w-3.5 h-3.5 ${overdue ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                            <span className={overdue ? 'text-rose-400 font-bold' : ''}>
                              {overdue ? 'Overdue!' : new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Assignee Initial badge */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                              {task.assignedTo?.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[80px]" title={task.assignedTo?.name}>
                              {task.assignedTo?.name}
                            </span>
                          </div>
                        </div>

                        {/* Action status select dropdown / admin tools */}
                        <div className="flex items-center justify-between gap-2 border-t border-dark-800/40 pt-2.5">
                          {/* Status select container */}
                          <div className="flex items-center gap-1.5 w-full">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value, task.assignedTo?._id)}
                              disabled={!canChangeStatus}
                              className={`text-[10px] bg-dark-950 border border-dark-800 text-slate-200 rounded-md px-2 py-1.5 w-full focus:outline-none ${
                                !canChangeStatus ? 'opacity-65 cursor-not-allowed' : 'hover:border-slate-500'
                              }`}
                              title={!canChangeStatus ? 'Only task assignee can change status' : 'Move status'}
                            >
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>

                          {/* Admin tools */}
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1.5 rounded hover:bg-dark-800 hover:text-white transition-colors shrink-0"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(task._id)}
                                className="p-1.5 rounded hover:bg-rose-950/30 hover:text-rose-400 transition-colors shrink-0"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Create/Edit Task */}
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
              <CheckSquare className="w-5.5 h-5.5 text-brand-400" />
              {editId ? 'Modify Task Details' : 'Create Work Deliverable'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Select Project */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Linked Project
                </label>
                <select
                  disabled={submitting}
                  className="input-field py-2 text-xs"
                  {...register('project')}
                >
                  <option value="">-- Choose Project Portal --</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {errors.project && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{errors.project.message}</p>
                )}
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Implement Oauth verification"
                  disabled={submitting}
                  className={`input-field py-2 text-xs ${errors.title ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description Details
                </label>
                <textarea
                  placeholder="Provide structured guidelines on key task requirements and expected code outputs..."
                  rows={3}
                  disabled={submitting}
                  className={`input-field resize-none py-2 text-xs ${errors.description ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Dual grid for priority / status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Priority Tier
                  </label>
                  <select
                    disabled={submitting}
                    className="input-field py-2 text-xs"
                    {...register('priority')}
                  >
                    <option value="Low">Low (Backburner)</option>
                    <option value="Medium">Medium (Active)</option>
                    <option value="High">High (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Starting Status
                  </label>
                  <select
                    disabled={submitting}
                    className="input-field py-2 text-xs"
                    {...register('status')}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Dual grid for due date / assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Due Date Target
                  </label>
                  <input
                    type="date"
                    disabled={submitting}
                    className={`input-field py-2 text-xs ${errors.dueDate ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                    {...register('dueDate')}
                  />
                  {errors.dueDate && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">{errors.dueDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Assignee recipient
                  </label>
                  <select
                    disabled={submitting}
                    className="input-field py-2 text-xs"
                    {...register('assignedTo')}
                  >
                    <option value="">-- Choose Team Member --</option>
                    {usersList.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">{errors.assignedTo.message}</p>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-dark-800/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2 px-6 text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editId ? 'Save Changes' : 'Create Task'
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

export default Tasks;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Folder,
  Calendar,
  Users,
  CheckSquare,
  ArrowLeft,
  UserPlus,
  Trash2,
  AlertTriangle,
  Clock,
  Layers,
  Inbox,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    try {
      // Fetch Project details
      const projectRes = await API.get(`/projects/${id}`);
      if (projectRes.data && projectRes.data.success) {
        setProject(projectRes.data.data);
      }

      // Fetch Project Tasks
      const tasksRes = await API.get(`/tasks?projectId=${id}`);
      if (tasksRes.data && tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
    } catch (error) {
      console.error('[ProjectDetails] Error loading data:', error.message);
      toast.error(error.message || 'Failed to retrieve project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setAddingMember(true);
    try {
      const response = await API.post(`/projects/${id}/members`, { email: emailInput });
      if (response.data && response.data.success) {
        toast.success('Team member added successfully!');
        setProject(response.data.data); // Update project members list
        setEmailInput('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      const response = await API.delete(`/projects/${id}/members/${memberId}`);
      if (response.data && response.data.success) {
        toast.success('Team member removed successfully!');
        setProject(response.data.data); // Update project members list
      }
    } catch (error) {
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-dark-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="h-96 bg-dark-900 border border-dark-800 rounded-xl lg:col-span-2 shimmer"></div>
          <div className="h-96 bg-dark-900 border border-dark-800 rounded-xl shimmer"></div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Task summary count helper
  const taskSummary = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Todo').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link to="/projects" className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects List
        </Link>
      </div>

      {/* Project Banner & Meta Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-dark-800/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{project.title}</h1>
            
            {/* Status Badge */}
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border mt-1 shrink-0 ${
              project.status === 'completed'
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                : project.status === 'on_hold'
                ? 'bg-yellow-950/20 text-yellow-500 border-yellow-500/20'
                : 'bg-white/5 text-slate-300 border-white/10'
            }`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-2.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Created on {new Date(project.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* Project Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main description and tasks panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="glass-card p-6 sm:p-8">
            <h3 className="font-bold text-base text-slate-200 mb-3.5">Project Overview</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Task Summary Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-900 border border-dark-850 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Todo</span>
              <p className="text-2xl font-extrabold text-slate-300 mt-1">{taskSummary.todo}</p>
            </div>
            <div className="bg-dark-900 border border-dark-850 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In Progress</span>
              <p className="text-2xl font-extrabold text-slate-400 mt-1">{taskSummary.inProgress}</p>
            </div>
            <div className="bg-dark-900 border border-dark-850 rounded-xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Done</span>
              <p className="text-2xl font-extrabold text-white mt-1">{taskSummary.done}</p>
            </div>
          </div>

          {/* Project Active Tasks List */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-dark-800/60">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-white" />
                <h3 className="font-bold text-base text-slate-200">Associated Tasks</h3>
              </div>
              <Link to="/tasks" className="text-xs text-slate-300 hover:text-white font-semibold">
                Tasks Workspace →
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Inbox className="w-9 h-9 text-dark-700 mx-auto mb-2" />
                  <p className="text-xs">No tasks currently mapped to this project.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-dark-950/40 border border-dark-800 hover:border-dark-700 transition-all duration-200 gap-3"
                  >
                    <div className="flex flex-col truncate pr-3">
                      <span className="font-bold text-sm text-slate-200 truncate">{task.title}</span>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0 self-start sm:self-auto">
                      {/* Priority Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        task.priority === 'High'
                          ? 'bg-rose-950/20 text-rose-400 border-rose-500/25'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-950/20 text-yellow-500 border-yellow-500/25'
                          : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/25'
                      }`}>
                        {task.priority}
                      </span>

                      {/* Status Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        task.status === 'Done'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : task.status === 'In Progress'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-700'
                      }`}>
                        {task.status}
                      </span>

                      {/* Assignee initials badge */}
                      <div className="w-8 h-8 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-slate-200 font-bold text-xs" title={`Assigned to ${task.assignedTo?.name}`}>
                        {task.assignedTo?.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Panel: Team Management & Add Member */}
        <div className="space-y-6">
          {/* Members List */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dark-800/60">
              <Users className="w-4.5 h-4.5 text-white" />
              <h3 className="font-bold text-sm text-slate-200">Project Team</h3>
            </div>

            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {project.members?.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No team members assigned</p>
              ) : (
                project.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate leading-snug">{member.name}</p>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">{member.role}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveMember(member._id, member.name)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all shrink-0"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Admin Team Addition Panel */}
          {isAdmin && (
            <div className="glass-card p-6 border-dark-800">
              <div className="flex items-center gap-2 mb-3.5">
                <UserPlus className="w-4.5 h-4.5 text-white" />
                <h3 className="font-bold text-sm text-slate-200 font-sans">Assign Member</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Add users to this workspace project. Added members will automatically gain visibility over all associated project tasks.
              </p>

              <form onSubmit={handleAddMember} className="space-y-3">
                <input
                  type="email"
                  placeholder="name@workspace.com"
                  disabled={addingMember}
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="input-field py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={addingMember || !emailInput.trim()}
                  className="btn-primary w-full py-2 text-xs"
                >
                  {addingMember ? 'Assigning...' : 'Assign User'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  Inbox,
  LogOut,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await API.get('/tasks');
        if (response.data && response.data.success) {
          // Filter tasks assigned to active user
          const myTasks = response.data.data.filter((t) => t.assignedTo?._id === user?.id);
          setUserTasks(myTasks);
        }
      } catch (error) {
        console.error('[Profile] Error loading user tasks:', error.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const handleLogoutClick = () => {
    logout();
    toast.success('Successfully logged out!');
  };

  const tasksCount = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = userTasks.filter((t) => t.status === 'In Progress').length;
  const todoTasks = userTasks.filter((t) => t.status === 'Todo').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Summarized information regarding credentials, workspace roles, and performance milestones.
        </p>
      </div>

      {/* Bento Layout Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="glass-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden h-[360px]">
          {/* Ambient radial gradient glow */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
          
          <div className="mt-4 flex flex-col items-center">
            {/* Avatar badge */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-glow mb-4 border-2 border-dark-800">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            
            <h3 className="text-lg font-bold text-slate-100 leading-snug">{user?.name}</h3>
            
            {/* Role indicator pill */}
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mt-2 flex items-center gap-1.5 ${
              user?.role === 'admin'
                ? 'bg-rose-950/20 text-rose-400 border-rose-500/20'
                : 'bg-brand-950/30 text-brand-400 border-brand-500/20'
            }`}>
              <Shield className="w-3 h-3 shrink-0" />
              {user?.role}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="btn-secondary w-full py-2 flex items-center justify-center gap-2 mt-8 text-xs hover:border-rose-500/30 hover:text-rose-400"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Session
          </button>
        </div>

        {/* Credentials & Metrics details */}
        <div className="md:col-span-2 space-y-6">
          {/* User details credentials card */}
          <div className="glass-card p-6 sm:p-8 space-y-5">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-dark-800/60 pb-3">
              Account Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
              {/* Full Name */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-850 flex items-center justify-center text-slate-500 shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Full Name</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{user?.name}</span>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-850 flex items-center justify-center text-slate-500 shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Email Address</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate max-w-[200px]" title={user?.email}>
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* System Privilege Role */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-850 flex items-center justify-center text-slate-500 shrink-0">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Workspace Privilege</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block capitalize">{user?.role}</span>
                </div>
              </div>

              {/* Registered on */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-850 flex items-center justify-center text-slate-500 shrink-0">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Session Integrity</span>
                  <span className="text-xs font-semibold text-emerald-400 mt-0.5 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Verified Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Statistics Grid */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-dark-800/60 pb-3 mb-5">
              My Task Analytics
            </h3>

            {loading ? (
              <div className="h-20 bg-dark-900 border border-dark-850 rounded-xl shimmer"></div>
            ) : tasksCount === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <Inbox className="w-8 h-8 text-dark-700 mx-auto mb-2" />
                No active tasks are assigned to your workspace.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-dark-950 border border-dark-850 rounded-xl p-3.5 flex flex-col justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">My Tasks</span>
                  <p className="text-xl font-extrabold text-white mt-1">{tasksCount}</p>
                </div>
                {/* Done */}
                <div className="bg-dark-950 border border-dark-850 rounded-xl p-3.5 flex flex-col justify-center border-l-2 border-l-emerald-500">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Done</span>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">{completedTasks}</p>
                </div>
                {/* In Progress */}
                <div className="bg-dark-950 border border-dark-850 rounded-xl p-3.5 flex flex-col justify-center border-l-2 border-l-yellow-500">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500">Active</span>
                  <p className="text-xl font-extrabold text-yellow-400 mt-1">{inProgressTasks}</p>
                </div>
                {/* Todo */}
                <div className="bg-dark-950 border border-dark-850 rounded-xl p-3.5 flex flex-col justify-center border-l-2 border-l-indigo-500">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">Todo</span>
                  <p className="text-xl font-extrabold text-indigo-400 mt-1">{todoTasks}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

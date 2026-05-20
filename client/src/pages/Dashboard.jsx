import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Folder,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  User,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get('/dashboard');
        if (response.data && response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching analytics:', error.message);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Header Skeleton */}
        <div className="h-8 w-64 bg-dark-800 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-dark-800 rounded animate-pulse mt-2"></div>
        
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-900 border border-dark-800 rounded-xl shimmer"></div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="h-80 bg-dark-900 border border-dark-800 rounded-xl lg:col-span-2 shimmer"></div>
          <div className="h-80 bg-dark-900 border border-dark-800 rounded-xl shimmer"></div>
        </div>
      </div>
    );
  }

  const stats = data || {
    projects: { total: 0, active: 0, completed: 0, onHold: 0 },
    tasks: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
    chartData: { taskPriority: [], taskStatus: [] },
    upcomingDeadlines: [],
    recentTasks: []
  };

  // Safe percentage helper
  const getPercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  const overdueCount = stats.tasks.overdue;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Good day, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here is a detailed overview of your project progress, team assignments, and tasks.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="glass-card p-6 flex items-center justify-between shadow-glow hover:border-white/20 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</span>
            <h3 className="text-3xl font-extrabold text-white mt-1.5">{stats.projects.total}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">{stats.projects.active} active</span>
              <span>•</span>
              <span className="text-slate-400 font-semibold">{stats.projects.completed} completed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Folder className="w-6 h-6" />
          </div>
        </div>

        {/* Task Completion Progress */}
        <div className="glass-card p-6 flex items-center justify-between transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasks Completion</span>
            <h3 className="text-3xl font-extrabold text-white mt-1.5">
              {getPercentage(stats.tasks.done, stats.tasks.total)}%
            </h3>
            <div className="w-32 bg-dark-950 h-2 rounded-full mt-3.5 overflow-hidden border border-dark-800">
              <div
                className="bg-gradient-to-r from-slate-600 to-white h-full rounded-full transition-all duration-500"
                style={{ width: `${getPercentage(stats.tasks.done, stats.tasks.total)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-card p-6 flex items-center justify-between transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <h3 className="text-3xl font-extrabold text-white mt-1.5">{stats.tasks.todo + stats.tasks.inProgress}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <span className="text-slate-300 font-semibold">{stats.tasks.inProgress} in progress</span>
              <span>•</span>
              <span className="text-slate-400">{stats.tasks.todo} todo</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Alerts */}
        <div className={`glass-card p-6 flex items-center justify-between transition-all duration-300 ${overdueCount > 0 ? 'border-white/20 bg-dark-900' : ''}`}>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Alerts</span>
            <h3 className={`text-3xl font-extrabold mt-1.5 ${overdueCount > 0 ? 'text-white' : 'text-white'}`}>
              {overdueCount}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              {overdueCount > 0 ? 'Requires immediate action' : 'All clean and on-track.'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            overdueCount > 0 
              ? 'bg-white/10 border border-white/25 text-white animate-pulse' 
              : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-sm text-slate-200">Task Status Distribution</h4>
              <span className="text-xs text-slate-500">Breakdown of operational status lanes</span>
            </div>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="h-64">
            {stats.tasks.total === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No active tasks to visualize
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData.taskStatus} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222226" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0e0e11', borderColor: '#222226', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {stats.chartData.taskStatus.map((entry, index) => {
                      const colors = ['#52525b', '#a1a1aa', '#ffffff'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-200">Task Priorities</h4>
            <span className="text-xs text-slate-500">Workload priority share</span>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            {stats.tasks.total === 0 ? (
              <span className="text-slate-500 text-xs">No priorities mapped</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData.taskPriority}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.chartData.taskPriority.map((entry, index) => {
                      const priorityColors = {
                        'Low': '#52525b',
                        'Medium': '#a1a1aa',
                        'High': '#ffffff'
                      };
                      return <Cell key={`cell-${index}`} fill={priorityColors[entry.name] || '#71717a'} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0e0e11', borderColor: '#222226', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            {stats.chartData.taskPriority.map((item, idx) => {
              const priorityColors = {
                'Low': '#52525b',
                'Medium': '#a1a1aa',
                'High': '#ffffff'
              };
              return (
                <div key={idx} className="bg-dark-950/60 border border-dark-800/80 rounded-lg p-2 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: priorityColors[item.name] || '#71717a' }}></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-200 mt-0.5">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deadlines & Recent Activities row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-dark-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <h4 className="font-bold text-sm text-slate-200">Upcoming Deadlines</h4>
            </div>
            <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Priority
            </span>
          </div>

          <div className="flex-1 space-y-3.5">
            {stats.upcomingDeadlines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500">
                <Inbox className="w-8 h-8 text-dark-700 mb-2" />
                <span className="text-xs">No upcoming deadlines</span>
              </div>
            ) : (
              stats.upcomingDeadlines.map((task) => {
                const daysRemaining = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const overdue = daysRemaining < 0;
                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-dark-950/40 border border-dark-800 hover:border-dark-700 transition-colors"
                  >
                    <div className="flex flex-col truncate pr-4">
                      <span className="font-semibold text-xs text-slate-200 truncate">{task.title}</span>
                      <span className="text-[10px] text-slate-400 mt-1 truncate">
                        Project: <strong className="text-slate-300">{task.project?.title}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Deadline Countdown badge */}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                        overdue
                          ? 'bg-rose-950/20 text-rose-400 border-rose-500/30'
                          : daysRemaining <= 3
                          ? 'bg-yellow-950/20 text-yellow-500 border-yellow-500/30'
                          : 'bg-dark-800 text-slate-400 border-dark-700'
                      }`}>
                        {overdue ? 'Overdue!' : daysRemaining === 0 ? 'Due Today' : `${daysRemaining}d left`}
                      </span>

                      {/* Task Assignee Tag */}
                      <div className="w-7 h-7 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-slate-300 font-bold text-[10px]" title={`Assigned to ${task.assignedTo?.name}`}>
                        {task.assignedTo?.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-dark-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              <h4 className="font-bold text-sm text-slate-200">Recent Action Items</h4>
            </div>
            <Link to="/tasks" className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1">
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3.5">
            {stats.recentTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500">
                <Inbox className="w-8 h-8 text-dark-700 mb-2" />
                <span className="text-xs">No tasks active</span>
              </div>
            ) : (
              stats.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-950/40 border border-dark-800 hover:border-dark-700 transition-colors"
                >
                  <div className="flex flex-col truncate pr-4">
                    <span className="font-semibold text-xs text-slate-200 truncate">{task.title}</span>
                    <span className="text-[10px] text-slate-400 mt-1 truncate">
                      Assigned to: <strong className="text-white font-semibold">{task.assignedTo?.name}</strong>
                    </span>
                  </div>

                  {/* Task Status badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    task.status === 'Done'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : task.status === 'In Progress'
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

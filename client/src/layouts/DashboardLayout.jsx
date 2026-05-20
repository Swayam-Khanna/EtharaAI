import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'member']
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderKanban,
      roles: ['admin', 'member']
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'member']
    },
    {
      name: 'Team Management',
      path: '/team',
      icon: Users,
      roles: ['admin'] // Admin only!
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['admin', 'member']
    }
  ];

  const activeLink = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-dark-800">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-600 to-slate-100 flex items-center justify-center shadow-glow">
              <Briefcase className="w-5 h-5 text-dark-950" />
            </div>
            <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Ethara.AI
            </span>
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="px-6 py-5 border-b border-dark-800/60 bg-dark-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-base shadow-inner">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-slate-200 truncate">{user?.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300 bg-dark-800 border border-dark-700 px-2 py-0.5 rounded">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks
            .filter((link) => link.roles.includes(user?.role))
            .map((link) => {
              const LinkIcon = link.icon;
              const active = activeLink(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white/5 text-white border-l-2 border-white shadow-glow'
                      : 'text-slate-400 hover:bg-dark-800/50 hover:text-slate-200'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LinkIcon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-dark-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:pl-64">
        {/* Header Bar */}
        <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden sm:block text-slate-400 font-medium text-sm">
              Workspace / <span className="text-slate-200 font-semibold">{location.pathname.substring(1) || 'Dashboard'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 bg-dark-800 px-3 py-1.5 rounded-full border border-dark-700">
              Session Status: <span className="text-emerald-400 font-semibold">Active</span>
            </span>
          </div>
        </header>

        {/* Router Viewport */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

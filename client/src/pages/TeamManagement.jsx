import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Mail,
  Shield,
  Calendar,
  Loader2,
  Inbox,
  UserCheck,
  UserX
} from 'lucide-react';

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('[TeamManagement] Error fetching user directory:', error.message);
      toast.error('Failed to load workspace users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-dark-800 rounded animate-pulse"></div>
        <div className="h-12 w-full bg-dark-900 border border-dark-800 rounded-xl shimmer mt-6"></div>
        <div className="space-y-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-dark-900 border border-dark-800 rounded-xl shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter users by search query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-sans">Workspace Directory</h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete listing of all team members and admin administrators registered within Ethara.AI
        </p>
      </div>

      {/* Control bar / search filter */}
      <div className="glass-card p-4 flex items-center justify-between gap-4 bg-dark-900/30">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search team members by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-dark-950 border border-dark-800 text-slate-100 placeholder-slate-500 rounded-lg text-xs pl-9 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-400 font-semibold shrink-0 hidden sm:block">
          Total Users: <strong className="text-white">{users.length}</strong>
        </div>
      </div>

      {/* Directory Table / Cards */}
      {filteredUsers.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center text-slate-500 max-w-xl mx-auto mt-10">
          <Inbox className="w-12 h-12 text-dark-700 mb-4" />
          <h3 className="text-base font-bold text-slate-300">No Members Match</h3>
          <p className="text-xs text-slate-400 mt-1">
            Please refine your query or try checking spelling.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-dark-800/80">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-dark-950/60 border-b border-dark-800/80 px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div className="col-span-5 sm:col-span-4">Team Member</div>
            <div className="col-span-7 sm:col-span-4">Email Address</div>
            <div className="col-span-3 sm:col-span-2 text-center">Privilege Role</div>
            <div className="col-span-2 hidden sm:block text-right">Joined Date</div>
          </div>

          {/* Members List */}
          <div className="divide-y divide-dark-800/60">
            {filteredUsers.map((member) => (
              <div
                key={member._id}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-dark-900/30 transition-colors gap-1 sm:gap-0"
              >
                {/* Avatar / Name */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-100 truncate">{member.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-7 sm:col-span-4 truncate text-xs text-slate-300 pr-2">
                  {member.email}
                </div>

                {/* Privilege Role Badge */}
                <div className="col-span-12 sm:col-span-2 flex justify-start sm:justify-center mt-2 sm:mt-0">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                    member.role === 'admin'
                      ? 'bg-rose-950/20 text-rose-400 border-rose-500/20'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}>
                    <Shield className="w-2.5 h-2.5" />
                    {member.role}
                  </span>
                </div>

                {/* Registration Date */}
                <div className="col-span-2 hidden sm:block text-right text-xs text-slate-400">
                  {new Date(member.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

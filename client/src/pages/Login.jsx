import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Briefcase, Mail, Lock, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-dark-900/60 border border-dark-800/80 backdrop-blur-xl rounded-2xl shadow-glow p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shadow-glow mb-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome to Ethara.AI
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to manage projects and teams</p>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3.5 mb-6 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-white mb-1">💡 Seed Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
            <span>🔑 Admin: <strong className="text-slate-300">admin@workspace.com</strong></span>
            <span>🔑 Member: <strong className="text-slate-300">john@workspace.com</strong></span>
            <span className="col-span-2 mt-0.5">🔓 Common Password: <strong className="text-slate-300">password123</strong></span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="you@workspace.com"
                disabled={submitting}
                className={`input-field pl-10 ${errors.email ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                disabled={submitting}
                className={`input-field pl-10 ${errors.password ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3">
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Navigation Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-slate-300 hover:text-white font-medium transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Briefcase, User, Mail, Lock, Loader2 } from 'lucide-react';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success('Account created successfully! Welcome onboard.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shadow-glow mb-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create an Account
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">Sign up to get started on Ethara.AI</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Jane Doe"
                disabled={submitting}
                className={`input-field pl-10 ${errors.name ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="jane@workspace.com"
                disabled={submitting}
                className={`input-field pl-10 ${errors.email ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
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
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                disabled={submitting}
                className={`input-field pl-10 ${errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6 py-3">
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Navigation Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

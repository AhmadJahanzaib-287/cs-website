import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, X, ShieldAlert } from 'lucide-react';

const LoginPage = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        onClose(); // Modal band karein
        navigate('/admin/dashboard'); // Dashboard par bhej dein
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[4px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-slate-800"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-900 transition"
          aria-label="Close login"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Warning Message */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-amber-500/20 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-[#1e3a8a]" />
          </div>
          <h3 className="text-xl font-bold">Portal Access</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            This login facility is strictly reserved for <span className="text-[#1e3a8a] font-semibold">department officials</span> only.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 ml-1">Official Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@uaf.edu.pk"
                required
                className="w-full bg-white border border-slate-300 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-slate-300 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1e3a8a] transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a8a] hover:bg-[#172e6e] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate & Enter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
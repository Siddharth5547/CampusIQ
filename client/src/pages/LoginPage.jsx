import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        setError(isLocal 
          ? 'Unable to connect to server. Please ensure the backend is running on port 5000.'
          : 'Unable to connect to server. Please check your internet connection or try again later.');
      } else if (err.response.status === 401) {
        setError(err.response.data?.message || 'Invalid email or password.');
      } else if (err.response.status === 400) {
        setError(err.response.data?.message || 'Please provide both email and password.');
      } else if (err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = async (role) => {
    const demos = {
      admin: { email: 'admin@campuscare.edu', password: 'Admin@123' },
      staff: { email: 'staff1@campuscare.edu', password: 'Staff@123' },
      student: { email: 'student1@campuscare.edu', password: 'Student@123' },
    };
    const creds = demos[role];
    setForm(creds);
    setError('');

    setLoading(true);
    try {
      const user = await login(creds.email, creds.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        setError(isLocal 
          ? 'Unable to connect to server. Please ensure the backend is running on port 5000.'
          : 'Unable to connect to server. Please check your internet connection or try again later.');
      } else {
        setError(err.response.data?.message || 'Demo login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex">
      {/* Left panel - Dark Charcoal Section (10-20% dark accent) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#3B3C36] text-white border-r border-[#4A4B43] flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[#292A26]/80 via-[#3B3C36] to-[#292A26]" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center z-10"
        >
          <div className="w-16 h-16 bg-[#9F8170] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">CampusCare</h2>
          <p className="text-[#DEDAD3] text-lg max-w-sm font-normal">
            Your campus maintenance platform. Report problems, track progress, get resolutions.
          </p>

          <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
            {['AI-powered complaint analysis', 'Real-time status tracking', 'Instant notifications', 'Campus analytics'].map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-[#F0EBE6]"
              >
                <div className="w-5 h-5 rounded-full bg-[#8A9A5B]/20 border border-[#8A9A5B] flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#8A9A5B]" />
                </div>
                <span className="font-medium">{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - login form (Clean Warm Light) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F7F5F0]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#DEDAD3] shadow-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-[#3B3C36] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#9F8170]" />
            </div>
            <span className="font-display font-bold text-[#292A26] text-xl">CampusCare</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-[#292A26] mb-2">Welcome back</h1>
            <p className="text-[#68675F] text-sm">Sign in to your account to continue</p>
          </div>

          {/* Demo accounts */}
          <div className="mb-6 p-4 bg-[#F0EBE6] rounded-xl border border-[#DEDAD3]">
            <p className="text-xs text-[#3B3C36] mb-3 font-bold uppercase tracking-wider">Quick Demo Login:</p>
            <div className="flex gap-2">
              {['admin', 'staff', 'student'].map(role => (
                <button
                  key={role}
                  type="button"
                  disabled={loading}
                  onClick={() => fillDemo(role)}
                  className="flex-1 py-2 px-2 rounded-lg bg-white border border-[#9F8170] text-[#3B3C36] text-xs font-semibold hover:bg-[#9F8170] hover:text-white transition-colors capitalize shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input pl-10"
                  placeholder="you@campuscare.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77766F] hover:text-[#3B3C36]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-[#68675F] text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#9F8170] hover:text-[#8A6D5D] font-bold underline underline-offset-4">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

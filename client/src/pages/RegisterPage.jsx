import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, User, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', department: '', studentId: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
        studentId: form.studentId
      });
      toast.success(`Welcome to CampusCare, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to server. Please ensure the backend is running on port 5000.');
      } else if (err.response.status === 409) {
        setError(err.response.data?.message || 'An account with this email already exists.');
      } else if (err.response.status === 400) {
        setError(err.response.data?.message || 'Validation error. Please check your inputs.');
      } else {
        setError(err.response.data?.message || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#3B3C36] rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-[#9F8170]" />
          </div>
          <span className="font-display font-bold text-[#292A26] text-2xl tracking-tight">CampusCare</span>
        </div>

        <div className="card shadow-sm">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-[#292A26] mb-1">Create Account</h1>
            <p className="text-[#68675F] text-sm font-normal">Join CampusCare and start reporting campus issues</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="input-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="you@campuscare.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="input pr-8 cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Maintenance Staff</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none">▾</div>
                </div>
              </div>

              <div>
                <label className="input-label">Department</label>
                <input
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Computer Science"
                />
              </div>

              {form.role === 'student' && (
                <div className="col-span-2">
                  <label className="input-label">Student ID</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                    <input
                      name="studentId"
                      type="text"
                      value={form.studentId}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="e.g., STU2024001"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77766F] hover:text-[#3B3C36]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="btn-primary w-full justify-center py-3 mt-4"
            >
              {loading ? <LoadingSpinner size="sm" /> : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-[#68675F] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#9F8170] hover:text-[#8A6D5D] font-bold underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

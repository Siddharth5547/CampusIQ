import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import { LoadingSpinner } from '../components/ui';
import { User, Mail, Building, BookOpen, Phone, Save, Shield, Wrench, GraduationCap } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    studentId: user?.studentId || ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const roleIcon = user?.role === 'admin' ? Shield : user?.role === 'staff' ? Wrench : GraduationCap;
  const RoleIcon = roleIcon;
  const roleColor = user?.role === 'admin' ? '#9F8170' : user?.role === 'staff' ? '#3B3C36' : '#8A9A5B';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-[#292A26]">My Profile</h1>
          <p className="text-[#68675F] text-sm mt-1">Manage your account information</p>
        </div>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#3B3C36] flex items-center justify-center text-[#F7F5F0] font-bold text-xl shadow-sm border border-[#4A4B43]">
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292A26]">{user?.name}</h2>
              <p className="text-[#68675F] text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                  style={{ color: roleColor, backgroundColor: `${roleColor}15`, borderColor: `${roleColor}40` }}>
                  <RoleIcon className="w-3 h-3" />
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
                <span className="text-[#77766F] text-xs font-mono">Member since {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card shadow-sm">
          <h3 className="font-bold text-[#292A26] mb-6">Edit Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                <input name="name" value={form.name} onChange={handleChange} className="input pl-10" required />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                <input value={user?.email} disabled className="input pl-10 opacity-70 bg-[#F0EBE6] cursor-not-allowed text-[#3B3C36]" />
              </div>
              <p className="text-xs text-[#77766F] mt-1 font-medium">Email cannot be changed.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Department</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input name="department" value={form.department} onChange={handleChange} className="input pl-10" placeholder="Your department" />
                </div>
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input name="phone" value={form.phone} onChange={handleChange} className="input pl-10" placeholder="+91 9876543210" />
                </div>
              </div>
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="input-label">Student ID</label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
                  <input name="studentId" value={form.studentId} onChange={handleChange} className="input pl-10" placeholder="STU2024001" />
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </form>
        </motion.div>

        {/* Account info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card mt-6 shadow-sm">
          <h3 className="font-bold text-[#292A26] mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#DEDAD3]">
              <span className="text-[#68675F]">Account ID</span>
              <span className="text-[#292A26] font-mono text-xs font-bold">{user?._id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDAD3]">
              <span className="text-[#68675F]">Role</span>
              <span className="text-[#292A26] font-bold capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#68675F]">Member Since</span>
              <span className="text-[#292A26] font-medium">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

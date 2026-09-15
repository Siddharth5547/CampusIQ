import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import { LoadingSpinner, EmptyState } from '../components/ui';
import { Search, Users, Shield, Wrench, GraduationCap, UserCheck, UserX } from 'lucide-react';
import { formatDate, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ role: roleFilter, search, limit: 50 });
      setUsers(res.data.data.users);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleActive = async (user) => {
    setUpdatingId(user._id);
    try {
      await adminService.updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user.');
    } finally {
      setUpdatingId(null);
    }
  };

  const changeRole = async (user, newRole) => {
    setUpdatingId(user._id);
    try {
      await adminService.updateUser(user._id, { role: newRole });
      toast.success('User role updated.');
      fetchUsers();
    } catch {
      toast.error('Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield className="w-3.5 h-3.5" />;
    if (role === 'staff') return <Wrench className="w-3.5 h-3.5" />;
    return <GraduationCap className="w-3.5 h-3.5" />;
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return 'text-[#292A26] bg-[#F0EBE6] border-[#9F8170] font-bold';
    if (role === 'staff') return 'text-[#3B3C36] bg-[#F0EBE6] border-[#DEDAD3] font-semibold';
    return 'text-[#2D5A27] bg-[#EEF1E7] border-[#8A9A5B]/40 font-semibold';
  };

  const counts = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    student: users.filter(u => u.role === 'student').length,
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[#292A26]">User Management</h1>
        <p className="text-[#68675F] text-sm mt-1">Manage all campus users and their roles</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: counts.total, color: '#3B3C36' },
          { label: 'Admins', value: counts.admin, color: '#9F8170' },
          { label: 'Staff', value: counts.staff, color: '#8A6D5D' },
          { label: 'Students', value: counts.student, color: '#8A9A5B' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card py-4 text-center shadow-sm"
          >
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#68675F] font-bold uppercase tracking-wider">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Search by name or email..."
            />
          </div>
          <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
        </form>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input pr-8 cursor-pointer text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none text-xs">▾</div>
        </div>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><LoadingSpinner /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search criteria." />
      ) : (
        <div className="card p-0 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#DEDAD3] bg-[#F0EBE6]">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#3B3C36] text-left">User</th>
                  <th className="px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#3B3C36] text-left">Role</th>
                  <th className="px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#3B3C36] text-left">Department</th>
                  <th className="px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#3B3C36] text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#3B3C36] text-left">Joined</th>
                  <th className="px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider text-[#3B3C36] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#DEDAD3] hover:bg-[#F0EBE6]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3B3C36] flex items-center justify-center text-white font-bold text-xs">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-[#292A26] font-semibold text-sm">{user.name}</p>
                          <p className="text-[#68675F] text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          onChange={e => changeRole(user, e.target.value)}
                          disabled={updatingId === user._id}
                          className={`badge cursor-pointer pr-5 ${getRoleColor(user.role)}`}
                          style={{ appearance: 'none', padding: '4px 20px 4px 8px' }}
                        >
                          <option value="admin">admin</option>
                          <option value="staff">staff</option>
                          <option value="student">student</option>
                        </select>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-70">▾</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#4A4943] text-sm font-medium">{user.department || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${user.isActive ? 'bg-[#EEF1E7] text-[#2D5A27] border-[#8A9A5B]/50 font-bold' : 'bg-red-50 text-red-700 border-red-200 font-bold'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#77766F] text-xs font-mono">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {updatingId === user._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <button
                          onClick={() => toggleActive(user)}
                          className={`btn-ghost text-xs px-3 py-1.5 ${user.isActive ? 'text-red-700 hover:bg-red-50' : 'text-[#2D5A27] hover:bg-[#EEF1E7]'}`}
                        >
                          {user.isActive ? (
                            <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                          ) : (
                            <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                          )}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;

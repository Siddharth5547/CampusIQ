import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import { StatCard, LoadingSpinner, EmptyState, SkeletonCard } from '../components/ui';
import {
  FileText, Clock, CheckCircle, AlertTriangle, PlusCircle,
  TrendingUp, Activity, Zap, RefreshCw, Sparkles, Layers, ArrowRight
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { limit: 6, sort: '-createdAt' };
      const res = await complaintService.getAll(params);
      const all = res.data.data.complaints;
      setComplaints(all);

      // Compute stats
      const total = res.data.data.pagination.total;
      const pending = all.filter(c => ['Submitted', 'AI Analyzed', 'Under Review', 'Reopened'].includes(c.status)).length;
      const inProgress = all.filter(c => ['Assigned', 'In Progress', 'Verification'].includes(c.status)).length;
      const resolved = all.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
      const critical = all.filter(c => c.priority === 'Critical').length;

      setStats({ total, pending, inProgress, resolved, critical });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const studentStats = [
    { title: 'Total Reported', value: stats?.total || 0, icon: FileText, color: '#9F8170' },
    { title: 'Pending Review', value: stats?.pending || 0, icon: Clock, color: '#8A6D5D' },
    { title: 'Under Maintenance', value: stats?.inProgress || 0, icon: Activity, color: '#3B3C36' },
    { title: 'Verified Resolved', value: stats?.resolved || 0, icon: CheckCircle, color: '#8A9A5B' },
  ];

  const adminStats = [
    { title: 'Total Queue', value: stats?.total || 0, icon: FileText, color: '#9F8170' },
    { title: 'Critical SLA Incidents', value: stats?.critical || 0, icon: AlertTriangle, color: '#991B1B' },
    { title: 'Technicians Dispatched', value: stats?.inProgress || 0, icon: Activity, color: '#3B3C36' },
    { title: 'Resolved Defects', value: stats?.resolved || 0, icon: CheckCircle, color: '#8A9A5B' },
  ];

  const displayStats = isAdmin || isStaff ? adminStats : studentStats;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl sm:text-3xl font-bold text-[#292A26] tracking-tight"
            >
              {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="text-[#68675F] text-xs mt-1 font-mono"
            >
              {isAdmin
                ? 'Campus Operations Control — Real-time defect queue and SLA management.'
                : isStaff
                ? 'Assigned Maintenance Tasks — Log notes, upload proof, and verify repairs.'
                : 'Student Issue Portal — Track progress, view proof, and verify fixes.'}
            </motion.p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              className="btn-ghost p-2 text-[#68675F] hover:text-[#3B3C36] cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {!isStaff && (
              <Link to="/complaints/new" className="btn-primary text-xs py-2 px-3.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin/analytics" className="btn-secondary text-xs py-2 px-3.5">
                <Layers className="w-3.5 h-3.5 text-[#3B3C36]" />
                <span>Heatmap & Health</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white animate-pulse border border-[#DEDAD3]" />
            ))
          ) : (
            displayStats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))
          )}
        </div>

        {/* Quick Issue Banner for Students */}
        {!isAdmin && !isStaff && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-[#EEF1E7] border border-[#DEDAD3] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#8A9A5B]/40 flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5 text-[#8A9A5B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#292A26] text-sm font-display">Noticed an Infrastructure Problem?</h3>
                <p className="text-[#4A4943] text-xs mt-0.5">
                  Report leaking pipes, broken lights, damaged furniture, or Wi-Fi issues. Our AI will triage it immediately.
                </p>
              </div>
            </div>
            <Link to="/complaints/new" className="btn-primary text-xs shrink-0 py-2.5 px-4 font-semibold">
              Submit Incident Ticket
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {/* Active Incidents Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-[#292A26] text-base tracking-tight">
                {isStaff ? 'My Assigned Maintenance Work' : 'Recent Incident Queue'}
              </h2>
              <p className="text-xs text-[#68675F] font-mono">
                {complaints.length} tickets actively monitored
              </p>
            </div>
            <Link to="/complaints" className="text-xs font-semibold text-[#9F8170] hover:text-[#292A26] font-mono">
              View complete queue →
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No active defects in queue"
              description={isStaff ? 'No maintenance tickets assigned to your queue at this moment.' : 'You have no open maintenance reports. Campus facilities are operating normally.'}
              action={!isAdmin && !isStaff ? (
                <Link to="/complaints/new" className="btn-primary text-xs">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Report First Defect
                </Link>
              ) : null}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {complaints.map((complaint, i) => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  index={i}
                  onUpvoteToggle={() => fetchData()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

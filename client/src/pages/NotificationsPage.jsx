import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import { EmptyState, LoadingSpinner } from '../components/ui';
import { Bell, BellOff, Check, Trash2, ExternalLink } from 'lucide-react';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const notifTypeColors = {
  complaint_submitted: '#9F8170',
  complaint_assigned: '#3B3C36',
  status_changed: '#8A4B20',
  complaint_resolved: '#8A9A5B',
  complaint_reopened: '#991B1B',
  new_comment: '#9F8170',
  high_priority: '#8A4B20',
  general: '#68675F',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ limit: 50 });
      setNotifications(res.data.data.notifications);
      setUnread(res.data.data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    await notificationService.markRead(id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    toast.success('All notifications marked as read.');
    fetchNotifications();
  };

  const deleteNotif = async (id) => {
    await notificationService.delete(id);
    fetchNotifications();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#292A26]">Notifications</h1>
            <p className="text-[#68675F] text-sm mt-1">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm px-3 py-2">
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center h-32 items-center"><LoadingSpinner /></div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="No notifications"
            description="You're all caught up! Notifications will appear here."
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.04 }}
                  className={`card p-4 cursor-pointer hover:border-[#9F8170] transition-all shadow-sm ${!n.read ? 'border-[#9F8170]/50 bg-[#F0EBE6]/60' : 'bg-white'}`}
                  onClick={() => {
                    if (!n.read) markRead(n._id);
                    if (n.complaint?._id) navigate(`/complaints/${n.complaint._id}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${notifTypeColors[n.type] || '#68675F'}20` }}
                    >
                      <Bell className="w-4 h-4" style={{ color: notifTypeColors[n.type] || '#68675F' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${!n.read ? 'text-[#292A26]' : 'text-[#4A4943]'}`}>{n.title}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!n.read && <div className="w-2 h-2 bg-[#9F8170] rounded-full" />}
                          <span className="text-xs text-[#77766F] font-mono">{timeAgo(n.createdAt)}</span>
                          <button
                            onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                            className="text-[#77766F] hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[#4A4943] text-xs mt-0.5">{n.message}</p>
                      {n.complaint && (
                        <div className="flex items-center gap-1 mt-1.5 text-[#9F8170] hover:text-[#8A6D5D] text-xs font-semibold">
                          <ExternalLink className="w-3 h-3" />
                          View complaint
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;

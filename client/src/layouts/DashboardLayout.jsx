import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services';
import CommandPalette from '../components/ui/CommandPalette';
import {
  LayoutDashboard, FileText, PlusCircle, Bell, LogOut, User,
  Menu, X, Shield, Users, BarChart3, Search,
  ClipboardList, AlertCircle, Sparkles, CheckCheck
} from 'lucide-react';
import { getInitials, timeAgo } from '../utils/helpers';

const getNavItems = (role) => {
  const base = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  ];

  if (role === 'student') {
    return [
      ...base,
      { path: '/complaints', icon: FileText, label: 'My Complaints' },
      { path: '/complaints/new', icon: PlusCircle, label: 'Report Issue' },
    ];
  }

  if (role === 'staff') {
    return [
      ...base,
      { path: '/complaints', icon: ClipboardList, label: 'Assigned Work' },
    ];
  }

  if (role === 'admin') {
    return [
      ...base,
      { path: '/complaints', icon: FileText, label: 'Complaints Queue' },
      { path: '/admin/analytics', icon: BarChart3, label: 'Analytics & Heatmap' },
      { path: '/admin/users', icon: Users, label: 'User Operations' },
    ];
  }

  return base;
};

const Sidebar = ({ isOpen, onClose, onOpenCommand }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#3B3C36] text-white border-r border-[#4A4B43]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#4A4B43]">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#9F8170] rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base tracking-tight leading-none">
              CampusCare
            </div>
            <div className="text-[11px] text-[#DEDAD3] font-mono mt-1">
              Operations OS
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Search Shortcut Trigger */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#292A26] hover:bg-[#4A4B43] border border-[#4A4B43] rounded-xl text-xs text-[#DEDAD3] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#9F8170]" />
            <span>Search & Jump...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#3B3C36] border border-[#4A4B43] text-[10px] font-mono text-[#DEDAD3]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* User Info Bar */}
      <div className="px-4 py-3 border-b border-[#4A4B43]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#9F8170] text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[11px] text-[#DEDAD3] capitalize font-mono">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#9F8170] text-white font-bold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/70'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-[#4A4B43] space-y-1">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium text-sm transition-all"
        >
          <User className="w-4 h-4 text-white/70" />
          <span>My Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl w-full text-left text-red-300 hover:text-red-100 hover:bg-red-900/30 cursor-pointer font-medium text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 bg-[#3B3C36] border-r border-[#4A4B43] flex-col fixed h-full z-20">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-[#3B3C36]/70 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#3B3C36] border-r border-[#4A4B43] z-40 lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#DEDAD3] hover:text-white p-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const Topbar = ({ onMenuClick, onOpenCommand }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll({ limit: 6 });
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id);
    fetchNotifications();
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#DEDAD3] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-[#68675F] hover:text-[#3B3C36] p-2 cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3] hover:border-[#9F8170] text-[#68675F] hover:text-[#3B3C36] text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#9F8170]" />
          <span>Quick Find / Commands...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DEDAD3] text-[10px] font-mono text-[#68675F]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Smart Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-[#68675F] hover:text-[#3B3C36] hover:bg-[#F0EBE6] rounded-xl relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9F8170]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-white border border-[#DEDAD3] z-20 overflow-hidden shadow-xl"
                >
                  <div className="flex items-center justify-between p-3.5 border-b border-[#DEDAD3] bg-[#F7F5F0]">
                    <span className="font-bold text-xs text-[#292A26] uppercase tracking-wider font-mono">
                      Activity & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await notificationService.markAllRead();
                          fetchNotifications();
                        }}
                        className="text-xs text-[#9F8170] hover:text-[#3B3C36] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#DEDAD3]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#68675F]">
                        No notifications in queue.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`p-3 text-xs cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-[#F0EBE6] hover:bg-[#EAE5DF]' : 'hover:bg-[#F7F5F0]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-[#292A26] truncate">
                              {n.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#68675F] shrink-0">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[#4A4943] text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 border-t border-[#DEDAD3] text-center bg-[#F7F5F0]">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs text-[#9F8170] hover:text-[#3B3C36] font-semibold"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3] hover:border-[#9F8170] transition-colors"
        >
          <span className="text-xs font-semibold text-[#3B3C36] hidden md:inline">
            {user?.name?.split(' ')[0]}
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#9F8170] text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
            {getInitials(user?.name)}
          </div>
        </Link>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex text-[#3B3C36]">
      {/* Sidebar in Charcoal Brown #3B3C36 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCommand={() => setCommandPaletteOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onOpenCommand={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;

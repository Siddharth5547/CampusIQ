import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, PlusCircle, LayoutDashboard, FileText, BarChart3,
  Users, Bell, MapPin, X, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services';

const QUICK_ACTIONS = [
  { id: 'new', label: 'Report New Issue', icon: PlusCircle, path: '/complaints/new', roles: ['student', 'admin'] },
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'complaints', label: 'Browse Complaints Queue', icon: FileText, path: '/complaints' },
  { id: 'analytics', label: 'Campus Analytics & Heatmap', icon: BarChart3, path: '/admin/analytics', roles: ['admin'] },
  { id: 'users', label: 'User Operations & Roles', icon: Users, path: '/admin/users', roles: ['admin'] },
  { id: 'notifications', label: 'View Notifications', icon: Bell, path: '/notifications' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search on query
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await complaintService.getAll({ search: query, limit: 5 });
        setSearchResults(res.data.data.complaints || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter accessible actions
  const availableActions = QUICK_ACTIONS.filter(a => !a.roles || a.roles.includes(user?.role));
  const filteredActions = availableActions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const totalItems = filteredActions.length + searchResults.length;

  const handleSelect = (item, isComplaint = false) => {
    onClose();
    if (isComplaint) {
      navigate(`/complaints/${item._id}`);
    } else {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredActions.length) {
        handleSelect(filteredActions[selectedIndex]);
      } else {
        const compIndex = selectedIndex - filteredActions.length;
        if (searchResults[compIndex]) {
          handleSelect(searchResults[compIndex], true);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#3B3C36]/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl rounded-2xl bg-white border border-[#DEDAD3] shadow-2xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#DEDAD3]">
            <Search className="w-5 h-5 text-[#9F8170] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, defect name, location, or ticket..."
              className="w-full bg-transparent text-[#292A26] placeholder-[#77766F] outline-none text-sm font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[#77766F] hover:text-[#292A26] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-[#3B3C36] bg-[#F0EBE6] rounded border border-[#DEDAD3] font-bold">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {/* Quick Actions */}
            {filteredActions.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#77766F]">
                  Quick Actions
                </div>
                {filteredActions.map((action, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={action.id}
                      onClick={() => handleSelect(action)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F0EBE6] text-[#292A26] border border-[#9F8170]/50 font-semibold'
                          : 'text-[#3B3C36] hover:bg-[#F0EBE6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-4 h-4 text-[#9F8170]" />
                        <span className="font-semibold">{action.label}</span>
                      </div>
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#77766F]" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Complaints Match */}
            {searchResults.length > 0 && (
              <div className="pt-2">
                <div className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#77766F]">
                  Complaints Found
                </div>
                {searchResults.map((comp, idx) => {
                  const itemIdx = filteredActions.length + idx;
                  const isSelected = selectedIndex === itemIdx;
                  return (
                    <div
                      key={comp._id}
                      onClick={() => handleSelect(comp, true)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F0EBE6] text-[#292A26] border border-[#9F8170]/50 font-semibold'
                          : 'text-[#3B3C36] hover:bg-[#F0EBE6]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold truncate text-[#292A26]">{comp.title}</div>
                        <div className="text-xs text-[#68675F] font-mono font-medium">
                          {comp.location} · {comp.category} · <span className="text-[#2D5A27] font-semibold">{comp.status}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#77766F] shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}

            {query && filteredActions.length === 0 && searchResults.length === 0 && !loading && (
              <div className="py-8 text-center text-sm text-[#77766F] font-medium">
                No matching actions or complaints found for "{query}".
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0EBE6] border-t border-[#DEDAD3] text-[11px] text-[#68675F] font-mono font-medium">
            <div className="flex items-center gap-2">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
            </div>
            <span>CampusCare Global Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import ComplaintCard from '../components/ComplaintCard';
import { LoadingSpinner, EmptyState, SkeletonCard } from '../components/ui';
import {
  Search, Filter, PlusCircle, FileText, ChevronLeft, ChevronRight,
  X, SlidersHorizontal
} from 'lucide-react';
import { CATEGORIES, PRIORITIES, STATUSES, LOCATIONS } from '../utils/helpers';

const ComplaintsPage = () => {
  const { isAdmin, isStaff } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', status: '', priority: '', category: '', location: '', sort: '-createdAt'
  });
  const [activeFilters, setActiveFilters] = useState({});

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...activeFilters };
      if (params.search === '') delete params.search;
      const res = await complaintService.getAll(params);
      setComplaints(res.data.data.complaints);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    fetchComplaints(1);
  }, [fetchComplaints]);

  const applyFilters = () => {
    const active = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) active[k] = v; });
    setActiveFilters(active);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '', category: '', location: '', sort: '-createdAt' });
    setActiveFilters({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== '-createdAt').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#292A26]">
            {isAdmin ? 'All Complaints' : isStaff ? 'Assigned Complaints' : 'My Complaints'}
          </h1>
          <p className="text-[#68675F] text-sm mt-1">
            {pagination.total} complaint{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>
        {!isAdmin && !isStaff && (
          <Link to="/complaints/new" className="btn-primary text-sm">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:block">Report Problem</span>
          </Link>
        )}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77766F]" />
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            className="input pl-10 w-full"
            placeholder="Search complaints..."
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary px-4 relative ${activeFilterCount > 0 ? 'border-[#9F8170]' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:block">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#9F8170] rounded-full text-xs flex items-center justify-center text-white font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button onClick={applyFilters} className="btn-primary px-4">
          <Search className="w-4 h-4" />
          <span className="hidden sm:block">Search</span>
        </button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="input-label">Status</label>
                  <div className="relative">
                    <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="input pr-8 cursor-pointer">
                      <option value="">All Statuses</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none text-xs">▾</div>
                  </div>
                </div>
                <div>
                  <label className="input-label">Priority</label>
                  <div className="relative">
                    <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} className="input pr-8 cursor-pointer">
                      <option value="">All Priorities</option>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none text-xs">▾</div>
                  </div>
                </div>
                <div>
                  <label className="input-label">Category</label>
                  <div className="relative">
                    <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} className="input pr-8 cursor-pointer">
                      <option value="">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none text-xs">▾</div>
                  </div>
                </div>
                <div>
                  <label className="input-label">Location</label>
                  <div className="relative">
                    <select value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} className="input pr-8 cursor-pointer">
                      <option value="">All Locations</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none text-xs">▾</div>
                  </div>
                </div>
                <div>
                  <label className="input-label">Sort By</label>
                  <div className="relative">
                    <select value={filters.sort} onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))} className="input pr-8 cursor-pointer">
                      <option value="-createdAt">Newest First</option>
                      <option value="createdAt">Oldest First</option>
                      <option value="-priority">Priority (High→Low)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77766F] pointer-events-none text-xs">▾</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={applyFilters} className="btn-primary text-sm px-4 py-2">Apply Filters</button>
                <button onClick={clearFilters} className="btn-secondary text-sm px-4 py-2">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).filter(([k, v]) => v && k !== 'sort').map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 px-3 py-1 bg-[#F0EBE6] border border-[#DEDAD3] rounded-full text-xs text-[#3B3C36] font-semibold">
              <span className="capitalize text-[#68675F]">{k}:</span> {v}
              <button onClick={() => { setFilters(p => ({ ...p, [k]: '' })); setActiveFilters(p => { const n = { ...p }; delete n[k]; return n; }); }}
                className="ml-1 text-[#68675F] hover:text-[#292A26] font-bold">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints found"
          description="Try adjusting your search or filter criteria."
          action={
            <div className="flex gap-2">
              <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button>
              {!isAdmin && !isStaff && (
                <Link to="/complaints/new" className="btn-primary text-sm">
                  <PlusCircle className="w-4 h-4" /> Report Problem
                </Link>
              )}
            </div>
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c, i) => <ComplaintCard key={c._id} complaint={c} index={i} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchComplaints(pagination.page - 1)}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#68675F] font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchComplaints(pagination.page + 1)}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ComplaintsPage;

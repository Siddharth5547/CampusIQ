import { motion } from 'framer-motion';

export { default as BeforeAfterSlider } from './BeforeAfterSlider';
export { default as DuplicateDetectionCard } from './DuplicateDetectionCard';
export { default as CampusHeatmap } from './CampusHeatmap';
export { default as CampusHealthScoreCard } from './CampusHealthScoreCard';
export { default as CommandPalette } from './CommandPalette';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-2 border-[#9F8170]/30 border-t-[#9F8170] rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
    <div className="text-center">
      <motion.div
        className="w-14 h-14 border-2 border-[#9F8170]/30 border-t-[#9F8170] rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-[#68675F] text-sm font-medium">Initializing CampusCare Operations...</p>
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="card">
    <div className="space-y-3">
      <div className="h-4 w-3/4 rounded-lg bg-[#F0EBE6] animate-pulse" />
      <div className="h-3 w-full rounded-lg bg-[#F0EBE6] animate-pulse" />
      <div className="h-3 w-5/6 rounded-lg bg-[#F0EBE6] animate-pulse" />
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-20 rounded-full bg-[#F0EBE6] animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-[#F0EBE6] animate-pulse" />
      </div>
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="w-14 h-14 bg-[#F0EBE6] rounded-2xl flex items-center justify-center mb-4 border border-[#DEDAD3] text-[#9F8170]">
      {Icon && <Icon className="w-7 h-7" />}
    </div>
    <h3 className="text-base font-bold text-[#292A26] mb-1.5">{title}</h3>
    <p className="text-[#68675F] text-xs max-w-sm mb-5">{description}</p>
    {action && action}
  </motion.div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="card border-red-200 bg-red-50 text-center py-8"
  >
    <div className="text-3xl mb-3">⚠️</div>
    <p className="text-red-800 font-bold mb-1 text-sm">Failed to Load Data</p>
    <p className="text-[#68675F] text-xs mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs px-4 py-2">
        Try Again
      </button>
    )}
  </motion.div>
);

export const Badge = ({ children, className = '' }) => (
  <span className={`badge ${className}`}>{children}</span>
);

export const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="card-hover bg-white"
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
      >
        {Icon && <Icon className="w-5 h-5" style={{ color }} />}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-mono font-bold ${trend >= 0 ? 'text-[#2D5A27]' : 'text-red-700'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold font-display text-[#292A26] mb-0.5 tracking-tight">{value}</div>
    <div className="text-xs font-semibold text-[#68675F]">{title}</div>
    {subtitle && <div className="text-[11px] text-[#77766F] mt-1 font-mono">{subtitle}</div>}
  </motion.div>
);

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', isDanger = false }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B3C36]/75 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="card max-w-sm w-full bg-white border-[#DEDAD3]"
      >
        <h3 className="text-base font-bold text-[#292A26] mb-1.5">{title}</h3>
        <p className="text-[#4A4943] text-xs mb-5">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="btn-secondary text-xs px-3.5 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            className={isDanger ? 'btn-danger text-xs px-3.5 py-2' : 'btn-primary text-xs px-3.5 py-2'}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Priority utility functions
export const getPriorityClass = (priority) => {
  const map = {
    'Critical': 'badge-critical',
    'High': 'badge-high',
    'Medium': 'badge-medium',
    'Low': 'badge-low',
  };
  return map[priority] || 'badge-medium';
};

export const getStatusClass = (status) => {
  const map = {
    'Submitted': 'badge-submitted',
    'AI Analyzed': 'badge-ai-analyzed',
    'Under Review': 'badge-under-review',
    'Assigned': 'badge-assigned',
    'In Progress': 'badge-in-progress',
    'Resolved': 'badge-resolved',
    'Verification': 'badge-verification',
    'Closed': 'badge-closed',
    'Reopened': 'badge-reopened',
    'Escalated': 'badge-escalated',
  };
  return map[status] || 'badge-submitted';
};

export const getPriorityColor = (priority) => {
  const map = {
    'Critical': '#991B1B',
    'High': '#C05621',
    'Medium': '#9F8170',
    'Low': '#8A9A5B',
  };
  return map[priority] || '#8A9A5B';
};

export const getStatusColor = (status) => {
  const map = {
    'Submitted': '#77766F',
    'AI Analyzed': '#8A9A5B',
    'Under Review': '#9F8170',
    'Assigned': '#3B3C36',
    'In Progress': '#8A6D5D',
    'Resolved': '#8A9A5B',
    'Verification': '#8A9A5B',
    'Closed': '#5A5A55',
    'Reopened': '#C05621',
    'Escalated': '#991B1B',
  };
  return map[status] || '#77766F';
};

export const getCategoryIcon = (category) => {
  const map = {
    'Electrical': '⚡',
    'Plumbing': '🔧',
    'Water Supply': '💧',
    'Sewage / Drainage': '🚰',
    'Cleaning': '🧹',
    'Furniture': '🪑',
    'Wi-Fi / Internet': '📶',
    'AC / Fan': '❄️',
    'Security': '🔒',
    'Construction': '🏗️',
    'Garbage': '🗑️',
    'Other': '📋',
  };
  return map[category] || '📋';
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
};

export const getSlaTimeRemaining = (deadline) => {
  if (!deadline) return null;
  const diffMs = new Date(deadline) - new Date();
  if (diffMs <= 0) {
    return { isBreached: true, text: 'SLA Breached' };
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return { isBreached: false, text: `${days}d ${hours % 24}h left` };
  }
  return { isBreached: false, text: `${hours}h ${minutes}m left` };
};

export const CATEGORIES = [
  'Electrical', 'Plumbing', 'Water Supply', 'Sewage / Drainage',
  'Cleaning', 'Furniture', 'Wi-Fi / Internet', 'AC / Fan',
  'Security', 'Construction', 'Garbage', 'Other'
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const STATUSES = [
  'Submitted', 'AI Analyzed', 'Under Review', 'Assigned',
  'In Progress', 'Resolved', 'Verification', 'Closed', 'Reopened', 'Escalated'
];

export const LOCATIONS = [
  'Block 1', 'Block 2', 'Block 3', 'Block 4', 'Library',
  'Food Court', 'Hostel', 'Parking', 'Sports Complex', 'Administrative Block'
];

export const STATUS_FLOW = [
  'Submitted', 'AI Analyzed', 'Under Review', 'Assigned',
  'In Progress', 'Resolved', 'Verification', 'Closed'
];

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 80) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

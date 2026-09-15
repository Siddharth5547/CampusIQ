import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService, adminService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import { LoadingSpinner, ConfirmDialog, BeforeAfterSlider } from '../components/ui';
import {
  MapPin, Calendar, User, MessageSquare, Image, Tag, ArrowLeft,
  CheckCircle, Clock, Zap, Star, Send, AlertTriangle, Edit,
  Trash2, RefreshCw, ChevronDown, ArrowBigUp, CheckCheck,
  Upload, X, ShieldAlert, Sparkles, HelpCircle
} from 'lucide-react';
import {
  getPriorityClass, getStatusClass, getStatusColor, getCategoryIcon,
  formatDateTime, timeAgo, getSlaTimeRemaining, CATEGORIES, PRIORITIES, STATUSES, LOCATIONS,
  getImageUrl
} from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_PIPELINE = [
  'Submitted', 'AI Analyzed', 'Under Review', 'Assigned',
  'In Progress', 'Resolved', 'Verification', 'Closed'
];

const StatusTimeline = ({ history }) => {
  const sortedHistory = [...(history || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-[#DEDAD3]" />
      <div className="space-y-4">
        {sortedHistory.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex gap-3.5 pl-8"
          >
            <div
              className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white z-10 shadow-sm"
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`badge text-[11px] ${getStatusClass(item.status)}`}>{item.status}</span>
                <span className="text-[#77766F] font-mono text-[11px]">{timeAgo(item.timestamp)}</span>
              </div>
              {item.note && <p className="text-[#4A4943] text-xs mt-0.5 font-medium">{item.note}</p>}
              {item.changedBy?.name && (
                <p className="text-[#77766F] text-[11px] mt-0.5 font-mono">by {item.changedBy.name}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FeedbackForm = ({ complaintId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating.'); return; }
    setSubmitting(true);
    try {
      await complaintService.submitFeedback(complaintId, { rating, comment });
      toast.success('Thank you! Your satisfaction feedback has been recorded.');
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-[#8A9A5B]/30 bg-[#EEF1E7]/40 space-y-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="font-bold text-[#292A26] text-sm">Resolution Satisfaction Rating</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="text-[#68675F] text-xs mb-2">How satisfied are you with the repair quality and timeliness?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                onMouseEnter={() => setHoverRating(r)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    r <= (hoverRating || rating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-[#DEDAD3]'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Additional comments about the service quality..."
            className="input text-xs resize-none"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary text-xs py-2 px-4">
          {submitting ? 'Submitting...' : 'Submit Resolution Feedback'}
        </button>
      </form>
    </motion.div>
  );
};

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();
  const fileInputRef = useRef(null);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Upvote state
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Verification modal state for "Still not fixed"
  const [reopenModal, setReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Staff After-Image upload
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState('');

  useEffect(() => {
    fetchComplaint();
    if (isAdmin) fetchStaff();
  }, [id, isAdmin]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getById(id);
      const c = res.data.data.complaint;
      setComplaint(c);
      setUpvotes(c.upvoteCount || 0);
      setHasUpvoted(c.hasUpvoted || false);
      setEditData({
        status: c.status,
        priority: c.priority,
        category: c.category,
        location: c.location,
        block: c.block || '',
        roomArea: c.roomArea || '',
        assignedTo: c.assignedTo?._id || '',
        resolutionNotes: c.resolutionNotes || '',
        statusNote: ''
      });
    } catch (err) {
      toast.error('Failed to load complaint details.');
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await adminService.getStaff();
      setStaffList(res.data.data.staff || []);
    } catch {}
  };

  const handleUpvote = async () => {
    try {
      const res = await complaintService.upvote(complaint._id);
      setHasUpvoted(res.data.data.upvoted);
      setUpvotes(res.data.data.upvoteCount);
      toast.success(res.data.data.upvoted ? 'Upvoted! Priority signal recorded.' : 'Upvote removed.');
    } catch (err) {
      toast.error('Could not update upvote.');
    }
  };

  const handleVerification = async (isFixed) => {
    if (!isFixed) {
      setReopenModal(true);
      return;
    }

    setVerifying(true);
    try {
      await complaintService.verifyResolution(complaint._id, {
        verified: true,
        notes: 'Student confirmed issue is fully resolved.'
      });
      toast.success('Confirmed! Issue marked as closed.');
      fetchComplaint();
    } catch (err) {
      toast.error('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!reopenReason.trim()) {
      toast.error('Please describe what is still wrong.');
      return;
    }

    setVerifying(true);
    try {
      await complaintService.verifyResolution(complaint._id, {
        verified: false,
        notes: reopenReason.trim()
      });
      toast.success('Complaint reopened and escalated to maintenance team.');
      setReopenModal(false);
      setReopenReason('');
      fetchComplaint();
    } catch (err) {
      toast.error('Failed to reopen complaint.');
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    const formData = new FormData();
    Object.keys(editData).forEach(k => {
      if (editData[k] !== undefined) formData.append(k, editData[k]);
    });

    if (afterImageFile) {
      formData.append('image', afterImageFile);
      formData.append('isAfterImage', 'true');
    }

    try {
      await complaintService.update(id, formData);
      toast.success('Complaint status updated.');
      setEditing(false);
      setAfterImageFile(null);
      setAfterImagePreview('');
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommenting(true);
    try {
      await complaintService.addComment(id, { text: commentText.trim() });
      setCommentText('');
      toast.success('Comment logged.');
      fetchComplaint();
    } catch (err) {
      toast.error('Failed to add comment.');
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await complaintService.delete(id);
      toast.success('Complaint removed.');
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) return null;

  const isReporter = complaint.reporter?._id?.toString() === user?._id?.toString();
  const canEdit = isAdmin || isStaff || (isReporter && complaint.status === 'Submitted');
  const canDelete = isAdmin || (isReporter && complaint.status === 'Submitted');
  const slaRemaining = getSlaTimeRemaining(complaint.sla?.deadline || complaint.dueDate);

  // Before & After image sources
  const beforeImg = complaint.beforeImage || complaint.image;
  const afterImg = complaint.afterImage;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#DEDAD3]">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost text-xs text-[#68675F] hover:text-[#292A26] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to queue</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                hasUpvoted
                  ? 'bg-[#9F8170] text-white shadow-sm'
                  : 'bg-white hover:bg-[#F0EBE6] text-[#3B3C36] border border-[#DEDAD3]'
              }`}
            >
              <ArrowBigUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current text-white' : 'text-[#77766F]'}`} />
              <span>{upvotes} students affected</span>
            </button>

            {canEdit && (
              <button
                onClick={() => setEditing(!editing)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-[#9F8170]" />
                <span>{editing ? 'Close Editor' : 'Update Ticket'}</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* STUDENT RESOLUTION VERIFICATION LOOP (Feature 8) */}
        {isReporter && complaint.status === 'Resolved' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-[#EEF1E7] border-2 border-[#8A9A5B]/40 text-[#3B3C36] shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-[#2D5A27] flex items-center justify-center border border-[#8A9A5B]/30 shadow-sm">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292A26]">
                  Maintenance marked this issue as resolved. Is it actually fixed?
                </h3>
                <p className="text-xs text-[#68675F]">
                  Please verify physical resolution. If unresolved, our system will automatically reopen and escalate the ticket.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => handleVerification(true)}
                disabled={verifying}
                className="btn-palm text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>✓ Yes, issue is resolved</span>
              </button>
              <button
                onClick={() => handleVerification(false)}
                disabled={verifying}
                className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>✕ Still not fixed</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Grid: Ticket Details vs Lifecycle Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Details & Proof */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header Card */}
            <div className="card space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`badge ${getStatusClass(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`badge ${getPriorityClass(complaint.priority)}`}>
                      {complaint.priority} Priority
                    </span>
                    <span className="text-xs font-mono text-[#68675F] font-medium">
                      ID: {complaint._id.substring(complaint._id.length - 8).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold font-display text-[#292A26]">
                    {complaint.title}
                  </h1>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] flex items-center justify-center text-xl shrink-0">
                  {getCategoryIcon(complaint.category)}
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-[#F0EBE6]/60 border border-[#DEDAD3] text-xs text-[#4A4943] leading-relaxed font-normal">
                {complaint.description}
              </div>

              {/* Resolution Proof: Before & After Slider (Feature 7) */}
              {beforeImg && afterImg ? (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2D5A27] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8A9A5B]" /> Verified Resolution Proof (Before vs After)
                  </h4>
                  <BeforeAfterSlider
                    beforeImage={getImageUrl(beforeImg)}
                    afterImage={getImageUrl(afterImg)}
                  />
                </div>
              ) : beforeImg ? (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#68675F]">
                    Defect Image Evidence
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-[#DEDAD3] max-h-72 bg-[#F0EBE6]">
                    <img
                      src={getImageUrl(beforeImg)}
                      alt="Defect"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : null}

              {/* Contextual AI Analysis card */}
              {complaint.aiAnalysis && (
                <div className="p-4 rounded-xl bg-[#EEF1E7] border border-[#8A9A5B]/30 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[#2D5A27] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#8A9A5B]" /> AI Triage Record
                    </span>
                    <span>Confidence: {complaint.aiAnalysis.confidence || 94}%</span>
                  </div>
                  <p className="text-[#4A4943] font-sans">
                    <strong className="text-[#292A26]">Recommendation:</strong> {complaint.aiAnalysis.suggestedAction || 'Direct dispatch to specialist team.'}
                  </p>
                </div>
              )}
            </div>

            {/* Inline Editor Drawer for Staff / Admin */}
            <AnimatePresence>
              {editing && canEdit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card border-[#9F8170]/40 space-y-4 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2">
                    Update Ticket Status & Staff Work
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Status</label>
                      <select
                        value={editData.status}
                        onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                        className="input"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {isAdmin && (
                      <div>
                        <label className="input-label">Priority</label>
                        <select
                          value={editData.priority}
                          onChange={e => setEditData(p => ({ ...p, priority: e.target.value }))}
                          className="input"
                        >
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    )}

                    {isAdmin && (
                      <div>
                        <label className="input-label">Assign Technician</label>
                        <select
                          value={editData.assignedTo}
                          onChange={e => setEditData(p => ({ ...p, assignedTo: e.target.value }))}
                          className="input"
                        >
                          <option value="">Unassigned</option>
                          {staffList.map(s => (
                            <option key={s._id} value={s._id}>{s.name} ({s.department})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="col-span-1 sm:col-span-2">
                      <label className="input-label">Status Change Note</label>
                      <input
                        type="text"
                        value={editData.statusNote}
                        onChange={e => setEditData(p => ({ ...p, statusNote: e.target.value }))}
                        placeholder="Log reason for status update..."
                        className="input"
                      />
                    </div>

                    {/* After Image Upload for proof of resolution */}
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                      <label className="input-label">Upload After-Repair Proof Image</label>
                      {afterImagePreview ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#DEDAD3] bg-[#F0EBE6]">
                          <img src={afterImagePreview} alt="After Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => { setAfterImageFile(null); setAfterImagePreview(''); }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#3B3C36]/80 text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-[#DEDAD3] hover:border-[#9F8170] rounded-xl p-4 text-center cursor-pointer bg-[#F0EBE6]/40 hover:bg-[#F0EBE6]"
                        >
                          <Upload className="w-5 h-5 text-[#77766F] mx-auto mb-1" />
                          <span className="text-xs text-[#3B3C36] font-semibold">Upload completion photo for Before/After comparison</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (!f) return;
                          setAfterImageFile(f);
                          const r = new FileReader();
                          r.onload = (ev) => setAfterImagePreview(ev.target.result);
                          r.readAsDataURL(f);
                        }}
                        className="hidden"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="input-label">Resolution Details</label>
                      <textarea
                        value={editData.resolutionNotes}
                        onChange={e => setEditData(p => ({ ...p, resolutionNotes: e.target.value }))}
                        rows={2}
                        placeholder="Technical notes on parts replaced or work completed..."
                        className="input resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={updating}
                      className="btn-primary text-xs"
                    >
                      {updating ? 'Saving...' : 'Save & Broadcast Update'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Satisfaction Feedback Form */}
            {isReporter && ['Resolved', 'Closed'].includes(complaint.status) && !complaint.feedback && (
              <FeedbackForm complaintId={complaint._id} onSubmitted={fetchComplaint} />
            )}

            {/* Comments Thread */}
            <div className="card space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9F8170]" />
                Activity Thread & Comments ({complaint.comments?.length || 0})
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {complaint.comments?.length === 0 ? (
                  <p className="text-xs text-[#77766F] text-center py-4 font-medium">No comments logged yet.</p>
                ) : (
                  complaint.comments.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#F0EBE6]/60 border border-[#DEDAD3] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#292A26]">
                          {c.user?.name} <span className="text-[10px] text-[#68675F] font-mono capitalize">({c.user?.role})</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#77766F]">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-[#4A4943]">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post an update or question..."
                  className="input text-xs"
                />
                <button
                  type="submit"
                  disabled={commenting || !commentText.trim()}
                  className="btn-primary text-xs px-4"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Metadata & Status Timeline */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="card space-y-3 text-xs font-mono shadow-sm">
              <h4 className="font-bold text-[#292A26] text-xs uppercase tracking-wider pb-2 border-b border-[#DEDAD3]">
                Ticket Metadata
              </h4>

              <div className="flex justify-between">
                <span className="text-[#68675F]">Location:</span>
                <span className="text-[#292A26] font-semibold">{complaint.location}</span>
              </div>

              {complaint.block && (
                <div className="flex justify-between">
                  <span className="text-[#68675F]">Block/Wing:</span>
                  <span className="text-[#3B3C36]">{complaint.block}</span>
                </div>
              )}

              {complaint.roomArea && (
                <div className="flex justify-between">
                  <span className="text-[#68675F]">Room/Area:</span>
                  <span className="text-[#3B3C36]">{complaint.roomArea}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#68675F]">Reporter:</span>
                <span className="text-[#292A26] font-semibold">
                  {complaint.isAnonymous ? 'Anonymous Student' : complaint.reporter?.name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#68675F]">Assigned Tech:</span>
                <span className="text-[#2D5A27] font-semibold">
                  {complaint.assignedTo?.name || 'Pending Assignment'}
                </span>
              </div>

              {/* SLA Target & Status */}
              <div className="p-2.5 rounded-lg bg-[#F0EBE6] border border-[#DEDAD3] space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#68675F]">SLA Resolution Target:</span>
                  <span className="text-[#292A26] font-bold">{complaint.sla?.targetHours || 24}h</span>
                </div>
                {slaRemaining && !['Resolved', 'Closed'].includes(complaint.status) && (
                  <div className={`text-[11px] font-bold ${slaRemaining.isBreached ? 'text-red-700' : 'text-[#2D5A27]'}`}>
                    ⏱ {slaRemaining.text}
                  </div>
                )}
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div className="card space-y-3 shadow-sm">
              <h4 className="font-bold text-[#292A26] text-xs uppercase tracking-wider pb-2 border-b border-[#DEDAD3] font-mono">
                Lifecycle Progression
              </h4>
              <StatusTimeline history={complaint.statusHistory} />
            </div>
          </div>
        </div>

        {/* Reopen Modal for Student */}
        <AnimatePresence>
          {reopenModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B3C36]/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card max-w-md w-full space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-[#292A26] text-base">Reopen Complaint</h3>
                </div>
                <p className="text-xs text-[#68675F]">
                  Please describe what is still wrong so the supervisor can reassign the technician with priority.
                </p>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Water is still leaking from the pipe joint when water pressure rises..."
                  className="input text-xs resize-none"
                />
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setReopenModal(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReopenSubmit}
                    disabled={verifying}
                    className="btn-danger text-xs"
                  >
                    {verifying ? 'Reopening...' : 'Confirm & Reopen Ticket'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm}
          title="Delete Complaint"
          message="Are you sure you want to permanently delete this complaint ticket?"
          confirmText="Yes, Delete Ticket"
          isDanger={true}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetailPage;

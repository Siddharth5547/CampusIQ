import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  getPriorityClass, getStatusClass, getCategoryIcon,
  timeAgo, truncate, getSlaTimeRemaining
} from '../utils/helpers';
import { MapPin, Calendar, User, MessageSquare, ArrowRight, ArrowBigUp, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services';
import toast from 'react-hot-toast';

const ComplaintCard = ({ complaint, index = 0, onUpvoteToggle }) => {
  const [upvoted, setUpvoted] = useState(complaint.hasUpvoted || false);
  const [upvotes, setUpvotes] = useState(complaint.upvoteCount || 0);
  const [upvoteLoading, setUpvoteLoading] = useState(false);

  const isCritical = complaint.priority === 'Critical';
  const slaRemaining = getSlaTimeRemaining(complaint.sla?.deadline || complaint.dueDate);

  const handleUpvoteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUpvoteLoading(true);
    try {
      const res = await complaintService.upvote(complaint._id);
      setUpvoted(res.data.data.upvoted);
      setUpvotes(res.data.data.upvoteCount);
      toast.success(res.data.data.upvoted ? 'Upvoted this issue!' : 'Upvote removed.');
      if (onUpvoteToggle) onUpvoteToggle(complaint._id, res.data.data);
    } catch (err) {
      toast.error('Could not update upvote.');
    } finally {
      setUpvoteLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="card-hover relative overflow-hidden group bg-white"
    >
      {/* Priority accent hairline top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{
          background: isCritical ? '#991B1B' :
            complaint.priority === 'High' ? '#C05621' :
            complaint.priority === 'Medium' ? '#9F8170' : '#8A9A5B'
        }}
      />

      <div className="flex items-start gap-3.5">
        {/* Category icon */}
        <div className="w-10 h-10 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] flex items-center justify-center text-lg shrink-0 mt-0.5 group-hover:border-[#9F8170] transition-colors">
          {getCategoryIcon(complaint.category)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link
              to={`/complaints/${complaint._id}`}
              className="text-[#292A26] font-semibold text-sm hover:text-[#9F8170] transition-colors line-clamp-1 flex items-center gap-1.5"
            >
              <span>{complaint.title}</span>
              {complaint.afterImage && (
                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#EEF1E7] text-[#2D5A27] border border-[#8A9A5B]/40 font-semibold">
                  <Sparkles className="w-3 h-3" /> Proof
                </span>
              )}
            </Link>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`badge ${getPriorityClass(complaint.priority)}`}>
                {complaint.priority}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#4A4943] text-xs mb-3 line-clamp-2 leading-relaxed">
            {truncate(complaint.description, 110)}
          </p>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#68675F] font-mono">
            <span className="flex items-center gap-1 text-[#3B3C36] font-medium">
              <MapPin className="w-3 h-3 text-[#9F8170]" />
              {complaint.location} {complaint.block ? `· ${complaint.block}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#77766F]" />
              {timeAgo(complaint.createdAt)}
            </span>
            {complaint.reporter?.name && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-[#77766F]" />
                {complaint.isAnonymous ? 'Anonymous' : complaint.reporter.name}
              </span>
            )}
            {complaint.comments?.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#77766F]" />
                {complaint.comments.length}
              </span>
            )}
            {/* SLA Badge */}
            {slaRemaining && !['Resolved', 'Closed'].includes(complaint.status) && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                slaRemaining.isBreached
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-[#F0EBE6] text-[#3B3C36] border border-[#DEDAD3]'
              }`}>
                <Clock className="w-2.5 h-2.5" />
                {slaRemaining.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer with upvote signal and status */}
      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#DEDAD3]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${getStatusClass(complaint.status)}`}>
            {complaint.status}
          </span>
          <button
            type="button"
            onClick={handleUpvoteClick}
            disabled={upvoteLoading}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              upvoted
                ? 'bg-[#9F8170] text-white border border-[#9F8170]'
                : 'bg-[#F7F5F0] hover:bg-[#F0EBE6] text-[#3B3C36] border border-[#DEDAD3]'
            }`}
            title="Community affected signal"
          >
            <ArrowBigUp className={`w-3.5 h-3.5 ${upvoted ? 'fill-current text-white' : 'text-[#9F8170]'}`} />
            <span>{upvotes} affected</span>
          </button>
        </div>

        <Link
          to={`/complaints/${complaint._id}`}
          className="flex items-center gap-1 text-xs font-semibold text-[#9F8170] hover:text-[#292A26] transition-colors"
        >
          <span>Manage</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;

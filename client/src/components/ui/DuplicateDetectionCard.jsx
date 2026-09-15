import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowBigUp, ExternalLink, X, Check, ThumbsUp } from 'lucide-react';
import { getStatusClass, timeAgo } from '../../utils/helpers';
import { complaintService } from '../../services';
import toast from 'react-hot-toast';

const DuplicateDetectionCard = ({
  duplicates = [],
  onDismiss,
  onUpvoteSuccess
}) => {
  const [upvotedMap, setUpvotedMap] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  if (!duplicates || duplicates.length === 0) return null;

  const handleUpvote = async (complaintId) => {
    setLoadingId(complaintId);
    try {
      const res = await complaintService.upvote(complaintId);
      setUpvotedMap(prev => ({
        ...prev,
        [complaintId]: {
          upvoted: res.data.data.upvoted,
          count: res.data.data.upvoteCount
        }
      }));
      toast.success(res.data.data.upvoted ? 'Upvoted! Priority signal recorded.' : 'Upvote removed.');
      if (onUpvoteSuccess) onUpvoteSuccess(complaintId, res.data.data);
    } catch (err) {
      toast.error('Failed to upvote complaint.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className="p-5 rounded-2xl bg-[#F0EBE6] border border-[#9F8170]/40 text-[#3B3C36] shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#9F8170]/20 text-[#3B3C36] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#9F8170]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#292A26]">
              Looks like this issue may already be reported
            </h4>
            <p className="text-xs text-[#68675F]">
              Upvoting an existing complaint helps administration prioritize it without creating duplicates.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#77766F] hover:text-[#292A26] p-1 rounded-lg hover:bg-[#DEDAD3]/40 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5 my-3">
        {duplicates.map(({ complaint, similarity }) => {
          const isUpvoted = upvotedMap[complaint._id]?.upvoted;
          const currentCount = upvotedMap[complaint._id]?.count ?? (complaint.upvoteCount || 0);

          return (
            <div
              key={complaint._id}
              className="p-3.5 rounded-xl bg-white border border-[#DEDAD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`badge ${getStatusClass(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className="text-[11px] font-mono text-[#2D5A27] font-bold">
                    {similarity}% match
                  </span>
                  <span className="text-xs text-[#68675F]">
                    Reported {timeAgo(complaint.createdAt)}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-[#292A26] truncate">
                  {complaint.title}
                </h5>
                <p className="text-xs text-[#68675F]">
                  {complaint.location} {complaint.block ? `· ${complaint.block}` : ''} · {complaint.category}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleUpvote(complaint._id)}
                  disabled={loadingId === complaint._id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isUpvoted
                      ? 'bg-[#9F8170] text-white shadow-sm'
                      : 'bg-white hover:bg-[#F0EBE6] text-[#3B3C36] border border-[#DEDAD3]'
                  }`}
                >
                  <ArrowBigUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
                  <span>{currentCount} affected</span>
                </button>

                <Link
                  to={`/complaints/${complaint._id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#3B3C36] hover:text-[#292A26] bg-[#F0EBE6] border border-[#DEDAD3] hover:bg-[#EAE5DF] transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#DEDAD3] text-xs">
        <span className="text-[#68675F]">
          Already upvoted or issue is different?
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#9F8170] hover:text-[#8A6D5D] font-bold cursor-pointer underline underline-offset-4"
        >
          Create new complaint anyway
        </button>
      </div>
    </motion.div>
  );
};

export default DuplicateDetectionCard;

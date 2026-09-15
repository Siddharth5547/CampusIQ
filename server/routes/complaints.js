const express = require('express');
const router = express.Router();
const {
  getComplaints, checkDuplicates, upvoteComplaint, verifyResolution,
  createComplaint, getComplaint, updateComplaint, deleteComplaint,
  analyzeComplaintAI, addComment, submitFeedback
} = require('../controllers/complaintController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, getComplaints);
router.post('/check-duplicates', auth, checkDuplicates);
router.post('/', auth, authorize('student', 'admin'), upload.single('image'), createComplaint);
router.post('/analyze', auth, analyzeComplaintAI);
router.get('/:id', auth, getComplaint);
router.put('/:id', auth, upload.single('image'), updateComplaint);
router.delete('/:id', auth, deleteComplaint);
router.post('/:id/upvote', auth, upvoteComplaint);
router.post('/:id/verify', auth, authorize('student', 'admin'), verifyResolution);
router.post('/:id/comments', auth, addComment);
router.post('/:id/feedback', auth, authorize('student'), submitFeedback);

module.exports = router;

const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { analyzeComplaint } = require('../services/aiService');
const notificationService = require('../services/notificationService');
const path = require('path');
const fs = require('fs');

const SLA_HOURS = {
  Critical: 2,
  High: 8,
  Medium: 24,
  Low: 72
};

// Helper to mask anonymous reporter
const formatComplaintForUser = (complaint, user) => {
  const c = complaint.toObject ? complaint.toObject() : { ...complaint };
  if (c.isAnonymous && user.role !== 'admin' && c.reporter?._id?.toString() !== user._id.toString()) {
    c.reporter = {
      _id: c.reporter._id,
      name: 'Anonymous Student',
      email: '',
      studentId: ''
    };
  }
  // Check SLA breach dynamically
  if (c.sla?.deadline && !['Resolved', 'Closed'].includes(c.status)) {
    if (new Date() > new Date(c.sla.deadline)) {
      c.sla.isBreached = true;
    }
  }
  return c;
};

// @desc    Get all complaints (with filters)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const {
      status, priority, category, location, assignedTo,
      search, page = 1, limit = 10, sort = '-createdAt'
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.reporter = req.user._id;
    } else if (req.user.role === 'staff') {
      query.assignedTo = req.user._id;
    }
    // admin sees all

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (location) query.location = location;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [rawComplaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('reporter', 'name email studentId')
        .populate('assignedTo', 'name email department')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(query)
    ]);

    const complaints = rawComplaints.map(c => formatComplaintForUser(c, req.user));

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check for duplicate complaints in real-time
// @route   POST /api/complaints/check-duplicates
// @access  Private
const checkDuplicates = async (req, res, next) => {
  try {
    const { title, description, category, location, block } = req.body;

    if (!title && !description) {
      return res.json({ success: true, data: { duplicates: [] } });
    }

    // Active complaints to match against
    const activeStatuses = ['Submitted', 'AI Analyzed', 'Under Review', 'Assigned', 'In Progress', 'Reopened', 'Escalated'];

    // Find candidates in same location or category
    const candidates = await Complaint.find({
      status: { $in: activeStatuses },
      $or: [
        ...(location ? [{ location }] : []),
        ...(category ? [{ category }] : [])
      ]
    })
      .select('title description category location block status upvoteCount createdAt image reporter')
      .populate('reporter', 'name')
      .sort('-createdAt')
      .limit(15);

    // Compute similarity score based on keywords & attributes
    const inputKeywords = `${title || ''} ${description || ''}`
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const matches = [];

    for (const item of candidates) {
      let score = 0;
      if (location && item.location === location) score += 30;
      if (category && item.category === category) score += 30;
      if (block && item.block && item.block.toLowerCase() === block.toLowerCase()) score += 15;

      const itemKeywords = `${item.title} ${item.description}`
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3);

      let commonWords = 0;
      for (const word of inputKeywords) {
        if (itemKeywords.includes(word)) commonWords++;
      }

      if (inputKeywords.length > 0) {
        score += Math.min(25, Math.round((commonWords / inputKeywords.length) * 40));
      }

      if (score >= 45) {
        matches.push({
          complaint: {
            _id: item._id,
            title: item.title,
            category: item.category,
            location: item.location,
            block: item.block,
            status: item.status,
            upvoteCount: item.upvoteCount || 0,
            createdAt: item.createdAt,
            image: item.image
          },
          similarity: Math.min(98, score)
        });
      }
    }

    // Sort by highest similarity
    matches.sort((a, b) => b.similarity - a.similarity);

    res.json({
      success: true,
      data: {
        duplicates: matches.slice(0, 3)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private
const upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const userIdStr = req.user._id.toString();
    const upvotes = complaint.upvotes || [];
    const index = upvotes.findIndex(id => id.toString() === userIdStr);

    let upvoted = false;
    if (index === -1) {
      upvotes.push(req.user._id);
      upvoted = true;
    } else {
      upvotes.splice(index, 1);
      upvoted = false;
    }

    complaint.upvotes = upvotes;
    complaint.upvoteCount = upvotes.length;

    // Upvoting signal: if upvotes exceed 10 and priority is Medium, bump priority
    if (complaint.upvoteCount >= 10 && ['Low', 'Medium'].includes(complaint.priority)) {
      complaint.priority = 'High';
      complaint.statusHistory.push({
        status: complaint.status,
        changedBy: req.user._id,
        note: `Priority elevated to High due to community upvotes (${complaint.upvoteCount} affected).`,
        timestamp: new Date()
      });
    }

    await complaint.save();

    res.json({
      success: true,
      data: {
        upvoted,
        upvoteCount: complaint.upvoteCount,
        priority: complaint.priority
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify complaint resolution (student feedback loop)
// @route   POST /api/complaints/:id/verify
// @access  Private (student, admin)
const verifyResolution = async (req, res, next) => {
  try {
    const { verified, notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'student' && complaint.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the reporter can verify resolution.' });
    }

    if (verified === true || verified === 'true') {
      complaint.status = 'Closed';
      complaint.verification = {
        status: 'Verified',
        notes: notes || 'Student confirmed issue is fully resolved.',
        verifiedAt: new Date()
      };
      complaint.statusHistory.push({
        status: 'Closed',
        changedBy: req.user._id,
        note: `Resolution verified by student: ${notes || 'Issue confirmed resolved.'}`,
        timestamp: new Date()
      });
    } else {
      complaint.status = 'Reopened';
      complaint.verification = {
        status: 'Rejected',
        notes: notes || 'Student indicated issue was not fixed.',
        verifiedAt: new Date()
      };
      complaint.statusHistory.push({
        status: 'Reopened',
        changedBy: req.user._id,
        note: `Verification rejected. Student reported: ${notes || 'Issue is still not fixed.'}`,
        timestamp: new Date()
      });

      // Notify assigned staff / admin
      if (complaint.assignedTo) {
        await notificationService.notifyStatusChanged(
          complaint.assignedTo, complaint._id, complaint.title, 'Reopened'
        );
      }
    }

    await complaint.save();
    const updated = formatComplaintForUser(complaint, req.user);

    res.json({
      success: true,
      message: verified ? 'Thank you! Complaint marked as resolved and closed.' : 'Complaint has been reopened for further maintenance.',
      data: { complaint: updated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a complaint
// @route   POST /api/complaints
// @access  Private (student, admin)
const createComplaint = async (req, res, next) => {
  try {
    const {
      title, description, category, priority, location,
      block, roomArea, floor, qrCode, contactInfo, isAnonymous
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, category and location are required.' });
    }

    const assignedPriority = priority || 'Medium';
    const targetHours = SLA_HOURS[assignedPriority] || 24;
    const deadline = new Date(Date.now() + targetHours * 3600 * 1000);

    const complaintData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority: assignedPriority,
      location,
      block: block || '',
      roomArea: roomArea || '',
      floor: floor || '',
      qrCode: qrCode || '',
      contactInfo: contactInfo || '',
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      reporter: req.user._id,
      dueDate: deadline,
      sla: {
        targetHours,
        deadline,
        isBreached: false
      },
      statusHistory: [{
        status: 'Submitted',
        changedBy: req.user._id,
        note: 'Complaint submitted by user.',
        timestamp: new Date()
      }]
    };

    if (req.file) {
      complaintData.image = `/uploads/${req.file.filename}`;
      complaintData.beforeImage = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create(complaintData);
    await complaint.populate('reporter', 'name email studentId');

    // Send notification to reporter
    await notificationService.notifyComplaintSubmitted(req.user._id, complaint._id, complaint.title);

    // Notify admins of high/critical priority
    if (['High', 'Critical'].includes(complaint.priority)) {
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id);
      if (adminIds.length > 0) {
        await notificationService.notifyHighPriority(adminIds, complaint._id, complaint.title, complaint.priority);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      data: { complaint: formatComplaintForUser(complaint, req.user) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporter', 'name email studentId phone')
      .populate('assignedTo', 'name email department phone')
      .populate('comments.user', 'name role')
      .populate('statusHistory.changedBy', 'name role')
      .populate('feedback');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Access control
    if (req.user.role === 'student' && complaint.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint.' });
    }
    if (req.user.role === 'staff' && complaint.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint.' });
    }

    complaint.viewCount += 1;
    await complaint.save({ validateBeforeSave: false });

    const formatted = formatComplaintForUser(complaint, req.user);
    // Add user's upvote state
    formatted.hasUpvoted = (complaint.upvotes || []).some(id => id.toString() === req.user._id.toString());

    res.json({ success: true, data: { complaint: formatted } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Permission check
    if (req.user.role === 'student') {
      if (complaint.reporter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (!['Submitted'].includes(complaint.status)) {
        return res.status(400).json({ success: false, message: 'Cannot edit complaint after it has been reviewed.' });
      }
    }

    const {
      title, description, category, priority, location, block, roomArea,
      status, assignedTo, resolutionNotes, contactInfo, department, afterImage
    } = req.body;

    const oldStatus = complaint.status;

    // Update fields
    if (title && (req.user.role !== 'student' || complaint.status === 'Submitted')) complaint.title = title.trim();
    if (description && (req.user.role !== 'student' || complaint.status === 'Submitted')) complaint.description = description.trim();
    if (category && req.user.role !== 'student') complaint.category = category;
    if (priority && req.user.role !== 'student') {
      complaint.priority = priority;
      const hours = SLA_HOURS[priority] || 24;
      complaint.sla.targetHours = hours;
      complaint.sla.deadline = new Date(Date.now() + hours * 3600 * 1000);
      complaint.dueDate = complaint.sla.deadline;
    }
    if (location) complaint.location = location;
    if (block !== undefined) complaint.block = block;
    if (roomArea !== undefined) complaint.roomArea = roomArea;
    if (department !== undefined && req.user.role !== 'student') complaint.department = department;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (contactInfo !== undefined) complaint.contactInfo = contactInfo;
    if (afterImage) complaint.afterImage = afterImage;

    // Status update
    if (status && req.user.role !== 'student') {
      complaint.status = status;
      complaint.statusHistory.push({
        status,
        changedBy: req.user._id,
        note: req.body.statusNote || `Status changed to ${status}`,
        timestamp: new Date()
      });

      if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
        if (req.file) {
          complaint.afterImage = `/uploads/${req.file.filename}`;
        }
        await notificationService.notifyComplaintResolved(
          complaint.reporter, complaint._id, complaint.title
        );
      } else if (status !== oldStatus) {
        await notificationService.notifyStatusChanged(
          complaint.reporter, complaint._id, complaint.title, status
        );
      }
    }

    // Student reopen
    if (req.user.role === 'student' && req.body.reopen && complaint.status === 'Resolved') {
      complaint.status = 'Reopened';
      complaint.statusHistory.push({
        status: 'Reopened',
        changedBy: req.user._id,
        note: req.body.reopenReason || 'Complaint reopened by student.',
        timestamp: new Date()
      });
    }

    // Assign staff
    if (assignedTo !== undefined && req.user.role === 'admin') {
      const prevAssigned = complaint.assignedTo;
      complaint.assignedTo = assignedTo || null;
      if (assignedTo && assignedTo !== prevAssigned?.toString()) {
        if (complaint.status === 'Submitted' || complaint.status === 'Under Review' || complaint.status === 'AI Analyzed') {
          complaint.status = 'Assigned';
          complaint.statusHistory.push({
            status: 'Assigned',
            changedBy: req.user._id,
            note: `Complaint assigned to staff.`,
            timestamp: new Date()
          });
        }
        await notificationService.notifyComplaintAssigned(
          complaint.reporter, assignedTo, complaint._id, complaint.title
        );
      }
    }

    // File upload (if uploaded during Resolved, save as afterImage)
    if (req.file) {
      if (status === 'Resolved' || req.body.isAfterImage === 'true') {
        complaint.afterImage = `/uploads/${req.file.filename}`;
      } else {
        complaint.image = `/uploads/${req.file.filename}`;
        if (!complaint.beforeImage) complaint.beforeImage = complaint.image;
      }
    }

    await complaint.save();
    await complaint.populate(['reporter', 'assignedTo', 'comments.user']);

    res.json({
      success: true,
      message: 'Complaint updated successfully.',
      data: { complaint: formatComplaintForUser(complaint, req.user) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (admin, or student if status=Submitted)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === 'student') {
      if (complaint.reporter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (complaint.status !== 'Submitted') {
        return res.status(400).json({ success: false, message: 'Cannot delete complaint after processing has begun.' });
      }
    }

    // Delete image if exists
    if (complaint.image) {
      const imagePath = path.join(__dirname, '..', complaint.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    if (complaint.afterImage) {
      const afterImagePath = path.join(__dirname, '..', complaint.afterImage);
      if (fs.existsSync(afterImagePath)) fs.unlinkSync(afterImagePath);
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Complaint deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze complaint with AI
// @route   POST /api/complaints/analyze
// @access  Private
const analyzeComplaintAI = async (req, res, next) => {
  try {
    const { title, description, complaintId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required for AI analysis.' });
    }

    const analysis = await analyzeComplaint(title, description);

    // If complaint ID provided, save analysis to complaint
    if (complaintId) {
      await Complaint.findByIdAndUpdate(complaintId, {
        aiAnalysis: { ...analysis, analyzedAt: new Date() },
        status: 'AI Analyzed'
      });
    }

    res.json({
      success: true,
      message: 'AI analysis complete!',
      data: { analysis }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text, isInternal } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
      isInternal: isInternal && req.user.role !== 'student'
    };

    complaint.comments.push(comment);
    await complaint.save();

    // Notify reporter about new comment (if commenter is not the reporter)
    if (complaint.reporter.toString() !== req.user._id.toString()) {
      await notificationService.notifyNewComment(
        complaint.reporter, complaint._id, complaint.title, req.user.name
      );
    }

    await complaint.populate('comments.user', 'name role');
    const newComment = complaint.comments[complaint.comments.length - 1];

    res.status(201).json({ success: true, message: 'Comment added.', data: { comment: newComment } });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for resolved complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private (student)
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the reporter can submit feedback.' });
    }

    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved complaints.' });
    }

    if (complaint.feedback) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this complaint.' });
    }

    const responseTime = complaint.resolvedAt
      ? Math.ceil((complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60 * 24))
      : null;

    const feedback = await Feedback.create({
      complaint: complaint._id,
      user: req.user._id,
      rating: parseInt(rating),
      comment: comment || '',
      responseTime
    });

    complaint.feedback = feedback._id;
    complaint.status = 'Closed';
    complaint.statusHistory.push({
      status: 'Closed',
      changedBy: req.user._id,
      note: 'Complaint closed after feedback submission.',
      timestamp: new Date()
    });
    await complaint.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, message: 'Feedback submitted. Thank you!', data: { feedback } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  checkDuplicates,
  upvoteComplaint,
  verifyResolution,
  createComplaint,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  analyzeComplaintAI,
  addComment,
  submitFeedback
};

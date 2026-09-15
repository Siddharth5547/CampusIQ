const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'general', complaintId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      complaint: complaintId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

const notifyComplaintSubmitted = async (reporterId, complaintId, complaintTitle) => {
  return createNotification(
    reporterId,
    'Complaint Submitted',
    `Your complaint "${complaintTitle}" has been submitted successfully and is under review.`,
    'complaint_submitted',
    complaintId
  );
};

const notifyComplaintAssigned = async (reporterId, staffId, complaintId, complaintTitle) => {
  await createNotification(
    reporterId,
    'Complaint Assigned',
    `Your complaint "${complaintTitle}" has been assigned to a maintenance team member.`,
    'complaint_assigned',
    complaintId
  );
  if (staffId) {
    await createNotification(
      staffId,
      'New Complaint Assigned',
      `A new complaint "${complaintTitle}" has been assigned to you. Please review and begin work.`,
      'complaint_assigned',
      complaintId
    );
  }
};

const notifyStatusChanged = async (reporterId, complaintId, complaintTitle, newStatus) => {
  return createNotification(
    reporterId,
    'Complaint Status Updated',
    `Your complaint "${complaintTitle}" status has been updated to "${newStatus}".`,
    'status_changed',
    complaintId
  );
};

const notifyComplaintResolved = async (reporterId, complaintId, complaintTitle) => {
  return createNotification(
    reporterId,
    'Complaint Resolved! 🎉',
    `Great news! Your complaint "${complaintTitle}" has been resolved. Please provide feedback to help us improve.`,
    'complaint_resolved',
    complaintId
  );
};

const notifyHighPriority = async (adminIds, complaintId, complaintTitle, priority) => {
  const notifications = adminIds.map(adminId =>
    createNotification(
      adminId,
      `${priority} Priority Complaint`,
      `A ${priority.toLowerCase()} priority complaint "${complaintTitle}" requires immediate attention.`,
      'high_priority',
      complaintId
    )
  );
  return Promise.all(notifications);
};

const notifyNewComment = async (userId, complaintId, complaintTitle, commenterName) => {
  return createNotification(
    userId,
    'New Comment on Your Complaint',
    `${commenterName} commented on your complaint "${complaintTitle}".`,
    'new_comment',
    complaintId
  );
};

module.exports = {
  createNotification,
  notifyComplaintSubmitted,
  notifyComplaintAssigned,
  notifyStatusChanged,
  notifyComplaintResolved,
  notifyHighPriority,
  notifyNewComment
};

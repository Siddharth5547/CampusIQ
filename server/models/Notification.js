const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['complaint_submitted', 'complaint_assigned', 'status_changed', 'complaint_resolved',
           'complaint_reopened', 'new_comment', 'high_priority', 'general'],
    default: 'general'
  },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  read: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

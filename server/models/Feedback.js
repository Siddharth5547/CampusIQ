const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: { type: String, trim: true, maxlength: [500, 'Comment cannot exceed 500 characters'], default: '' },
  isHelpful: { type: Boolean, default: null },
  responseTime: { type: Number }, // days to resolve
  staffBehavior: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

feedbackSchema.index({ complaint: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

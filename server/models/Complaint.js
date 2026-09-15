const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  isInternal: { type: Boolean, default: false }
}, { timestamps: true });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const aiAnalysisSchema = new mongoose.Schema({
  category: String,
  priority: String,
  department: String,
  summary: String,
  suggestedAction: String,
  reason: String,
  confidence: { type: Number, default: 0 },
  analyzedAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electrical', 'Plumbing', 'Water Supply', 'Sewage / Drainage', 'Cleaning', 
           'Furniture', 'Wi-Fi / Internet', 'AC / Fan', 'Security', 'Construction', 'Garbage', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: [
      'Submitted',
      'AI Analyzed',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Verification',
      'Closed',
      'Reopened',
      'Escalated'
    ],
    default: 'Submitted'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    enum: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Library', 'Food Court', 
           'Hostel', 'Parking', 'Sports Complex', 'Administrative Block']
  },
  block: { type: String, trim: true, default: '' },
  roomArea: { type: String, trim: true, default: '' },
  floor: { type: String, trim: true, default: '' },
  qrCode: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  beforeImage: { type: String, default: '' },
  afterImage: { type: String, default: '' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAnonymous: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  department: { type: String, trim: true, default: '' },
  aiAnalysis: { type: aiAnalysisSchema, default: null },
  comments: [commentSchema],
  statusHistory: [statusHistorySchema],
  resolutionNotes: { type: String, trim: true, default: '' },
  feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', default: null },
  resolvedAt: { type: Date },
  dueDate: { type: Date },
  sla: {
    targetHours: { type: Number, default: 24 },
    deadline: { type: Date },
    isBreached: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    escalationReason: { type: String, default: '' }
  },
  verification: {
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected', null], default: null },
    notes: { type: String, default: '' },
    verifiedAt: { type: Date }
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0 },
  contactInfo: { type: String, trim: true, default: '' },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
complaintSchema.index({ title: 'text', description: 'text' });
complaintSchema.index({ reporter: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ category: 1, priority: 1 });
complaintSchema.index({ location: 1, category: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);

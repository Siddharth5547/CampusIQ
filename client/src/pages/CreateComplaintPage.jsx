import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { complaintService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import { LoadingSpinner, DuplicateDetectionCard } from '../components/ui';
import {
  Upload, X, Zap, CheckCircle, AlertCircle, Image, MapPin,
  FileText, Tag, Star, Brain, Sparkles, ArrowRight, AlertTriangle,
  QrCode, EyeOff, ShieldCheck, CheckCheck
} from 'lucide-react';
import { CATEGORIES, PRIORITIES, LOCATIONS } from '../utils/helpers';
import toast from 'react-hot-toast';

const AI_STEPS = [
  'Reading complaint description...',
  'Understanding location & severity...',
  'Classifying category & priority...',
  'Generating root-cause recommendation...',
  'Triage analysis complete! ✨'
];

const LOCATION_PRESETS = [
  { label: 'Food Court Restroom', location: 'Food Court', block: 'Annex', floor: 'Ground Floor', roomArea: 'Restroom 102' },
  { label: 'Library Study Hall', location: 'Library', block: 'Main Wing', floor: 'Floor 2', roomArea: 'Quiet Study Hall' },
  { label: 'Block 3 Lab 301', location: 'Block 3', block: 'Block 3', floor: 'Floor 3', roomArea: 'Room 301' },
  { label: 'Hostel Block A', location: 'Hostel', block: 'Hostel A', floor: 'Floor 2', roomArea: 'Corridor Washrooms' }
];

const CreateComplaintPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    location: '',
    block: '',
    floor: '',
    roomArea: '',
    contactInfo: '',
    isAnonymous: false
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Duplicate detection state
  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [dismissedDuplicates, setDismissedDuplicates] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  // Real-time duplicate check when title, location, or category updates
  useEffect(() => {
    if (dismissedDuplicates) return;
    if (!form.title || form.title.length < 6) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const res = await complaintService.checkDuplicates({
          title: form.title,
          description: form.description,
          location: form.location,
          category: form.category
        });
        setDuplicates(res.data.data.duplicates || []);
      } catch (err) {
        console.error('Duplicate check error:', err);
      } finally {
        setCheckingDuplicates(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [form.title, form.location, form.category, dismissedDuplicates]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Only image files are allowed (JPEG, PNG, GIF, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleAIAnalyze = async () => {
    if (!form.title || !form.description) {
      toast.error('Please enter a title and description first.');
      return;
    }

    setAiLoading(true);
    setAiStep(0);
    setAiAnalysis(null);

    // Animate scanning progress steps
    for (let i = 0; i < AI_STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 450));
      setAiStep(i + 1);
    }

    try {
      const res = await complaintService.analyze({
        title: form.title,
        description: form.description
      });
      const analysis = res.data.data.analysis;
      setAiAnalysis(analysis);
      setAiStep(AI_STEPS.length - 1);
      toast.success('AI Triage completed!');
    } catch (err) {
      toast.error('AI analysis failed. Please select category manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiAnalysis) return;
    setForm(p => ({
      ...p,
      category: aiAnalysis.category || p.category,
      priority: aiAnalysis.priority || p.priority,
    }));
    toast.success('AI suggestions applied to form!');
  };

  const applyLocationPreset = (preset) => {
    setForm(p => ({
      ...p,
      location: preset.location,
      block: preset.block,
      floor: preset.floor,
      roomArea: preset.roomArea
    }));
    toast.success(`Preset loaded: ${preset.label}`);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';

    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';

    if (!form.category) errs.category = 'Please select a category';
    if (!form.location) errs.location = 'Please select a campus location';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix form validation errors.');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('title', form.title.trim());
    data.append('description', form.description.trim());
    data.append('category', form.category);
    data.append('priority', form.priority);
    data.append('location', form.location);
    if (form.block) data.append('block', form.block);
    if (form.floor) data.append('floor', form.floor);
    if (form.roomArea) data.append('roomArea', form.roomArea);
    if (form.contactInfo) data.append('contactInfo', form.contactInfo);
    data.append('isAnonymous', form.isAnonymous);

    if (image) {
      data.append('image', image);
    }

    try {
      const res = await complaintService.create(data);
      const newId = res.data.data.complaint._id;
      toast.success('Complaint submitted and queued for maintenance dispatch!');
      navigate(`/complaints/${newId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display text-[#292A26] tracking-tight">
            Report Infrastructure Problem
          </h1>
          <p className="text-[#68675F] text-sm mt-1">
            Submit a defect ticket. Our AI assistant will automatically estimate urgency, classify category, and route the appropriate maintenance technician.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Issue Details */}
          <div className="card space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9F8170]" />
              1. Defect Description
            </h2>

            <div>
              <label className="input-label">Complaint Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Water leakage from 2nd floor restroom ceiling"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                maxLength={200}
              />
              {errors.title && <p className="text-red-700 text-xs mt-1 font-medium">{errors.title}</p>}
            </div>

            <div>
              <label className="input-label">Detailed Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what is broken, what caused it (if known), and any safety hazard or service disruption..."
                className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
                maxLength={2000}
              />
              {errors.description && <p className="text-red-700 text-xs mt-1 font-medium">{errors.description}</p>}
            </div>

            {/* AI Smart Triage Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#68675F] font-mono">
                {form.title.length > 5 && form.description.length > 10 ? '✨ Ready for AI classification' : 'Enter title & description to activate AI'}
              </span>
              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={aiLoading || !form.title || !form.description}
                className="btn-palm text-xs py-2 px-3.5 flex items-center gap-2"
              >
                <Zap className={`w-3.5 h-3.5 text-white ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing...' : 'Analyze with AI'}</span>
              </button>
            </div>

            {/* AI Step Progression Indicator */}
            {aiLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 rounded-xl bg-[#EEF1E7] border border-[#8A9A5B]/40 text-xs font-mono text-[#2D5A27] flex items-center gap-3"
              >
                <LoadingSpinner size="sm" />
                <span>{AI_STEPS[aiStep]}</span>
              </motion.div>
            )}

            {/* Contextual AI Smart Triage Card */}
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl bg-[#EEF1E7] border border-[#8A9A5B]/40 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#8A9A5B]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8A9A5B]" />
                    <span className="text-xs font-bold text-[#292A26] uppercase tracking-wider font-mono">
                      AI Triage Recommendations
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-white text-[#2D5A27] font-mono text-xs font-bold border border-[#8A9A5B]/30">
                    Confidence: {aiAnalysis.confidence || 94}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-[#DEDAD3]">
                    <span className="text-[#77766F] block text-[10px] font-bold">CATEGORY</span>
                    <span className="text-[#292A26] font-bold">{aiAnalysis.category}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#DEDAD3]">
                    <span className="text-[#77766F] block text-[10px] font-bold">PRIORITY</span>
                    <span className="text-[#8A4B20] font-bold">{aiAnalysis.priority}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#DEDAD3] col-span-2 sm:col-span-1">
                    <span className="text-[#77766F] block text-[10px] font-bold">ROUTED TO</span>
                    <span className="text-[#2D5A27] font-bold">{aiAnalysis.department}</span>
                  </div>
                </div>

                {aiAnalysis.reason && (
                  <p className="text-xs text-[#4A4943] italic">
                    Reason: "{aiAnalysis.reason}"
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={applyAISuggestion}
                    className="btn-palm text-xs py-1.5 px-3"
                  >
                    Apply Suggestions to Form
                  </button>
                </div>
              </motion.div>
            )}

            {/* Real-Time Duplicate Detection Alert Card */}
            <AnimatePresence>
              {duplicates.length > 0 && !dismissedDuplicates && (
                <DuplicateDetectionCard
                  duplicates={duplicates}
                  onDismiss={() => setDismissedDuplicates(true)}
                  onUpvoteSuccess={() => {
                    toast.success('Signal counted! You can track this complaint under My Complaints.');
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Location & Presets */}
          <div className="card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DEDAD3] pb-2">
              <h2 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8A9A5B]" />
                2. Campus Location & Area
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#68675F] font-mono">
                <QrCode className="w-3.5 h-3.5 text-[#8A9A5B]" />
                <span>Simulated QR Presets</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {LOCATION_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyLocationPreset(p)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F0EBE6] hover:bg-[#EAE5DF] border border-[#DEDAD3] text-xs font-mono text-[#3B3C36] hover:text-[#292A26] transition-colors cursor-pointer font-medium"
                >
                  📍 {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Campus Zone / Building *</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={`input ${errors.location ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Campus Location</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.location && <p className="text-red-700 text-xs mt-1 font-medium">{errors.location}</p>}
              </div>

              <div>
                <label className="input-label">Block / Wing (Optional)</label>
                <input
                  type="text"
                  name="block"
                  value={form.block}
                  onChange={handleChange}
                  placeholder="e.g. Block B, West Wing"
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Floor (Optional)</label>
                <input
                  type="text"
                  name="floor"
                  value={form.floor}
                  onChange={handleChange}
                  placeholder="e.g. 2nd Floor, Ground Floor"
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Room / Specific Area (Optional)</label>
                <input
                  type="text"
                  name="roomArea"
                  value={form.roomArea}
                  onChange={handleChange}
                  placeholder="e.g. Restroom 204, Chemistry Lab"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Category & Urgency */}
          <div className="card space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#9F8170]" />
              3. Category & Priority
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`input ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-700 text-xs mt-1 font-medium">{errors.category}</p>}
              </div>

              <div>
                <label className="input-label">Requested Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="input"
                >
                  {PRIORITIES.map(pri => (
                    <option key={pri} value={pri}>{pri}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#77766F] font-mono mt-1 font-medium">
                  SLA Target: {form.priority === 'Critical' ? '2 hours' : form.priority === 'High' ? '8 hours' : form.priority === 'Medium' ? '24 hours' : '72 hours'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Photo Proof & Anonymous Options */}
          <div className="card space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2 flex items-center gap-2">
              <Image className="w-4 h-4 text-[#8A9A5B]" />
              4. Evidence Photo & Privacy
            </h2>

            {/* Photo Upload Area */}
            <div>
              <label className="input-label">Defect Image (Recommended)</label>
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#DEDAD3] bg-[#F0EBE6]">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#3B3C36]/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DEDAD3] hover:border-[#9F8170] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#F0EBE6]/40 hover:bg-[#F0EBE6]"
                >
                  <Upload className="w-6 h-6 text-[#77766F] mx-auto mb-2" />
                  <p className="text-xs text-[#3B3C36] font-semibold">Click to upload photo evidence</p>
                  <p className="text-[11px] text-[#77766F] mt-0.5 font-medium">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Anonymous Reporting Option */}
            <div className="p-3.5 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] flex items-start gap-3">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={form.isAnonymous}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded text-[#8A9A5B] focus:ring-[#8A9A5B] focus:ring-offset-0 bg-white border-[#DEDAD3] cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="text-xs cursor-pointer select-none">
                <span className="font-semibold text-[#292A26] block flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-[#8A9A5B]" />
                  Report anonymously
                </span>
                <span className="text-[#68675F] block mt-0.5">
                  Your name and student ID will not be displayed to maintenance staff technicians. Admin retains secure audit access.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm px-6 py-2.5"
            >
              {submitting ? 'Submitting...' : 'Submit Incident Ticket'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateComplaintPage;

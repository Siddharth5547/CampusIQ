import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  CheckCircle2, Shield, User, FileText, Zap, Sparkles,
  MapPin, Tag, Upload, ArrowRight, ArrowBigUp, Clock,
  Star, CheckCheck, MessageSquare, ExternalLink
} from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    stepNumber: 1,
    phase: '01 Report',
    phaseIdx: 0,
    title: '1. Student Authentication & Incident Portal',
    subtitle: 'Access via campus credentials into the Student Operations workspace.',
    screen: {
      type: 'auth',
      user: 'Arjun Mehta (STU2024001)',
      role: 'Student · Computer Science',
      action: 'Authenticated session established'
    }
  },
  {
    stepNumber: 2,
    phase: '01 Report',
    phaseIdx: 0,
    title: '2. Student Dashboard Overview',
    subtitle: 'Monitor active campus defects, view queue updates, and track open issues.',
    screen: {
      type: 'dashboard',
      stats: { open: 4, inProgress: 2, resolved: 7 },
      notice: 'Campus Operations: Normal dispatch velocity'
    }
  },
  {
    stepNumber: 3,
    phase: '01 Report',
    phaseIdx: 0,
    title: '3. Incident Reporting Interface',
    subtitle: 'Begin filing a new infrastructure problem.',
    screen: {
      type: 'form_start',
      title: 'Water leakage near Food Court restroom',
      description: 'Continuous water leakage from ceiling pipe flooding the floor, risk of slipping.'
    }
  },
  {
    stepNumber: 4,
    phase: '01 Report',
    phaseIdx: 0,
    title: '4. Selecting Category & Infrastructure Area',
    subtitle: 'Categorized under Plumbing & Civil infrastructure.',
    screen: {
      type: 'category',
      category: 'Plumbing 🔧',
      priority: 'High (8h SLA Target)'
    }
  },
  {
    stepNumber: 5,
    phase: '01 Report',
    phaseIdx: 0,
    title: '5. Precise Campus Location',
    subtitle: 'Selected via Simulated QR Code / Building Directory.',
    screen: {
      type: 'location',
      campus: 'Main Campus',
      location: 'Food Court',
      block: 'Annex Wing',
      roomArea: 'Restroom 102'
    }
  },
  {
    stepNumber: 6,
    phase: '01 Report',
    phaseIdx: 0,
    title: '6. Photographic Evidence Upload',
    subtitle: 'Before-repair photo attached for technician verification.',
    screen: {
      type: 'upload',
      imagePreview: '/uploads/washroom_tap_before.svg',
      fileSize: '1.4 MB · Verified'
    }
  },
  {
    stepNumber: 7,
    phase: '02 AI Analysis',
    phaseIdx: 1,
    title: '7. AI Smart Triage Scanning',
    subtitle: 'CampusCare AI evaluates severity, keywords, and safety risks.',
    screen: {
      type: 'ai_scan',
      scanningStep: 'Analyzing hydraulic safety risks and slip hazard...'
    }
  },
  {
    stepNumber: 8,
    phase: '02 AI Analysis',
    phaseIdx: 1,
    title: '8. AI Contextual Recommendations',
    subtitle: 'Automatic classification, SLA target, and department dispatching.',
    screen: {
      type: 'ai_result',
      category: 'Plumbing',
      confidence: 94,
      department: 'Plumbing & Civil Department',
      action: 'Shut off water supply immediately and dispatch emergency plumber.'
    }
  },
  {
    stepNumber: 9,
    phase: '02 AI Analysis',
    phaseIdx: 1,
    title: '9. Real-Time Duplicate Detection',
    subtitle: 'System detects matching issues to avoid queue redundancy.',
    screen: {
      type: 'duplicates',
      matchedTitle: 'Water leakage near Food Court restroom',
      affectedCount: 27,
      action: 'Converts duplicate into community upvote signal'
    }
  },
  {
    stepNumber: 10,
    phase: '03 Track',
    phaseIdx: 2,
    title: '10. Incident Queued & Ticket Generated',
    subtitle: 'Ticket CC-1049 registered with SLA deadline countdown.',
    screen: {
      type: 'ticket_created',
      ticketId: 'CC-1049',
      status: 'Submitted → AI Analyzed',
      slaRemaining: '7h 58m remaining'
    }
  },
  {
    stepNumber: 11,
    phase: '03 Track',
    phaseIdx: 2,
    title: '11. Status Progression Timeline',
    subtitle: 'Live visual audit trail for student & faculty tracking.',
    screen: {
      type: 'timeline',
      history: ['Submitted (10:14 AM)', 'AI Triage Verified (10:15 AM)', 'Assigned (10:22 AM)']
    }
  },
  {
    stepNumber: 12,
    phase: '03 Track',
    phaseIdx: 2,
    title: '12. Maintenance Specialist Dispatched',
    subtitle: 'Staff notifications triggered with diagnostic checklist.',
    screen: {
      type: 'staff_assigned',
      staff: 'Priya Sharma (Senior Plumber)',
      slaTarget: '8 Hours (High Priority)',
      notes: 'Dispatched with commercial brass isolation valve kit.'
    }
  },
  {
    stepNumber: 13,
    phase: '04 Resolve',
    phaseIdx: 3,
    title: '13. On-Site Physical Repair Work',
    subtitle: 'Technician isolates pipe valve and replaces worn brass gasket.',
    screen: {
      type: 'work_done',
      task: 'Replacement of brass gasket & pressure balancing',
      status: 'Completed'
    }
  },
  {
    stepNumber: 14,
    phase: '04 Resolve',
    phaseIdx: 3,
    title: '14. Before / After Photographic Verification',
    subtitle: 'High-resolution photographic proof mandatory before closing.',
    screen: {
      type: 'proof',
      before: '/uploads/washroom_tap_before.svg',
      after: '/uploads/washroom_tap_after.svg'
    }
  },
  {
    stepNumber: 15,
    phase: '05 Verify',
    phaseIdx: 4,
    title: '15. Student Resolution Verification',
    subtitle: 'Reporter prompt: "Is your problem truly resolved?"',
    screen: {
      type: 'verify',
      question: 'Is the leakage completely fixed?',
      response: 'Confirmed resolved by student reporter'
    }
  },
  {
    stepNumber: 16,
    phase: '05 Verify',
    phaseIdx: 4,
    title: '16. Five-Star Student Review & Ticket Closed',
    subtitle: 'Resolution feedback recorded into Campus Health Score.',
    screen: {
      type: 'closed',
      rating: 5,
      comment: 'Fixed within 2 hours. Very clean work!',
      healthScoreImpact: '+2.4% Campus Health Index Impact'
    }
  }
];

const ProductDemoModal = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const step = WORKFLOW_STEPS[currentStepIndex];

  // Auto progression timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 4200);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStepIndex]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setCurrentStepIndex((p) => Math.min(WORKFLOW_STEPS.length - 1, p + 1));
      }
      if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((p) => Math.max(0, p - 1));
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset to step 0 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B3C36]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#DEDAD3] shadow-2xl overflow-hidden flex flex-col text-[#3B3C36]"
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEDAD3] bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#9F8170] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <Play className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[#292A26]">
                  CampusCare Interactive Workflow Demonstration
                </h3>
                <p className="text-xs text-[#68675F] font-mono">
                  Live simulation of the actual 16-step student-to-resolution pipeline
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#68675F] hover:text-[#292A26] hover:bg-[#F0EBE6] transition-colors cursor-pointer"
              title="Close demo (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workflow Stage Progress Bar (Top) */}
          <div className="grid grid-cols-5 border-b border-[#DEDAD3] bg-[#F0EBE6] text-center text-xs font-mono">
            {['01 Report', '02 AI Analysis', '03 Track', '04 Resolve', '05 Verify'].map((p, idx) => {
              const isActive = step.phaseIdx === idx;
              return (
                <div
                  key={p}
                  className={`py-2 px-1 border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#9F8170] text-[#292A26] font-bold bg-[#FAF8F5]'
                      : 'border-transparent text-[#68675F]'
                  }`}
                >
                  {p}
                </div>
              );
            })}
          </div>

          {/* Main Visual Display (Simulated App Canvas) */}
          <div className="p-6 md:p-8 bg-[#F7F5F0] min-h-[360px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Step badge & Title */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F0EBE6] text-[#3B3C36] border border-[#DEDAD3]">
                    Step {step.stepNumber} of 16 · {step.phase}
                  </span>
                  <span className="text-xs text-[#68675F] font-mono">
                    {isPlaying ? '● Auto-playing workflow' : '❚❚ Paused'}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg md:text-xl font-bold font-display text-[#292A26]">
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#68675F] mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                {/* Simulated Screen Element */}
                <div className="p-5 rounded-xl bg-white border border-[#DEDAD3] shadow-sm">
                  {step.screen.type === 'auth' && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F0EBE6] text-[#3B3C36] flex items-center justify-center font-bold">
                        AM
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#292A26]">{step.screen.user}</div>
                        <div className="text-xs text-[#68675F]">{step.screen.role}</div>
                        <div className="text-xs text-[#8A9A5B] font-mono mt-1 font-semibold">✓ {step.screen.action}</div>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'dashboard' && (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#DEDAD3]">
                        <div className="text-xs text-[#68675F]">Open Complaints</div>
                        <div className="text-xl font-bold text-[#9F8170]">{step.screen.stats.open}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#DEDAD3]">
                        <div className="text-xs text-[#68675F]">In Progress</div>
                        <div className="text-xl font-bold text-[#8A6D5D]">{step.screen.stats.inProgress}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#DEDAD3]">
                        <div className="text-xs text-[#68675F]">Resolved</div>
                        <div className="text-xl font-bold text-[#8A9A5B]">{step.screen.stats.resolved}</div>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'form_start' && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#68675F] font-mono block text-[10px]">TITLE:</span>
                        <span className="font-bold text-[#292A26] text-sm">{step.screen.title}</span>
                      </div>
                      <div>
                        <span className="text-[#68675F] font-mono block text-[10px]">DESCRIPTION:</span>
                        <p className="text-[#4A4943]">{step.screen.description}</p>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'category' && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-[#F0EBE6] text-2xl">🔧</div>
                      <div>
                        <div className="text-xs text-[#68675F]">Assigned Category</div>
                        <div className="font-bold text-sm text-[#292A26]">{step.screen.category}</div>
                        <div className="text-xs text-[#8A4B20] font-mono mt-1 font-semibold">{step.screen.priority}</div>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'location' && (
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div><span className="text-[#68675F]">Building:</span> <span className="font-bold text-[#292A26]">{step.screen.location}</span></div>
                      <div><span className="text-[#68675F]">Wing:</span> <span className="font-bold text-[#292A26]">{step.screen.block}</span></div>
                      <div className="col-span-2"><span className="text-[#68675F]">Area:</span> <span className="font-bold text-[#9F8170]">{step.screen.roomArea}</span></div>
                    </div>
                  )}

                  {step.screen.type === 'upload' && (
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-16 rounded-lg overflow-hidden border border-[#DEDAD3] bg-[#F7F5F0]">
                        <img src={step.screen.imagePreview} alt="Defect" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#292A26]">washroom_pipe_leak.svg</div>
                        <div className="text-xs text-[#68675F]">{step.screen.fileSize}</div>
                        <div className="text-xs text-[#8A9A5B] font-semibold mt-1">✓ Ready for technician inspection</div>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'ai_scan' && (
                    <div className="p-4 rounded-lg bg-[#EEF1E7] text-center space-y-2 border border-[#DEDAD3]">
                      <Zap className="w-6 h-6 text-[#8A9A5B] mx-auto animate-pulse" />
                      <div className="text-xs font-mono font-bold text-[#292A26]">{step.screen.scanningStep}</div>
                    </div>
                  )}

                  {step.screen.type === 'ai_result' && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center pb-1 border-b border-[#DEDAD3]">
                        <span className="text-[#8A9A5B] font-bold">✨ AI Triage Match</span>
                        <span className="font-bold text-[#2D5A27]">{step.screen.confidence}% Confidence</span>
                      </div>
                      <div className="text-[#292A26]"><strong>Routing:</strong> {step.screen.department}</div>
                      <div className="text-[#68675F] text-[11px]"><strong>Action:</strong> {step.screen.action}</div>
                    </div>
                  )}

                  {step.screen.type === 'duplicates' && (
                    <div className="p-3 rounded-lg bg-[#F0EBE6] border border-[#DEDAD3] text-xs">
                      <div className="font-bold text-[#292A26] mb-1">Notice: Similar issue already in progress</div>
                      <div className="text-[#4A4943]">{step.screen.matchedTitle}</div>
                      <div className="text-[#9F8170] font-mono mt-1 font-semibold">
                        ↑ {step.screen.affectedCount} students already affected — Priority elevated!
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'ticket_created' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-[#9F8170]">TICKET {step.screen.ticketId}</div>
                        <div className="font-bold text-sm text-[#292A26] mt-0.5">{step.screen.status}</div>
                      </div>
                      <div className="px-3 py-1 rounded bg-[#F0EBE6] text-xs font-mono font-semibold text-[#3B3C36] border border-[#DEDAD3]">
                        ⏱ {step.screen.slaRemaining}
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'timeline' && (
                    <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono py-1">
                      {step.screen.history.map((h, i) => (
                        <div key={h} className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-1 rounded bg-[#F0EBE6] text-[#3B3C36] font-semibold border border-[#DEDAD3]">
                            {h}
                          </span>
                          {i < step.screen.history.length - 1 && <span className="text-[#9F8170]">→</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {step.screen.type === 'staff_assigned' && (
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-sm text-[#292A26]">Assigned: {step.screen.staff}</div>
                      <div className="text-[#68675F] font-mono">Work Notes: "{step.screen.notes}"</div>
                    </div>
                  )}

                  {step.screen.type === 'work_done' && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-[#8A9A5B]" />
                      <div>
                        <div className="font-bold text-sm text-[#292A26]">Physical Repair Verified by Staff</div>
                        <div className="text-xs text-[#68675F]">Status advanced to Resolved awaiting student confirmation.</div>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'proof' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#292A26]">
                        <span>Before vs After Resolution Proof</span>
                        <span className="text-[#8A9A5B]">✓ Uploaded</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 h-28">
                        <img src={step.screen.before} alt="Before" className="w-full h-full object-cover rounded-lg border border-[#DEDAD3]" />
                        <img src={step.screen.after} alt="After" className="w-full h-full object-cover rounded-lg border border-[#8A9A5B]/40" />
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'verify' && (
                    <div className="p-3 rounded-lg bg-[#F0EBE6] flex items-center justify-between border border-[#DEDAD3]">
                      <div className="text-xs font-bold text-[#292A26]">{step.screen.question}</div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded bg-[#8A9A5B] text-white font-bold text-xs shadow-sm">✓ Yes, Resolved</span>
                      </div>
                    </div>
                  )}

                  {step.screen.type === 'closed' && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-600 text-base">
                        {'★'.repeat(step.screen.rating)}
                      </div>
                      <p className="text-[#3B3C36] italic">"{step.screen.comment}"</p>
                      <div className="text-[#8A9A5B] font-mono font-bold">{step.screen.healthScoreImpact}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Video Player Navigation & Controls (Bottom) */}
            <div className="mt-6 pt-4 border-t border-[#DEDAD3] flex items-center justify-between flex-wrap gap-3">
              {/* Play / Pause & Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pause' : 'Play Walkthrough'}</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentStepIndex(0);
                    setIsPlaying(true);
                  }}
                  className="btn-secondary text-xs py-1.5 px-2.5"
                  title="Replay from beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#3B3C36]" />
                </button>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#68675F]">
                <button
                  onClick={() => setCurrentStepIndex(p => Math.max(0, p - 1))}
                  disabled={currentStepIndex === 0}
                  className="p-1 rounded hover:bg-[#F0EBE6] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  {currentStepIndex + 1} / {WORKFLOW_STEPS.length}
                </span>
                <button
                  onClick={() => setCurrentStepIndex(p => Math.min(WORKFLOW_STEPS.length - 1, p + 1))}
                  disabled={currentStepIndex === WORKFLOW_STEPS.length - 1}
                  className="p-1 rounded hover:bg-[#F0EBE6] disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDemoModal;

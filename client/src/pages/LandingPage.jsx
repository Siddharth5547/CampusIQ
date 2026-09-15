import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Zap, BarChart3, Clock, Users, Star, ArrowRight,
  CheckCircle2, AlertTriangle, Play, Sparkles, Layers,
  ArrowBigUp, CheckCheck, ChevronRight, ChevronLeft
} from 'lucide-react';
import CampusHeatmap from '../components/ui/CampusHeatmap';
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider';
import CampusHealthScoreCard from '../components/ui/CampusHealthScoreCard';
import CampusGridAnimation from '../components/CampusGridAnimation';
import ProductDemoModal from '../components/ProductDemoModal';

// Signature Complaint Transformation Steps
const LIFECYCLE_STAGES = [
  {
    stage: 'Submitted',
    label: '1. Incident Reported',
    title: 'Water leakage near Food Court washroom',
    badge: 'Submitted',
    badgeColor: '#68675F',
    detail: 'Reported by Arjun Mehta · Food Court Annex · Ground Floor',
    actionText: 'Ticket CC-1049 queued for processing'
  },
  {
    stage: 'AI Analyzed',
    label: '2. AI Smart Triage',
    title: 'Automated Classification & Severity Routing',
    badge: 'Confidence 94%',
    badgeColor: '#8A9A5B',
    detail: 'Plumbing · High Priority (8h SLA) · Plumbing & Civil Team',
    actionText: 'Routing: Inspect nearby water supply and drainage lines immediately.'
  },
  {
    stage: 'Assigned',
    label: '3. Specialist Assigned',
    title: 'Assigned to Senior Plumber Priya Sharma',
    badge: 'Assigned',
    badgeColor: '#3B3C36',
    detail: 'Response SLA: 8 hours · High-priority emergency dispatcher alerted',
    actionText: 'Staff dispatched with commercial brass-cartridge valve kit'
  },
  {
    stage: 'In Progress',
    label: '4. Physical Work Started',
    title: 'Replacement valve fitted & pressure balanced',
    badge: 'In Progress',
    badgeColor: '#8A6D5D',
    detail: 'Work in progress · Slip barrier established · Diagnostics logged',
    actionText: 'Staff logged progress notes & uploaded Before/After proof'
  },
  {
    stage: 'Resolved',
    label: '5. Verified & Closed',
    title: 'Resolution Verified with Proof of Repair',
    badge: 'Resolved ✓',
    badgeColor: '#8A9A5B',
    detail: 'Reporter confirmed: "Issue fully fixed, no leaks" · Satisfaction 5/5',
    actionText: 'Closed & logged into Campus Health Score index'
  }
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState(0);

  // Auto advance lifecycle demonstration
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStageIndex(prev => (prev + 1) % LIFECYCLE_STAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeStage = LIFECYCLE_STAGES[activeStageIndex];

  // Sample Heatmap data for landing page demonstration
  const demoHeatmap = [
    { location: 'Block 3', totalIssues: 14, openIssues: 4, risk: 'Critical', topCategory: 'Plumbing' },
    { location: 'Food Court', totalIssues: 9, openIssues: 2, risk: 'High', topCategory: 'Plumbing' },
    { location: 'Hostel', totalIssues: 12, openIssues: 3, risk: 'High', topCategory: 'Cleaning' },
    { location: 'Library', totalIssues: 6, openIssues: 1, risk: 'Moderate', topCategory: 'Wi-Fi / Internet' },
    { location: 'Block 1', totalIssues: 5, openIssues: 1, risk: 'Moderate', topCategory: 'Furniture' },
    { location: 'Block 2', totalIssues: 4, openIssues: 1, risk: 'Moderate', topCategory: 'Electrical' },
    { location: 'Parking', totalIssues: 3, openIssues: 1, risk: 'Moderate', topCategory: 'Electrical' },
    { location: 'Sports Complex', totalIssues: 2, openIssues: 1, risk: 'Low', topCategory: 'Garbage' },
    { location: 'Block 4', totalIssues: 3, openIssues: 0, risk: 'Low', topCategory: 'Water Supply' },
    { location: 'Administrative Block', totalIssues: 2, openIssues: 1, risk: 'Moderate', topCategory: 'AC / Fan' }
  ];

  const demoHealth = {
    overall: 87,
    electrical: 92,
    plumbing: 78,
    cleaning: 88,
    infrastructure: 84,
    wifi: 91
  };

  const workflowSteps = ['01 Report', '02 AI Analysis', '03 Track', '04 Resolve', '05 Verify'];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#3B3C36] selection:bg-[#9F8170] selection:text-white font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DEDAD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#3B3C36] rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-[#9F8170]" />
            </div>
            <span className="font-display font-bold text-[#292A26] text-lg tracking-tight">
              CampusCare
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-[#68675F] font-medium">
            <a href="#how-it-works" className="hover:text-[#292A26] transition-colors">How It Works</a>
            <a href="#video-demo" className="hover:text-[#292A26] transition-colors">See Demo</a>
            <a href="#ai-triage" className="hover:text-[#292A26] transition-colors">AI Triage</a>
            <a href="#duplicates" className="hover:text-[#292A26] transition-colors">Duplicate Detection</a>
            <a href="#heatmap" className="hover:text-[#292A26] transition-colors">Campus Heatmap</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-xs">
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with CAMPUS GRID & CAMPUS PULSE BACKGROUND ANIMATION */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#DEDAD3] bg-gradient-to-b from-[#F0EBE6] via-[#F7F5F0] to-[#F7F5F0]">
        {/* Subtle decorative glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#9F8170]/12 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Campus Grid & Pulse Animation */}
        <CampusGridAnimation className="z-0 opacity-75" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Eyebrow / Section Label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-label mb-6 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9F8170]" />
              CAMPUS OPERATIONS & MAINTENANCE PLATFORM
            </motion.div>

            {/* Main Hero Heading (Space Grotesk Display Typography) */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-[#292A26] leading-[1.08] mb-6"
            >
              Report. Track.{' '}
              <span className="text-[#9F8170]">Resolve.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-[#4A4943] leading-relaxed max-w-2xl mx-auto mb-8 font-normal"
            >
              A modern operating system for keeping campus facilities running smoothly.
              Instant AI triage, duplicate detection, interactive heatmaps, and verifiable proof of resolution.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/complaints/new" className="btn-primary px-7 py-3 text-sm font-semibold">
                Report an Issue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="btn-secondary px-7 py-3 text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-[#3B3C36] text-[#3B3C36]" />
                <span>Watch Demo</span>
              </button>
            </motion.div>
          </div>

          {/* SIGNATURE CAMPUSCARE ANIMATION: Interactive Transformation Lifecycle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card max-w-4xl mx-auto bg-white border-[#DEDAD3] shadow-sm relative overflow-hidden"
          >
            {/* Top Stage Progression Tabs */}
            <div className="grid grid-cols-5 border-b border-[#DEDAD3] bg-[#F7F5F0]">
              {LIFECYCLE_STAGES.map((s, idx) => {
                const isActive = activeStageIndex === idx;
                return (
                  <button
                    key={s.stage}
                    type="button"
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveStageIndex(idx);
                    }}
                    className={`py-3 px-2 text-center text-xs font-mono font-semibold transition-all border-b-2 cursor-pointer ${
                      isActive
                        ? 'border-[#9F8170] text-[#292A26] bg-white font-bold'
                        : 'border-transparent text-[#68675F] hover:text-[#292A26]'
                    }`}
                  >
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Stage Body */}
            <div className="p-6 md:p-8 min-h-[220px] flex flex-col justify-between bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.stage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#68675F] uppercase tracking-wider">
                        Current Lifecycle State:
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                        style={{
                          backgroundColor: '#F0EBE6',
                          color: '#292A26',
                          border: `1px solid #DEDAD3`
                        }}
                      >
                        {activeStage.badge}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#68675F]">
                      Auto-playing demonstration
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold font-display text-[#292A26] mb-2">
                    {activeStage.title}
                  </h3>

                  <p className="text-sm text-[#4A4943] mb-4 font-mono">
                    {activeStage.detail}
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] text-xs text-[#292A26] font-mono flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#9F8170] shrink-0" />
                    <span>{activeStage.actionText}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Lifecycle Progress footer */}
              <div className="mt-6 pt-4 border-t border-[#DEDAD3] flex items-center justify-between text-xs font-mono text-[#68675F]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9F8170] animate-ping" />
                  <span>Interactive Pipeline Simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStageIndex(prev => (prev - 1 + LIFECYCLE_STAGES.length) % LIFECYCLE_STAGES.length)}
                    className="p-1 rounded hover:bg-[#F0EBE6] text-[#68675F] hover:text-[#292A26] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>{activeStageIndex + 1} / 5</span>
                  <button
                    onClick={() => setActiveStageIndex(prev => (prev + 1) % LIFECYCLE_STAGES.length)}
                    className="p-1 rounded hover:bg-[#F0EBE6] text-[#68675F] hover:text-[#292A26] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. "HOW TO USE CAMPUSCARE" VIDEO SECTION */}
      <section id="video-demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label mb-3">
            VIDEO WALKTHROUGH
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-[#292A26] mb-3">
            See How CampusCare Works
          </h2>
          <p className="text-sm text-[#4A4943]">
            Watch how a campus issue goes from report to resolution.
          </p>
        </div>

        {/* Large Modern Video Preview Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card bg-white border-[#DEDAD3] shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden p-0">
            {/* Video Screen Preview */}
            <div className="relative aspect-[16/9] w-full bg-[#F0EBE6] overflow-hidden group flex items-center justify-center border-b border-[#DEDAD3]">
              {/* Background Mockup Screen Representation */}
              <div className="absolute inset-4 sm:inset-8 bg-white rounded-xl border border-[#DEDAD3] shadow-sm p-4 sm:p-6 flex flex-col justify-between opacity-95">
                <div className="flex items-center justify-between border-b border-[#DEDAD3] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-[#68675F] ml-2">campuscare.edu/complaints/new</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8A9A5B]">AI Triage: Active</span>
                </div>

                <div className="grid grid-cols-3 gap-3 my-2">
                  <div className="p-2.5 rounded bg-[#F7F5F0] border border-[#DEDAD3] text-xs">
                    <div className="text-[10px] text-[#68675F]">Category</div>
                    <div className="font-bold text-[#292A26]">Plumbing 🔧</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#F7F5F0] border border-[#DEDAD3] text-xs">
                    <div className="text-[10px] text-[#68675F]">Priority</div>
                    <div className="font-bold text-[#8A4B20]">High (8h SLA)</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#F7F5F0] border border-[#DEDAD3] text-xs">
                    <div className="text-[10px] text-[#68675F]">Location</div>
                    <div className="font-bold text-[#9F8170]">Food Court</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#EEF1E7] text-xs font-mono text-[#292A26] flex items-center justify-between border border-[#DEDAD3]">
                  <span>Inspection Task Dispatched to Senior Plumber</span>
                  <span className="text-[#2D5A27] font-bold">✓ Ready for Verification</span>
                </div>
              </div>

              {/* Play Button Overlay */}
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="relative z-10 flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-white text-[#9F8170] flex items-center justify-center shadow-md border-2 border-[#9F8170] group-hover:scale-105 group-hover:bg-[#9F8170] group-hover:text-white transition-all">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <span className="btn-primary text-xs font-semibold py-2 px-5 shadow-sm">
                  Watch Demo
                </span>
              </button>
            </div>

            {/* Below the video step indicators */}
            <div className="p-6 bg-white flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {workflowSteps.map((stepName, i) => {
                  const isActive = activeWorkflowTab === i;
                  return (
                    <button
                      key={stepName}
                      type="button"
                      onClick={() => {
                        setActiveWorkflowTab(i);
                        setDemoModalOpen(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#9F8170] text-white shadow-sm'
                          : 'bg-[#F0EBE6] text-[#3B3C36] hover:bg-[#EAE5DF]'
                      }`}
                    >
                      {stepName}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="text-xs font-bold text-[#9F8170] hover:text-[#292A26] flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <span>Full 16-Step Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Old Problems vs CampusCare */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#DEDAD3]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="section-label mb-3">OPERATIONAL EXCELLENCE</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#292A26] mb-3">
            Why Campus Maintenance Breaks Down
          </h2>
          <p className="text-sm text-[#4A4943]">
            Unstructured verbal complaints and chaotic chat channels create operational black holes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Method */}
          <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200">
            <div className="flex items-center gap-2.5 text-red-800 font-bold text-sm mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Old Methods (Paper Slips, WhatsApp Groups, Word of Mouth)
            </div>
            <ul className="space-y-3 text-xs text-[#4A4943]">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <span><strong>No Accountability:</strong> Complaints get buried in informal chats or paper registers with zero audit trail.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <span><strong>Duplicate Overload:</strong> 40 students report the exact same Wi-Fi router breakdown, drowning the dispatch team.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <span><strong>Zero SLA Tracking:</strong> Critical pipe bursts and electrical shorts sit unaddressed with no escalation deadlines.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <span><strong>No Proof:</strong> Staff claims an issue is fixed, but students find the exact same fixture still broken.</span>
              </li>
            </ul>
          </div>

          {/* CampusCare */}
          <div className="p-6 rounded-2xl bg-[#EEF1E7] border border-[#C8D6BC]">
            <div className="flex items-center gap-2.5 text-[#2D5A27] font-bold text-sm mb-4 font-display">
              <CheckCheck className="w-4 h-4 text-[#8A9A5B]" />
              The CampusCare Standard
            </div>
            <ul className="space-y-3 text-xs text-[#3B3C36]">
              <li className="flex items-start gap-2">
                <span className="text-[#8A9A5B] font-bold">✓</span>
                <span><strong>AI Smart Triage:</strong> Automatic categorization, priority assignment, and department routing in milliseconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8A9A5B] font-bold">✓</span>
                <span><strong>Duplicate Detection:</strong> Detects existing tickets in real-time and converts duplicates into high-priority upvotes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8A9A5B] font-bold">✓</span>
                <span><strong>Strict SLA Deadlines:</strong> 2h for Critical, 8h for High, with visual countdowns and automatic supervisor escalation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8A9A5B] font-bold">✓</span>
                <span><strong>Before/After Proof & Verification:</strong> Staff uploads photo proof, and students confirm if it's truly fixed.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section: AI Smart Triage Showcase */}
      <section id="ai-triage" className="py-20 bg-gradient-to-b from-[#EEF1E7]/60 to-[#F7F5F0] border-y border-[#DEDAD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-label mb-4">
                <Zap className="w-3.5 h-3.5 text-[#8A9A5B]" />
                FEATURE 1 · AI SMART TRIAGE
              </div>
              <h2 className="text-3xl font-bold font-display tracking-tight text-[#292A26] mb-4">
                Instant Contextual Triage, Not a Generic Chatbot
              </h2>
              <p className="text-sm text-[#4A4943] leading-relaxed mb-6">
                When students enter natural descriptions like <em>"Water is leaking near the food court washroom"</em>, CampusCare extracts category, priority, department routing, and actionable instructions in milliseconds.
              </p>
              <div className="space-y-3 text-xs font-mono text-[#68675F]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A9A5B]" />
                  <span>Rule-based fallback operates offline with zero external API dependencies.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A9A5B]" />
                  <span>Gemini AI mode available for deep multi-sentence context.</span>
                </div>
              </div>
            </div>

            {/* Contextual AI Card Demo */}
            <div className="p-6 rounded-2xl bg-white border border-[#DEDAD3] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DEDAD3]">
                <span className="text-xs font-mono font-bold text-[#292A26] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8A9A5B]" /> AI ANALYSIS RESULT
                </span>
                <span className="px-2 py-0.5 rounded bg-[#EEF1E7] text-[#2D5A27] font-mono text-[11px] font-bold border border-[#8A9A5B]/30">
                  Confidence: 94%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                <div className="p-2.5 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3]">
                  <span className="text-[#68675F] block text-[10px]">CATEGORY</span>
                  <span className="text-[#292A26] font-bold text-sm">Plumbing 🔧</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3]">
                  <span className="text-[#68675F] block text-[10px]">ESTIMATED PRIORITY</span>
                  <span className="text-[#8A4B20] font-bold text-sm">High (8h SLA)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3]">
                  <span className="text-[#68675F] block text-[10px]">DEPARTMENT</span>
                  <span className="text-[#292A26] font-bold">Plumbing & Civil</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3]">
                  <span className="text-[#68675F] block text-[10px]">EXTRACTED LOCATION</span>
                  <span className="text-[#9F8170] font-bold">Food Court Washroom</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] text-xs text-[#3B3C36] mb-3">
                <span className="text-[#68675F] block font-mono text-[10px] mb-1">RECOMMENDED ACTION</span>
                "Shut off nearby isolation valve and dispatch technician with replacement washer/cartridge."
              </div>
              <div className="text-[11px] text-[#68675F] italic">
                Reason for priority: "Continuous water leakage creates immediate slip hazard and sanitary risk."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Duplicate Detection */}
      <section id="duplicates" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="p-5 rounded-2xl bg-[#F0EBE6] border border-[#DEDAD3]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-[#292A26] uppercase tracking-wider font-mono">
                  Looks like this issue may already be reported
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#DEDAD3] shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="badge badge-in-progress">In Progress</span>
                  <span className="text-xs font-mono text-[#9F8170] font-bold">78% Match</span>
                </div>
                <h4 className="text-sm font-bold text-[#292A26] mb-1">
                  Water leakage near Food Court restroom
                </h4>
                <p className="text-xs text-[#68675F] font-mono mb-3">
                  Reported 2 hours ago · Food Court Annex
                </p>
                <div className="flex items-center gap-2">
                  <button className="btn-primary text-xs py-1.5">
                    <ArrowBigUp className="w-4 h-4" />
                    Upvote this issue (27 affected)
                  </button>
                  <button className="btn-secondary text-xs py-1.5">
                    Create anyway
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="section-label mb-4">
              <ArrowBigUp className="w-3.5 h-3.5 text-[#9F8170]" />
              FEATURE 2 · DUPLICATE DETECTION & UPVOTES
            </div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-[#292A26] mb-4">
              Turn Redundant Tickets into Real-Time Urgency Signals
            </h2>
            <p className="text-sm text-[#4A4943] leading-relaxed mb-6">
              Instead of cluttering the queue with 15 duplicate tickets, students are prompted to upvote the existing issue. 
              When a ticket reaches <strong>27 students affected</strong>, administrators know it's a high-impact incident and prioritize it automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Campus Heatmap */}
      <section id="heatmap" className="py-20 bg-white border-y border-[#DEDAD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="section-label mb-3">
              <Layers className="w-3.5 h-3.5 text-[#9F8170]" />
              FEATURE 3 · CAMPUS ISSUE HEATMAP
            </div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-[#292A26] mb-2">
              Interactive 10-Zone Campus Density Mapping
            </h2>
            <p className="text-sm text-[#4A4943]">
              Operations leaders can immediately see defect density across Blocks 1–4, Hostels, Libraries, and Dining halls.
            </p>
          </div>

          {/* Interactive Heatmap */}
          <CampusHeatmap heatmapData={demoHeatmap} />
        </div>
      </section>

      {/* Section: Before/After Proof */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label mb-3">VERIFICATION SYSTEM</span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-[#292A26] mb-3">
            Verifiable Fixes with Before / After Proof
          </h2>
          <p className="text-sm text-[#4A4943]">
            Maintenance staff uploads photographic proof upon job completion. Drag the slider to verify repairs.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <BeforeAfterSlider
            beforeImage="/uploads/washroom_tap_before.svg"
            afterImage="/uploads/washroom_tap_after.svg"
          />
        </div>
      </section>

      {/* Section: Health Score */}
      <section id="health-score" className="py-20 bg-white border-t border-[#DEDAD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <CampusHealthScoreCard healthScore={demoHealth} />

            <div className="card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DEDAD3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F0EBE6] text-[#3B3C36] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#292A26]">Recurring Infrastructure Clusters</h3>
                    <p className="text-xs text-[#68675F]">Root-cause detection across historical tickets</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-800 font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                  DETECTED
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#DEDAD3] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#292A26]">Block 3 Plumbing Cluster</span>
                  <span className="font-mono text-[#8A4B20] font-bold">14 occurrences (9 in 30d)</span>
                </div>
                <p className="text-xs text-[#4A4943]">
                  Repeated water pipe leaks and low washroom pressure detected in Block 3.
                </p>
                <div className="p-3 rounded-lg bg-white border border-[#DEDAD3] text-xs text-[#3B3C36] font-mono">
                  <strong className="text-[#9F8170]">Preventive Recommendation:</strong> Schedule main supply line pressure audit for Block 3 instead of repeatedly fixing individual taps.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-[#DEDAD3] text-center bg-[#F0EBE6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-[#292A26] mb-6">
            Ready to modernize your campus operations?
          </h2>
          <p className="text-[#4A4943] text-sm sm:text-base max-w-xl mx-auto mb-8 font-normal">
            Experience the complete student, maintenance technician, and admin workflow now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link to="/login" className="btn-primary px-8 py-3 text-sm font-semibold">
              Sign In to Demo
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="btn-secondary px-8 py-3 text-sm"
            >
              Watch Video Walkthrough
            </button>
          </div>

          <div className="p-4 rounded-xl max-w-md mx-auto bg-white border border-[#DEDAD3] text-xs text-[#68675F] font-mono space-y-1 shadow-sm">
            <div className="font-bold text-[#292A26] mb-1 font-display">Pre-Seeded Demo Accounts:</div>
            <div>Admin: <span className="text-[#9F8170] font-semibold">admin@campuscare.edu</span> / <span>Admin@123</span></div>
            <div>Student: <span className="text-[#9F8170] font-semibold">student1@campuscare.edu</span> / <span>Student@123</span></div>
            <div>Staff: <span className="text-[#9F8170] font-semibold">staff1@campuscare.edu</span> / <span>Staff@123</span></div>
          </div>
        </div>
      </section>

      {/* Charcoal Brown Footer */}
      <footer className="py-12 bg-[#3B3C36] text-white border-t border-[#4A4B43]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#9F8170] text-white flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">CampusCare</span>
            <span className="text-xs text-[#DEDAD3] font-mono">Operations OS</span>
          </div>
          <p className="text-xs text-[#DEDAD3] font-mono text-center sm:text-left">
            Report. Track. <span className="text-white font-semibold">Resolve.</span> — Intelligent Campus Infrastructure
          </p>
          <div className="text-xs text-[#DEDAD3]/80 font-mono">
            © 2026 CampusCare. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Interactive Video Walkthrough Modal */}
      <ProductDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;

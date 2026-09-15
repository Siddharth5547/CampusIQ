import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Info, Zap, Droplets, Sparkles, Building2, Wifi } from 'lucide-react';

const CampusHealthScoreCard = ({
  healthScore,
  className = ''
}) => {
  const [showFormula, setShowFormula] = useState(false);

  const score = healthScore?.overall || 85;
  const electrical = healthScore?.electrical || 92;
  const plumbing = healthScore?.plumbing || 78;
  const cleaning = healthScore?.cleaning || 88;
  const infrastructure = healthScore?.infrastructure || 84;
  const wifi = healthScore?.wifi || 91;

  // Color calculation based on score
  const getScoreColor = (val) => {
    if (val >= 85) return '#8A9A5B';
    if (val >= 70) return '#9F8170';
    return '#8A4B20';
  };

  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`card bg-white ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-[#DEDAD3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EEF1E7] text-[#8A9A5B] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#292A26] flex items-center gap-1.5 font-display">
              Campus Health Score
              <span className="text-[10px] font-mono text-[#2D5A27] font-semibold px-2 py-0.5 rounded-full bg-[#EEF1E7] border border-[#8A9A5B]/40">
                PROD-METRIC
              </span>
            </h3>
            <p className="text-xs text-[#68675F]">Composite operational index across facilities</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="text-[#68675F] hover:text-[#292A26] p-1.5 rounded-lg hover:bg-[#F0EBE6] transition-colors cursor-pointer"
          title="Methodology breakdown"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Main Score & Sub-scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-5">
        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r="46"
                stroke="#DEDAD3"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="55"
                cy="55"
                r="46"
                stroke={getScoreColor(score)}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold font-display text-[#292A26] tracking-tight">
                {score}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#77766F]">
                out of 100
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#8A9A5B] mt-2 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            {score >= 85 ? 'Optimal Operations' : (score >= 70 ? 'Satisfactory' : 'Action Required')}
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-[#3B3C36] font-medium">
                <Zap className="w-3 h-3 text-[#9F8170]" /> Electrical Grid & Power
              </span>
              <span className="font-mono font-bold text-[#292A26]">{electrical}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0EBE6] rounded-full overflow-hidden">
              <div className="h-full bg-[#9F8170] rounded-full" style={{ width: `${electrical}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-[#3B3C36] font-medium">
                <Droplets className="w-3 h-3 text-[#8A6D5D]" /> Plumbing & Water Network
              </span>
              <span className="font-mono font-bold text-[#292A26]">{plumbing}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0EBE6] rounded-full overflow-hidden">
              <div className="h-full bg-[#8A6D5D] rounded-full" style={{ width: `${plumbing}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-[#3B3C36] font-medium">
                <Sparkles className="w-3 h-3 text-[#8A9A5B]" /> Campus Cleanliness & Sanitation
              </span>
              <span className="font-mono font-bold text-[#292A26]">{cleaning}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0EBE6] rounded-full overflow-hidden">
              <div className="h-full bg-[#8A9A5B] rounded-full" style={{ width: `${cleaning}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-[#3B3C36] font-medium">
                <Building2 className="w-3 h-3 text-[#3B3C36]" /> Civil & Furniture Infrastructure
              </span>
              <span className="font-mono font-bold text-[#292A26]">{infrastructure}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0EBE6] rounded-full overflow-hidden">
              <div className="h-full bg-[#3B3C36] rounded-full" style={{ width: `${infrastructure}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-[#3B3C36] font-medium">
                <Wifi className="w-3 h-3 text-[#8A9A5B]" /> Network & Connectivity
              </span>
              <span className="font-mono font-bold text-[#292A26]">{wifi}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0EBE6] rounded-full overflow-hidden">
              <div className="h-full bg-[#8A9A5B] rounded-full" style={{ width: `${wifi}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Popover / Dropdown */}
      <AnimatePresence>
        {showFormula && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] text-xs text-[#4A4943] space-y-2 mt-2"
          >
            <div className="font-bold text-[#292A26]">Algorithm Calculation Formula:</div>
            <p className="text-[#68675F]">
              Campus Health Score is an objective operations KPI evaluated from live queue signals:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-[#DEDAD3]">
                <div className="text-[#9F8170] font-bold">35% Weight</div>
                <div className="text-[#68675F]">Resolution Velocity & Completion Rate</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#DEDAD3]">
                <div className="text-[#8A9A5B] font-bold">40% Weight</div>
                <div className="text-[#68675F]">Critical Defect Control & SLA Adherence</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#DEDAD3]">
                <div className="text-[#8A6D5D] font-bold">25% Weight</div>
                <div className="text-[#68675F]">Student Resolution Satisfaction Feedback</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampusHealthScoreCard;

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, Layers, Filter, CheckCircle2, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../../utils/helpers';

// Coordinates on a 1000x600 canvas
const LOCATION_COORDINATES = {
  'Administrative Block': { x: 180, y: 150, type: 'academic', label: 'Admin Block' },
  'Library': { x: 480, y: 130, type: 'academic', label: 'Central Library' },
  'Block 1': { x: 220, y: 300, type: 'academic', label: 'Block 1 (CSE/IT)' },
  'Block 2': { x: 440, y: 280, type: 'academic', label: 'Block 2 (ECE/Mech)' },
  'Block 3': { x: 250, y: 460, type: 'academic', label: 'Block 3 (Labs/Civ)' },
  'Block 4': { x: 470, y: 450, type: 'academic', label: 'Block 4 (Sciences)' },
  'Food Court': { x: 740, y: 200, type: 'facility', label: 'Food Court & Cafes' },
  'Hostel': { x: 800, y: 390, type: 'residence', label: 'Student Hostels' },
  'Sports Complex': { x: 680, y: 510, type: 'facility', label: 'Sports Arena' },
  'Parking': { x: 120, y: 500, type: 'utility', label: 'South Parking Lot' },
};

const CampusHeatmap = ({
  heatmapData = [],
  onSelectLocation,
  selectedLocation = null,
  className = ''
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredLoc, setHoveredLoc] = useState(null);

  // Index heatmap data by location
  const locMap = useMemo(() => {
    const map = {};
    (heatmapData || []).forEach(item => {
      map[item.location] = item;
    });
    return map;
  }, [heatmapData]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return '#991B1B';
      case 'High': return '#C05621';
      case 'Moderate': return '#9F8170';
      default: return '#8A9A5B';
    }
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'Critical': return 'bg-red-50 text-red-800 border-red-200 font-bold';
      case 'High': return 'bg-[#F9EFE6] text-[#8A4B20] border-[#9F8170] font-bold';
      case 'Moderate': return 'bg-[#F0EBE6] text-[#3B3C36] border-[#DEDAD3] font-medium';
      default: return 'bg-[#EEF1E7] text-[#2D5A27] border-[#8A9A5B]/40 font-medium';
    }
  };

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDAD3]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A9A5B] animate-ping" />
            <h3 className="text-base font-bold text-[#292A26] flex items-center gap-2 font-display">
              <Layers className="w-4 h-4 text-[#8A9A5B]" />
              Live Campus Infrastructure Heatmap
            </h3>
          </div>
          <p className="text-xs text-[#68675F] mt-0.5">
            Real-time visual issue density across 10 campus zones and residential facilities.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A9A5B]" />
            <span className="text-[#68675F]">Low Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[#68675F]">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span className="text-[#68675F]">Elevated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-[#68675F]">Critical Cluster</span>
          </div>
        </div>
      </div>

      {/* Map Canvas SVG */}
      <div className="relative w-full aspect-[16/9] max-h-[500px] bg-[#292A26] rounded-xl my-4 overflow-hidden border border-[#DEDAD3]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-tech-grid bg-[size:28px_28px] opacity-40 pointer-events-none" />

        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full select-none"
        >
          {/* Campus connecting walkways */}
          <path
            d="M 180,150 L 480,130 L 740,200 L 800,390 L 680,510 L 470,450 L 250,460 L 120,500 L 220,300 L 180,150"
            fill="none"
            stroke="#1c2536"
            strokeWidth="3"
            strokeDasharray="8,6"
          />
          <path
            d="M 220,300 L 440,280 L 480,130 M 440,280 L 470,450 M 440,280 L 740,200"
            fill="none"
            stroke="#1c2536"
            strokeWidth="2.5"
            strokeDasharray="6,6"
          />

          {/* Central Green Courtyard */}
          <ellipse
            cx="350"
            cy="270"
            rx="70"
            ry="45"
            fill="#064e3b"
            fillOpacity="0.25"
            stroke="#047857"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text
            x="350"
            y="273"
            fill="#34d399"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.7"
          >
            CENTRAL QUAD
          </text>

          {/* Render building nodes */}
          {Object.entries(LOCATION_COORDINATES).map(([locName, coord]) => {
            const data = locMap[locName] || { totalIssues: 0, openIssues: 0, risk: 'Low', topCategory: 'None' };
            const riskColor = getRiskColor(data.risk);
            const isHovered = hoveredLoc === locName;
            const isSelected = selectedLocation === locName;
            const pulseRadius = Math.min(38, 20 + (data.openIssues || 0) * 4);

            return (
              <g
                key={locName}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectLocation && onSelectLocation(locName)}
                onMouseEnter={() => setHoveredLoc(locName)}
                onMouseLeave={() => setHoveredLoc(null)}
              >
                {/* Heat density aura */}
                {data.openIssues > 0 && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={pulseRadius}
                    fill={riskColor}
                    fillOpacity={isHovered ? '0.35' : '0.18'}
                    className="animate-pulse"
                  />
                )}

                {/* Building Marker Box */}
                <rect
                  x={coord.x - 45}
                  y={coord.y - 24}
                  width="90"
                  height="48"
                  rx="10"
                  fill={isSelected ? '#1f293d' : (isHovered ? '#1a2233' : '#121722')}
                  stroke={isSelected ? '#10b981' : (isHovered ? riskColor : '#253044')}
                  strokeWidth={isSelected ? '2.5' : (isHovered ? '2' : '1.5')}
                  filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                />

                {/* Building Icon / Accent Bar */}
                <circle
                  cx={coord.x - 30}
                  cy={coord.y}
                  r="6"
                  fill={riskColor}
                />

                {/* Issue Count Pill */}
                <text
                  x={coord.x - 30}
                  y={coord.y + 3}
                  fill="#000"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {data.openIssues}
                </text>

                {/* Building Label */}
                <text
                  x={coord.x - 18}
                  y={coord.y - 4}
                  fill="#f1f5f9"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {locName.length > 10 ? locName.substring(0, 9) + '…' : locName}
                </text>

                <text
                  x={coord.x - 18}
                  y={coord.y + 9}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {data.openIssues} open / {data.totalIssues} tot
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover card overlay */}
        <AnimatePresence>
          {hoveredLoc && locMap[hoveredLoc] && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 z-20 p-4 rounded-xl bg-white border border-[#DEDAD3] text-xs min-w-[220px] shadow-xl text-[#3B3C36]"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-[#292A26] text-sm">
                  {hoveredLoc}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeClass(locMap[hoveredLoc].risk)}`}>
                  {locMap[hoveredLoc].risk} Risk
                </span>
              </div>
              <div className="space-y-1.5 text-[#4A4943]">
                <div className="flex justify-between">
                  <span className="text-[#68675F]">Active Issues:</span>
                  <span className="font-bold text-[#8A4B20] font-mono">
                    {locMap[hoveredLoc].openIssues}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68675F]">Total Recorded:</span>
                  <span className="font-mono text-[#292A26] font-semibold">
                    {locMap[hoveredLoc].totalIssues}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68675F]">Predominant Defect:</span>
                  <span className="font-semibold text-[#8A9A5B]">
                    {locMap[hoveredLoc].topCategory}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Location grid quick-select pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
        {Object.keys(LOCATION_COORDINATES).map(loc => {
          const info = locMap[loc] || { openIssues: 0, risk: 'Low' };
          const isSelected = selectedLocation === loc;

          return (
            <button
              key={loc}
              type="button"
              onClick={() => onSelectLocation && onSelectLocation(isSelected ? null : loc)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#9F8170] bg-[#F0EBE6] text-[#292A26] shadow-sm font-semibold'
                  : 'border-[#DEDAD3] bg-[#F7F5F0] hover:bg-[#F0EBE6] text-[#3B3C36]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold truncate">{loc}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getRiskColor(info.risk) }}
                />
              </div>
              <div className="text-[11px] text-[#68675F] font-mono">
                {info.openIssues} active defect{info.openIssues === 1 ? '' : 's'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CampusHeatmap;

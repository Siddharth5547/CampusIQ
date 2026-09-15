import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../services';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  StatCard, LoadingSpinner, CampusHeatmap, CampusHealthScoreCard
} from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FileText, Clock, CheckCircle, AlertTriangle, Users, TrendingUp,
  Star, Activity, BarChart3, RefreshCw, Layers, ShieldCheck, Sparkles
} from 'lucide-react';
import { getStatusColor, getPriorityColor, formatDate, timeAgo } from '../utils/helpers';

const CHART_COLORS = ['#9F8170', '#8A9A5B', '#3B3C36', '#68675F', '#B39280', '#A3B175', '#55564E', '#8A6D5D'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl bg-white border border-[#DEDAD3] text-xs shadow-lg font-mono">
      <p className="text-[#68675F] mb-1 font-bold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [selectedHeatmapLoc, setSelectedHeatmapLoc] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnalytics({ period });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const overview = data?.overview || {};
  const priorityData = data?.priorityBreakdown?.map(p => ({
    name: p._id,
    value: p.count,
    color: getPriorityColor(p._id)
  })) || [];

  const statusData = data?.statusBreakdown?.map(s => ({
    name: s._id,
    value: s.count,
    color: getStatusColor(s._id)
  })) || [];

  const categoryChartData = (data?.categoryBreakdown || []).slice(0, 8).map((c, i) => ({
    name: c._id.length > 12 ? c._id.substring(0, 12) + '...' : c._id,
    fullName: c._id,
    count: c.count,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const stats = [
    { title: 'Total Reported', value: overview.totalComplaints || 0, icon: FileText, color: '#9F8170' },
    { title: 'Active in Queue', value: overview.pending || 0, icon: Clock, color: '#8A4B20' },
    { title: 'Verified Resolved', value: overview.resolved || 0, icon: CheckCircle, color: '#8A9A5B' },
    { title: 'Avg SLA Resolution', value: `${overview.avgResolutionDays || 0}d`, icon: TrendingUp, color: '#3B3C36' },
    { title: 'Active Personnel', value: overview.totalUsers || 0, icon: Users, color: '#9F8170' },
    { title: 'Student Rating', value: `${overview.avgRating || 0}/5`, icon: Star, color: '#8A9A5B' },
  ];

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-[#292A26] tracking-tight">
              Operations Intelligence & Analytics
            </h1>
            <p className="text-xs text-[#68675F] mt-1 font-mono">
              Live campus health metrics, SLA velocity, and automated defect cluster detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="input text-xs py-2 pr-8 w-auto cursor-pointer font-mono"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>

            <button
              onClick={fetchAnalytics}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#9F8170]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {stats.map((s, idx) => (
            <StatCard key={idx} {...s} />
          ))}
        </div>

        {/* FEATURE 11: Campus Health Score & FEATURE 5: Recurring Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <CampusHealthScoreCard healthScore={data?.campusHealthScore} />
          </div>

          {/* Recurring Infrastructure Clusters */}
          <div className="lg:col-span-5 card space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#DEDAD3]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#8A4B20]" />
                <h3 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono">
                  Recurring Defect Clusters
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8A4B20] px-2 py-0.5 rounded bg-[#F9EFE6] border border-[#9F8170]/40">
                {data?.recurringIssues?.length || 0} CLUSTERS
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {!data?.recurringIssues || data.recurringIssues.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#77766F] font-medium">
                  No recurring defect clusters detected in the selected period.
                </div>
              ) : (
                data.recurringIssues.map((cluster, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#292A26]">
                        {cluster.location} · {cluster.category}
                      </span>
                      <span className="text-[11px] font-mono text-[#8A4B20] font-bold">
                        {cluster.occurrences} tickets ({cluster.last30Days} in 30d)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#8A9A5B]/30 text-[11px] text-[#2D5A27] font-mono">
                      <strong className="text-[#292A26]">Recommendation:</strong> {cluster.recommendation}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FEATURE 4: Interactive Campus Issue Heatmap */}
        <div>
          <CampusHeatmap
            heatmapData={data?.heatmapData || []}
            selectedLocation={selectedHeatmapLoc}
            onSelectLocation={setSelectedHeatmapLoc}
          />
        </div>

        {/* FEATURE 12: Preventive Maintenance Recommendations */}
        <div className="card space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#DEDAD3]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8A9A5B]" />
              <h3 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono">
                Preventive Maintenance Recommendations
              </h3>
            </div>
            <span className="text-xs font-mono text-[#2D5A27] font-bold">
              Proactive Defect Mitigation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.preventiveInsights || []).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#F0EBE6] border border-[#DEDAD3] flex flex-col justify-between text-xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F9EFE6] text-[#8A4B20] border border-[#9F8170]/40">
                      {item.urgency} Urgency
                    </span>
                    <span className="text-[#68675F] font-mono text-[11px]">{item.location}</span>
                  </div>
                  <h4 className="font-bold text-[#292A26] text-sm mb-1">{item.title}</h4>
                  <p className="text-[#4A4943] text-[11px] leading-relaxed">{item.insight}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-[#8A9A5B]/30 text-[#2D5A27] font-mono text-[11px]">
                  <strong className="text-[#292A26]">Action:</strong> {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2">
              Complaints by Infrastructure Category
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD3" />
                  <XAxis dataKey="name" stroke="#77766F" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#77766F" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Breakdown Pie */}
          <div className="card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#292A26] uppercase tracking-wider font-mono border-b border-[#DEDAD3] pb-2">
              SLA Priority Level Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(val) => <span className="text-xs text-[#3B3C36] font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

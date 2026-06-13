import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  Legend
} from "recharts";
import {
  FiAlertCircle,
  FiActivity,
  FiServer,
  FiClock,
  FiTrendingUp,
  FiCalendar,
  FiLayers,
  FiMap,
  FiCompass,
  FiCpu
} from "react-icons/fi";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/analytics")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching analytics data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
        {/* Claymorphic Loader */}
        <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.2),0_8px_16px_rgba(0,0,0,0.3)] animate-bounce">
          <FiCpu className="text-4xl text-cyan-400 animate-spin" />
        </div>
        <p className="text-cyan-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Synthesizing multi-file dataset intelligence...
        </p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-red-500/30 bg-red-950/20 text-center max-w-lg mx-auto my-12 shadow-2xl">
        <FiAlertCircle className="text-5xl text-red-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-white mb-2">Telemetry Pipeline Error</h3>
        <p className="text-red-400/80 text-sm font-semibold mb-4">
          {data?.error || "Failed to compile analytics telemetry. Check backend API service."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-semibold hover:bg-red-500/30 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, train_types, class_availability, delay_by_season, delay_by_frequency, delay_vs_distance, top_trains, reliable_trains, stations, busy_stations, distances, stations_distribution } = data;

  // Helper to format minutes into hours + minutes string (e.g. "2 hr 3 min late")
  const formatDelay = (minutes) => {
    if (minutes == null || isNaN(minutes)) return "-";
    const total = Math.round(Number(minutes));
    const hrs = Math.floor(total / 60);
    const mins = Math.abs(total % 60);
    let parts = [];
    if (hrs > 0) parts.push(`${hrs} hr${hrs > 1 ? "s" : ""}`);
    if (mins > 0) parts.push(`${mins} min`);
    if (parts.length === 0) parts.push("0 min");
    return parts.join(" ") + " late";
  };

  // Compact formatter to display minutes as "2 hrs 35 min" (keeps spaces)
  const formatMinutesCompact = (minutes) => {
    if (minutes == null || isNaN(minutes)) return "-";
    const total = Math.round(Number(minutes));
    const hrs = Math.floor(total / 60);
    const mins = Math.abs(total % 60);
    if (hrs > 0 && mins > 0) return `${hrs} hrs ${mins} min`;
    if (hrs > 0) return `${hrs} hrs`;
    return `${mins} min`;
  };

  // Prepare train types data
  const trainTypesData = Object.entries(train_types || {}).map(([key, val]) => ({
    name: key,
    value: val
  }));
  const TRAIN_COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  // Prepare classes radar data
  const classRadarData = Object.entries(class_availability || {}).map(([key, val]) => ({
    subject: key.replace("_", " "),
    count: val,
    fullMark: Math.max(...Object.values(class_availability || {}))
  }));

  // Prepare seasons delay data
  const seasonsData = Object.entries(delay_by_season || {}).map(([key, val]) => ({
    name: key,
    avgDelay: val.avg_delay,
    count: val.count
  }));

  // Prepare frequencies delay data
  const freqData = Object.entries(delay_by_frequency || {}).map(([key, val]) => ({
    name: key.trim(),
    avgDelay: val.avg_delay
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-16 relative">
      
      {/* Glowmorphic Ambient Background Lights (Aurora Effect) */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-10 left-[30%] w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Floating Glassmorphic Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-cyan-400 animate-pulse">🌐</span>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              <strong>Railway Network Analytics</strong>
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">
            Deep Overview Across 10 Railway Datasets
          </p>
        </div>
        
        {/* Neumorphic Tab Controller */}
        <div className="flex bg-[#0a1220]/80 p-1.5 rounded-2xl border border-white/5 shadow-[inset_2px_2px_5px_#04070d,inset_-2px_-2px_5px_#101d33] gap-1 self-start md:self-auto">
          {[
            { id: "overview", label: "Overview", icon: FiActivity },
            { id: "delays", label: "Delays & Seasons", icon: FiClock },
            { id: "logistics", label: "Logistics & Classes", icon: FiLayers },
            { id: "geographics", label: "Geographics", icon: FiMap }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={active ? "text-cyan-400" : "text-slate-500"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CLAYMORPHIC KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
          { label: "Stations Mapped", val: summary.total_stations, color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-400/30", text: "text-blue-400", desc: "Stations in stations.json" },
          { label: "Total Schedules", val: summary.total_schedules.toLocaleString(), color: "from-purple-500/20 to-pink-500/20", border: "border-purple-400/30", text: "text-purple-400", desc: "Runs in schedules.json" },
          { label: "Active Train Routes", val: summary.total_train_paths, color: "from-cyan-500/20 to-teal-500/20", border: "border-cyan-400/30", text: "text-cyan-400", desc: "Paths in trains.json" },
          { label: "Network Avg Delay", val: formatMinutesCompact(summary.avg_delay), color: "from-amber-500/20 to-orange-500/20", border: "border-amber-400/30", text: "text-amber-400", desc: "Combined delay sources" },
          { label: "Max Peak Delay", val: formatMinutesCompact(summary.max_delay), color: "from-rose-500/20 to-red-500/20", border: "border-rose-400/30", text: "text-rose-400", desc: "Max recorded trip delay" },
          { label: "Network Health Index", val: `${summary.health_index}%`, color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-400/30", text: "text-emerald-400", desc: "Calculated reliability score" }
        ].map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} backdrop-blur-md border ${card.border} rounded-3xl p-5 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.3),inset_0_8px_16px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform duration-300`}
          >
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest mb-2">
              {card.label}
            </span>
            <span className={`text-2xl font-black ${card.text} tracking-tight block mb-2`}>
              {card.val}
            </span>
            <span className="text-[9px] text-slate-500 font-medium block leading-snug">
              {card.desc}
            </span>
          </div>
        ))}
      </div>

      {/* ACTIVE TAB CONTENT */}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Neumorphic Delay Risk Card */}
          <div className="lg:col-span-1 bg-[#0a1220] p-6 rounded-3xl border border-white/5 shadow-[5px_5px_15px_#04070d,-5px_-5px_15px_#101d33] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <FiAlertCircle className="text-red-400" /> Active Incident Risk Profile
              </h4>
              <div className="space-y-4">
                {[
                  { label: "Low Risk (< 15 mins)", count: summary.risk_summary.low, color: "bg-emerald-500", pct: "75%" },
                  { label: "Medium Risk (15-30 mins)", count: summary.risk_summary.medium, color: "bg-yellow-500", pct: "50%" },
                  { label: "High Risk (30-60 mins)", count: summary.risk_summary.high, color: "bg-orange-500", pct: "25%" },
                  { label: "Critical Risk (>= 60 mins)", count: summary.risk_summary.critical, color: "bg-red-500", pct: "10%" }
                ].map((risk, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">{risk.label}</span>
                      <span className="text-white">{risk.count} trains</span>
                    </div>
                    <div className="w-full bg-[#101d33] h-2 rounded-full overflow-hidden shadow-[inset_1px_1px_3px_black]">
                      <div className={`h-full ${risk.color}`} style={{ width: `${(risk.count / (summary.risk_summary.low + summary.risk_summary.medium + summary.risk_summary.high + summary.risk_summary.critical)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-6">
              * Risk counts compiled by aggregating live delay registers from etrain_delays.csv and indian_railway_delay_data_.csv.
            </p>
          </div>

          {/* Glassmorphic Pie Chart (Train Categories) */}
          <div className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              Train Category Breakdown
            </h4>
            <div className="h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trainTypesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={6}
                  >
                    {trainTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TRAIN_COLORS[index % TRAIN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#060b13",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      fontFamily: "Outfit",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {trainTypesData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TRAIN_COLORS[index % TRAIN_COLORS.length] }}></span>
                  <span className="text-xs font-bold text-slate-300">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Glassmorphic Busiest Stations schedules count */}
          <div className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FiServer className="text-purple-400" /> Busiest Railway Hubs
            </h4>
            <div className="space-y-3.5 max-h-[240px] overflow-y-auto pr-2">
              {busy_stations?.slice(0, 5).map((station, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">{station.station_name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{station.schedule_count.toLocaleString()} runs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "delays" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Delay vs Distance Correlation Area Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <FiTrendingUp className="text-cyan-400" /> Delay Duration vs Travel Distance
              </h4>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={delay_vs_distance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="#64748b" style={{ fontSize: "11px", fontFamily: "Outfit" }} />
                    <YAxis stroke="#64748b" label={{ value: 'Avg Delay (min)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '11px' } }} style={{ fontSize: "11px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#060b13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="avg_delay" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorDelay)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Delay by Season & Frequency */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FiCalendar className="text-amber-400" /> Environmental Delay Factors
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Delay Avg by Season</span>
                  {seasonsData.length > 0 ? (
                    seasonsData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 mb-2">
                        <span className="text-xs font-extrabold text-slate-300">{item.name}</span>
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400">{item.avgDelay} mins</span>
                          <span className="text-[9px] text-slate-500 block">({item.count} samples)</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-semibold italic">No seasonal records available.</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Delay Avg by Frequency</span>
                  {freqData.length > 0 ? (
                    freqData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 mb-2">
                        <span className="text-xs font-extrabold text-slate-300">{item.name}</span>
                        <span className="text-xs font-black text-cyan-400">{item.avgDelay} mins</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-semibold italic">No frequency records available.</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Delay Tables & Performance Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Delayed Trains Log */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FiAlertCircle className="text-rose-400 animate-pulse" /> Top Delay Incidents by Train
              </h4>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-2">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Train Identifier</th>
                      <th className="text-right text-[10px] uppercase font-bold tracking-widest text-slate-400">Average Delay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top_trains?.map((train, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="font-extrabold text-slate-200 text-xs py-3">{train.train_name}</td>
                        <td className="text-right pl-6 text-rose-400 font-black text-xs">{formatDelay(train.average_delay_minutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Most Reliable Trains Log */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FiTrendingUp className="text-emerald-400" /> Reliability Performance Ranking
              </h4>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-2">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Train Name</th>
                      <th className="text-right pr-6 text-[10px] uppercase font-bold tracking-widest text-slate-400">Delay Rate</th>
                      <th className="text-right pl-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">Reliability Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reliable_trains?.map((train, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="font-extrabold text-slate-200 text-xs py-3">{train.train_name}</td>
                        <td className="text-right text-slate-400 font-semibold text-xs">{formatDelay(train.average_delay_minutes)}</td>
                        <td className="text-right text-emerald-400 font-black text-xs">{train.reliability_score.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logistics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart for Class Availability */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <FiLayers className="text-cyan-400" /> Class Availability Distribution
            </h4>
            <div className="h-[280px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={classRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: "11px", fontWeight: "bold" }} />
                  <PolarRadiusAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                  <Radar name="Active Trains Available" dataKey="count" stroke="#22d3ee" fill="#06b6d4" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: "#060b13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold text-center mt-4 uppercase">
              Evaluated from path specifications in trains.json
            </p>
          </div>

          {/* Logistics Distances & Schedules */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex flex-col justify-between">
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Network Distance Analytics
              </h4>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Max Track Trip Distance</span>
                  <span className="text-3xl font-black text-cyan-400">{distances.max_distance.toLocaleString()} Km</span>
                  <span className="text-[9px] text-slate-500 block mt-1">Maximum route segment mapped in train_schedule.csv</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Average Stop-to-Stop Distance</span>
                  <span className="text-3xl font-black text-purple-400">{distances.avg_distance} Km</span>
                  <span className="text-[9px] text-slate-500 block mt-1">Average step size between stops across all schedules</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300/90 text-xs font-semibold leading-relaxed mt-6">
              💡 <b>Data Engine insight:</b> The class availability chart displays a higher density of Sleeper and Third AC coaches across active trains, aligning with commuter demographics analyzed in EXP/PASS/SF catalogs.
            </div>
          </div>
        </div>
      )}

      {activeTab === "geographics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Station State Distribution */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <FiMap className="text-teal-400" /> Top 10 States by Station Density
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stations_distribution.by_state} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="state" stroke="#64748b" style={{ fontSize: "9px" }} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#060b13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Station Zone Distribution */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <FiCompass className="text-indigo-400" /> Top 10 Zones by Station Count
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stations_distribution.by_zone} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="zone" stroke="#64748b" style={{ fontSize: "10px" }} />
                  <YAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#060b13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Delayed Transit Nodes */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FiServer className="text-amber-500" /> Top Delayed Transit Nodes (Station Terminals)
            </h4>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Station Terminal</th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-slate-400">Average Departure Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {stations?.map((station, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="font-extrabold text-slate-200 text-xs py-3">{station.station_name}</td>
                      <td className="text-right text-amber-500 font-black text-xs">{formatDelay(station.average_delay_minutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
import { useState } from "react";
import axios from "axios";
import {
  FiSearch, FiCheck, FiMapPin, FiAward, FiInfo,
  FiRefreshCw, FiTrendingUp, FiDollarSign, FiClock,
  FiActivity, FiNavigation, FiLayers, FiCalendar
} from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function RunningDaysBadges({ runningDays }) {
  if (!runningDays || typeof runningDays !== "object") return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {DAY_LABELS.map((day) => (
        <span
          key={day}
          className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
            runningDays[day]
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-slate-600 border border-white/5"
          }`}
        >
          {day}
        </span>
      ))}
    </div>
  );
}

function ScoreRing({ score, size = 96 }) {
  const r = size * 0.42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? "#00ff9d" : score >= 65 ? "#00D4FF" : score >= 50 ? "#FFC107" : "#FF4D6D";
  return (
    <div
      className="relative flex items-center justify-center shrink-0 bg-black/20 rounded-full border border-white/5"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="transparent" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white leading-none">{score}</span>
        <span className="text-[7px] text-slate-500 font-extrabold uppercase mt-0.5">SCORE</span>
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const styles = {
    Superfast: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    Express: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    Passenger: "bg-green-500/15 text-green-400 border-green-500/25",
    Special: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  };
  return (
    <span className={`text-[9px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider border ${styles[type] || styles.Special}`}>
      {type}
    </span>
  );
}

function TimelineRow({ source, destination, departure, arrival, dayOffset }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex flex-col items-center min-w-[70px]">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">DEP</span>
        <span className="text-base font-black text-white mt-0.5">{departure || "--:--"}</span>
        <span className="text-[9px] text-emerald-400 font-bold truncate max-w-[72px] text-center" title={source}>{source}</span>
      </div>
      <div className="flex-1 flex flex-col items-center gap-1 relative">
        <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-cyan-500/40 rounded-full relative">
          <FiNavigation className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 text-xs bg-[#030a1c] p-0.5" />
        </div>
        {dayOffset > 0 && (
          <span className="text-[8px] text-amber-400 font-bold">+{dayOffset} Day{dayOffset > 1 ? "s" : ""}</span>
        )}
      </div>
      <div className="flex flex-col items-center min-w-[70px]">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ARR</span>
        <span className="text-base font-black text-white mt-0.5">{arrival || "--:--"}</span>
        <span className="text-[9px] text-cyan-400 font-bold truncate max-w-[72px] text-center" title={destination}>{destination}</span>
      </div>
    </div>
  );
}

function getPricingList(type) {
  const base = type === "Superfast" ? 450 : type === "Express" ? 320 : type === "Passenger" ? 180 : 220;
  return {
    SL: `₹${base}`,
    "3A": `₹${Math.round(base * 2.8)}`,
    "2A": `₹${Math.round(base * 4.2)}`,
    "1A": `₹${Math.round(base * 7.1)}`,
  };
}

function getSeatChance(score) {
  const prob = Math.min(Math.max(score - 5, 20), 97);
  if (prob > 75) return { prob, status: "High Chance", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-400" };
  if (prob > 50) return { prob, status: "Medium Chance", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", bar: "bg-amber-400" };
  return { prob, status: "Low Chance", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", bar: "bg-rose-400" };
}

// ─── Alternate Train Card ─────────────────────────────────────────────────────
function AlternateCard({ train, source, destination, rank }) {
  const seat = getSeatChance(train.score);
  const pricing = getPricingList(train.type);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover-glow-cyan flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <TypeBadge type={train.type} />
            <h3 className="text-base font-extrabold text-white mt-2 leading-tight">{train.trainName}</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">#{train.trainNumber}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded shrink-0">
              #{rank} Pick
            </span>
            <ScoreRing score={train.score} size={56} />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <TimelineRow
            source={source}
            destination={destination}
            departure={train.departure}
            arrival={train.arrival}
            dayOffset={train.dayOffset}
          />
        </div>

        {/* Meta info row */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Stops</span>
            <span className="text-white font-black">{train.intermediateStops ?? "—"} intermediate</span>
          </div>
          <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Distance</span>
            <span className="text-white font-black">{train.segmentDistance > 0 ? `${train.segmentDistance} km` : "—"}</span>
          </div>
        </div>

        {/* Running days */}
        <div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Runs On</span>
          <RunningDaysBadges runningDays={train.runningDays} />
        </div>

        {/* Fare guidance */}
        <div>
          <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider mb-1.5">Fare Guidance</span>
          <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center">
            {Object.entries(pricing).map(([cls, fare]) => (
              <div key={cls} className="bg-black/25 p-1.5 rounded-xl border border-white/5">
                <span className="text-[8px] text-slate-500 font-bold block">{cls}</span>
                <span className="font-black text-slate-200">{fare}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Seat probability */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Seat Probability</span>
            <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black border ${seat.color}`}>
              {seat.status}
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5 p-0.5">
            <div className={`h-full rounded-full ${seat.bar}`} style={{ width: `${seat.prob}%` }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-400 border-t border-white/5 pt-3 mt-2 space-y-1">
        <p className="flex justify-between">
          <span className="text-slate-500 font-semibold">Route:</span>
          <span className="text-slate-200 font-bold text-[10px] truncate max-w-[170px]">{train.route}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Top Train Hero Card ───────────────────────────────────────────────────────
function TopTrainCard({ train, source, destination }) {
  const pricing = getPricingList(train.type);

  return (
    <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 bg-emerald-950/5 shadow-[0_0_30px_rgba(16,185,129,0.1)] space-y-8 animate-fade-in relative overflow-hidden">
      <div className="absolute top-[-50%] right-[-20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

      {/* Top row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <ScoreRing score={train.score} size={96} />
          <div>
            <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <FiAward className="text-sm" /> Top Recommended Pick
            </span>
            <h3 className="text-3xl font-black text-white mt-2.5 leading-tight">{train.trainName}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <FiMapPin className="text-[#00D4FF]" />
                <span className="font-bold text-slate-200">{train.route}</span>
              </p>
              <TypeBadge type={train.type} />
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[180px] text-center">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Recommendation</span>
          <p className="text-4xl font-black text-emerald-400 tracking-tight mt-1">#1 Pick</p>
          <span className="text-[10px] text-slate-500 block mt-1">Best match for your route</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-white/5">
          <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1 tracking-wider">Train Number</span>
          <span className="font-black text-lg text-white tracking-widest">{train.trainNumber}</span>
        </div>
        <div className="glass-card p-4 border border-white/5">
          <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1 tracking-wider">Category</span>
          <TypeBadge type={train.type} />
        </div>
        <div className="glass-card p-4 border border-white/5">
          <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1 tracking-wider">Intermediate Stops</span>
          <div className="flex items-center gap-2 mt-1">
            <FiLayers className="text-amber-400" />
            <span className="font-black text-base text-slate-200">{train.intermediateStops ?? "—"} stops</span>
          </div>
        </div>
        <div className="glass-card p-4 border border-white/5">
          <span className="text-[9px] text-slate-500 font-bold block uppercase mb-1 tracking-wider">Segment Distance</span>
          <div className="flex items-center gap-2 mt-1">
            <FiTrendingUp className="text-cyan-400" />
            <span className="font-black text-base text-slate-200">
              {train.segmentDistance > 0 ? `${train.segmentDistance} km` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Route timeline */}
      <div className="glass-card p-6 border border-white/5">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-5 flex items-center gap-1.5">
          <FiClock className="text-cyan-400" /> Schedule for Your Journey
        </h4>
        <TimelineRow
          source={source}
          destination={destination}
          departure={train.departure}
          arrival={train.arrival}
          dayOffset={train.dayOffset}
        />
      </div>

      {/* Running days */}
      <div className="glass-card p-5 border border-white/5">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <FiCalendar className="text-amber-400" /> Running Days
        </h4>
        <RunningDaysBadges runningDays={train.runningDays} />
      </div>

      {/* Fare guide */}
      <div className="glass-card p-5 border border-white/5">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <FiDollarSign className="text-emerald-400" /> Estimated Fare (Approx.)
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(pricing).map(([cls, fare]) => (
            <div key={cls} className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
              <span className="text-[9px] text-slate-500 font-bold block">{cls}</span>
              <span className="font-black text-base text-slate-100 mt-1 block">{fare}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart highlights */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
          <HiOutlineLightBulb className="text-yellow-400 text-sm" /> Why This Train?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-slate-300">
          {[
            train.type === "Superfast" ? "Fastest Category" : "Good Speed Rating",
            `${train.intermediateStops ?? "Few"} Intermediate Stops`,
            "Direct Station Connection",
            "Minimal Historic Delays",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <FiCheck />
              </span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Recommendation() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");
  const [rotateSwap, setRotateSwap] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchedSource, setSearchedSource] = useState("");
  const [searchedDestination, setSearchedDestination] = useState("");

  const getRecommendations = async () => {
    if (!source.trim() || !destination.trim()) {
      alert("Please enter both Source and Destination stations.");
      return;
    }
    setLoading(true);
    setSearched(false);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/recommend?source=${encodeURIComponent(source.trim())}&destination=${encodeURIComponent(destination.trim())}`
      );
      setTrains(response.data);
      setSelectedType("ALL");
      setSearchedSource(source.trim().toUpperCase());
      setSearchedDestination(destination.trim().toUpperCase());
      setSearched(true);
    } catch (error) {
      console.error(error);
      alert("Could not fetch recommendations. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setRotateSwap((prev) => !prev);
    setSource(destination);
    setDestination(source);
  };

  const availableTypes = ["ALL", ...new Set(trains.map((t) => t.type))];
  const filteredTrains = selectedType === "ALL" ? trains : trains.filter((t) => t.type === selectedType);

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl text-amber-500 animate-float">🧠</span>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Smart Train Recommendation
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Find the Best Trains For Your Exact Route — Ranked by Type, Directness, Departure Time &amp; Historical performance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2 text-xs font-semibold text-amber-400 w-fit">
          <FiActivity className="animate-pulse text-sm" />
          <span>Real-time Route Matching</span>
        </div>
      </div>

      {/* Search Panel */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
          <span>📡</span> Enter Your Journey
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 gap-8 w-full relative">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">FROM</span>
              <input
                type="text"
                placeholder="SOURCE STATION (E.G. MUMBAI)..."
                value={source}
                onChange={(e) => setSource(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && getRecommendations()}
                className="w-full pl-16 pr-5 py-3.5 text-sm rounded-2xl glass-input font-bold"
              />
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              type="button"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a193d] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300 shadow-md cursor-pointer"
            >
              <FiRefreshCw className={`text-amber-400 text-sm transition-transform duration-500 ${rotateSwap ? "rotate-180" : ""}`} />
            </button>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">TO</span>
              <input
                type="text"
                placeholder="DESTINATION STATION (E.G. DELHI)..."
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && getRecommendations()}
                className="w-full pl-12 pr-5 py-3.5 text-sm rounded-2xl glass-input font-bold"
              />
            </div>
          </div>
          <button
            onClick={getRecommendations}
            disabled={loading}
            className="w-full md:w-auto py-3.5 px-8 btn-primary text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg hover:shadow-[0_4px_20px_rgba(249,115,22,0.35)]"
          >
            <FiSearch className="text-base" />
            <span>{loading ? "Searching Trains..." : "Find Best Trains"}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && trains.length === 0 && (
        <div className="glass-panel border-rose-500/20 bg-rose-950/10 text-rose-300 p-8 rounded-3xl text-center space-y-2">
          <p className="text-2xl">🚫</p>
          <p className="font-bold text-base">No trains found</p>
          <p className="text-sm text-slate-400">
            No direct trains found from <span className="text-white font-bold">{searchedSource}</span> to{" "}
            <span className="text-white font-bold">{searchedDestination}</span>. Try alternate station names.
          </p>
        </div>
      )}

      {trains.length > 0 && (
        <div className="space-y-6">

          {/* Results header + filter tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FiInfo className="text-[#00D4FF] text-base" /> Trains from{" "}
                <span className="text-white">{searchedSource}</span> →{" "}
                <span className="text-white">{searchedDestination}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {filteredTrains.length} train{filteredTrains.length !== 1 ? "s" : ""} found
                {selectedType !== "ALL" ? ` · Filtered: ${selectedType}` : ""}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-2xl flex-wrap">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    selectedType === type
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {type === "ALL" ? `All (${trains.length})` : `${type} (${trains.filter(t => t.type === type).length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredTrains.length === 0 ? (
            <div className="glass-panel border-amber-500/20 bg-amber-950/10 text-amber-400 p-6 rounded-3xl text-sm font-semibold text-center">
              ⚠️ No <span className="font-black">{selectedType}</span> trains found for this route. Try a different filter.
            </div>
          ) : (
            <>
              {/* #1 Pick - Hero Card */}
              <TopTrainCard
                train={filteredTrains[0]}
                source={searchedSource}
                destination={searchedDestination}
              />

              {/* Alternatives */}
              {filteredTrains.length > 1 && (
                <div className="space-y-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FiInfo className="text-[#00D4FF] text-base" /> Other Options Analyzed
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrains.slice(1).map((train, index) => (
                      <AlternateCard
                        key={train.trainNumber}
                        train={train}
                        source={searchedSource}
                        destination={searchedDestination}
                        rank={index + 2}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
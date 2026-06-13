import { useState } from "react";
import axios from "axios";
import { FiSearch, FiCalendar, FiMapPin, FiCheck } from "react-icons/fi";
import logo from "../assets/railway-bg.jpg";

export default function TrainSearch() {
  const [query, setQuery] = useState("");
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchTrain = async () => {
    if (!query.trim()) {
      alert("Enter Train Number or Train Name");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/train-search?query=${query}`
      );
      setTrain(response.data);
    } catch (error) {
      console.log(error);
      alert("Search Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Title Header Section */}
      <div>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="Indian Railways" className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0B1635] p-1 object-cover border-2 border-white/20" />
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Train Schedule & Route Search
            </h1>
          </div>
        <p className="text-[#A7B1C2] text-sm font-medium">
          Access Complete Schedules, Operating Days, and Halt Durations across the Indian Railways Network.
        </p>
      </div>

      {/* Search Input Widget */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#00D4FF] mb-4 flex items-center gap-3">
          <FiSearch className="text-[#00D4FF] text-lg" />
          <span className="text-white">Route Query Console</span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Train Number (e.g. 12951) or Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-5 pr-4 py-3.5 text-sm rounded-2xl glass-input font-bold text-white placeholder-[#A7B1C2] border border-white/10"
              onKeyDown={(e) => e.key === 'Enter' && searchTrain()}
            />
          </div>
          <button
            onClick={searchTrain}
            disabled={loading}
            className="px-8 py-3.5 btn-primary text-sm flex items-center justify-center gap-2 min-w-[140px]"
          >
            <span>{loading ? "Searching..." : "Search Route"}</span>
          </button>
        </div>
      </div>

      {/* Search Results Display */}
      {train && !train.message && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl space-y-8 animate-fade-in">

          {/* Train Name & Number Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
            <div>
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Active Schedule
              </span>
              <h2 className="text-3xl font-black text-white mt-2 leading-none">
                {train.trainName}
              </h2>
            </div>
            <div className="text-left md:text-right">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Train Number</span>
              <p className="text-2xl font-black text-cyan-400 tracking-wider mt-1">{train.trainNumber}</p>
            </div>
          </div>

          {/* KPI Widget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-[10px] text-[#A7B1C2] font-bold uppercase tracking-wider block mb-3">Origin / Destination</span>
              <div>
                <p className="text-sm font-bold text-white leading-snug">{train.route}</p>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-[10px] text-[#A7B1C2] font-bold uppercase tracking-wider block mb-3">Operating Halt Summary</span>
              <div>
                <p className="text-2xl font-black text-white">{train.totalStations}</p>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Stations Traversed</span>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <span className="text-[10px] text-[#A7B1C2] font-bold uppercase tracking-wider block mb-3">Schedule Integrity</span>
              <div>
                <p className="text-sm font-bold text-[#00FF9D]">Regular Run Schedule</p>
                <span className="text-[10px] text-[#A7B1C2] font-semibold uppercase tracking-wider">100% Verified Track Route</span>
              </div>
            </div>
          </div>

          {/* Running Days */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#A7B1C2] flex items-center gap-2">
              <FiCalendar className="text-[#00D4FF] text-sm" /> Running Days
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {train.runningDays?.map((day, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-xl bg-[#0B1635] text-[#00FF9D] font-extrabold text-xs border border-[#00FF9D]/10 uppercase tracking-wider"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Route Stations List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#A7B1C2] flex items-center gap-2">
              <FiMapPin className="text-[#00D4FF] text-sm" /> Station Stop Log
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {train.stations?.map((station, index) => (
                <div
                  key={index}
                  className="glass-card p-4 flex items-center gap-3.5 hover-glow-cyan"
                >
                  <span className="w-6 h-6 rounded-full bg-[#0B1635] border border-[#00D4FF]/20 text-[#00D4FF] font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-white">{station}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Train Not Found Alert */}
      {train?.message && (
        <div className="glass-panel border-red-500/20 bg-red-950/20 text-red-400 p-5 rounded-2xl text-xs font-bold flex items-center gap-3">
          <span>❌</span> {train.message || "Train Not Found in scheduling records."}
        </div>
      )}

    </div>
  );
}
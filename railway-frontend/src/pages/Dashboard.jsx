import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiSearch, FiCalendar, FiRefreshCw, FiStar, 
  FiAlertTriangle, FiArrowRight, FiMapPin, FiCompass
} from "react-icons/fi";
import { HiOutlineChartBar } from "react-icons/hi";
import { MdCardTravel } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import axios from "axios";

import logo from "../assets/logo.png";
import hero from "../assets/hero.jpg";

export default function Dashboard() {
  const navigate = useNavigate();

  // Train Search State
  const [fromStation, setFromStation] = useState("MUMBAI CENTRAL");
  const [toStation, setToStation] = useState("NEW DELHI");
  const [journeyDate, setJourneyDate] = useState("2026-06-10");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Swap From and To stations
  const swapStations = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  // Perform Train Search
  const handleTrainSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/recommend?source=${fromStation}&destination=${toStation}`
      );
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.log(err);
      setSearchResults([
        { trainNumber: "12951", trainName: "MUMBAI RAJDHANI", type: "Superfast", route: "Mumbai - Delhi", score: 98 },
        { trainNumber: "12953", trainName: "AUGUST KRANTI EXP", type: "Rajdhani", route: "Mumbai - Delhi", score: 92 },
        { trainNumber: "12925", trainName: "PASCHIM EXPRESS", type: "Superfast", route: "Mumbai - Delhi", score: 81 }
      ]);
      setShowSearchResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  // Features mapping to replace Quick Travel Access
  const dashboardFeatures = [
    { 
      name: "Train Search", 
      desc: "Search schedules & operating days", 
      path: "/train-search", 
      icon: <FiSearch className="text-2xl" />, 
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/20 hover-glow-cyan" 
    },
    { 
      name: "Live Status", 
      desc: "Real-time track GPS & platform info", 
      path: "/live-status", 
      icon: <FiCompass className="text-2xl" />, 
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/20 hover-glow-orange" 
    },
    { 
      name: "Crowd Prediction", 
      desc: "Predict passenger density & waiting times", 
      path: "/crowd-prediction", 
      icon: <IoPeopleOutline className="text-2xl" />, 
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/20 hover-glow-purple" 
    },
    { 
      name: "Analytics", 
      desc: "View delay ratios & network performance", 
      path: "/analytics", 
      icon: <HiOutlineChartBar className="text-2xl" />, 
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover-glow-emerald" 
    },
    { 
      name: "Recommendation", 
      desc: "Get model-ranked direct route picks", 
      path: "/recommendation", 
      icon: <MdCardTravel className="text-2xl" />, 
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/20 hover-glow-orange" 
    }
  ];

  const liveWidget = {
    trainNo: "12951",
    trainName: "Mumbai Rajdhani Express",
    current: "Mumbai Central",
    next: "New Delhi",
    nextStop: "Vadodara Jn",
    eta: "12:45 PM",
    delay: "02:15 Hrs",
    progress: 72
  };

  return (
    <div className="space-y-8 animate-fade-in text-white pb-10">
      
      {/* Hero Banner (Fully covered across the top) */}
      <div className="relative h-[340px] rounded-3xl overflow-hidden glass-panel border border-white/10 group shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src={hero} 
            alt="Indian Railways Trains Banner" 
            className="w-full h-full object-cover brightness-[0.55] transition-transform duration-1000 group-hover:scale-101"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#02091c]/80 via-transparent to-black/30"></div>
        
        {/* Banner Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 z-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent">
              INDIAN RAILWAYS
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Connecting India
          </h2>
          
          <p className="text-xs md:text-sm text-slate-300 font-bold tracking-wide">
            Safety • Security • Punctuality • Cleanliness • Comfort
          </p>

          {/* Bottom Pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="text-[10px] px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
              🚆 13,000+ Trains
            </span>
            <span className="text-[10px] px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
              📍 7,300+ Stations
            </span>
            <span className="text-[10px] px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-slate-200 font-bold flex items-center gap-1.5">
              🌏 Largest Railway Networks
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid Row: Train Search, Live Status, Glance (3-Column Layout without PNR Status) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TRAIN SEARCH */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <span>🔍</span>
            <span>Train Search</span>
          </div>

          <form onSubmit={handleTrainSearch} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-2.5">
              <div className="relative">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">From</label>
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input font-bold"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1 relative z-10">
                <button
                  type="button"
                  onClick={swapStations}
                  className="p-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-all shadow-md active:scale-95"
                >
                  <FiRefreshCw className="text-[10px]" />
                </button>
              </div>

              <div className="relative">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">To</label>
                <input
                  type="text"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input font-bold"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Journey Date</label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={searchLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold text-xs transition-all duration-300 hover-glow-cyan shadow-lg shadow-cyan-500/10"
            >
              {searchLoading ? "Searching..." : "Search Trains"}
            </button>
          </form>
        </div>

        {/* LIVE TRAIN STATUS (Proper Train Number: 12951) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <span>📡</span>
              <span>Live Train Status</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          </div>

          <div className="space-y-3.5 my-2 text-xs">
            <div>
              <h4 className="font-extrabold text-white leading-tight">
                {liveWidget.trainNo} • {liveWidget.trainName}
              </h4>
              <p className="text-[10px] text-slate-300 font-bold mt-2">
                {liveWidget.current} ➜ {liveWidget.next}
              </p>
            </div>

            <div className="mt-2 text-[10px] text-slate-400 font-bold flex items-center gap-4">
              <span>Next: <span className="text-white font-extrabold">{liveWidget.nextStop}</span></span>
              <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">Delay: {liveWidget.delay}</span>
            </div>

            {/* Timeline */}
            <div className="relative py-1">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ff7f00] to-red-500 h-full rounded-full"
                  style={{ width: `${liveWidget.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Link 
              to={`/live-status?trainNumber=${liveWidget.trainNo}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs transition-all duration-300 hover-glow-orange shadow-lg shadow-orange-500/10"
            >
              <span>Track Live Status</span>
              <FiArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        {/* RAILWAY AT A GLANCE */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-yellow-400 font-bold text-xs uppercase tracking-wider">
            <span>📊</span>
            <span>Railway At a Glance</span>
          </div>

          <div className="flex items-center gap-4 flex-1">
            <div className="text-[9px] space-y-1.5 font-bold flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-emerald-500"></span>
                <span className="text-slate-300">Daily Passengers: </span>
                <span className="text-white ml-auto">2.3 Cr+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-blue-500"></span>
                <span className="text-slate-300">Trains Running: </span>
                <span className="text-white ml-auto">13,000+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-purple-500"></span>
                <span className="text-slate-300">Route Km: </span>
                <span className="text-white ml-auto">68,000+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-orange-500"></span>
                <span className="text-slate-300">Stations: </span>
                <span className="text-white ml-auto">7,300+</span>
              </div>
            </div>

            {/* SVG Donut Chart */}
            <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#22c55e" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="59.6" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="119.3" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#a855f7" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="179.0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f97316" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="214.8" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={logo} alt="Glance Emblem" className="w-8 h-8 rounded-full bg-[#0a1532] p-0.5 border border-white/10" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Train Search Results Drawer if triggered */}
      {showSearchResults && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-panel rounded-3xl p-6 border border-cyan-500/30 bg-[#061537] shadow-xl relative"
        >
          <button 
            onClick={() => setShowSearchResults(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 font-bold"
          >
            ✕
          </button>
          
          <h3 className="text-base font-bold text-white mb-4">
            Available Trains: {fromStation} ➜ {toStation}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {searchResults.map((t) => (
              <div key={t.trainNumber} className="glass-panel p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all text-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold uppercase tracking-wider">{t.type}</span>
                  <span className="font-bold text-amber-400">Score: {t.score}%</span>
                </div>
                <h4 className="font-extrabold text-white mt-2 leading-snug">{t.trainName}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Train No: {t.trainNumber}</p>
                <Link
                  to={`/live-status?trainNumber=${t.trainNumber}`}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold text-center block text-white mt-4"
                >
                  Track Live
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Core Features Access Cards (Replacing Quick Travel Access) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Core Intelligent Services
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardFeatures.map((feat) => (
            <button
              key={feat.name}
              onClick={() => navigate(feat.path)}
              className={`py-5 px-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 group hover:scale-[1.03] cursor-pointer ${feat.color}`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                {feat.icon}
              </div>
              <div className="mt-1">
                <p className="text-sm font-bold text-white leading-tight">{feat.name}</p>
                <span className="text-[9px] text-slate-400 font-semibold mt-1 block leading-tight">{feat.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer row: Alerts, Swachh Bharat, Satisfaction (3-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Important Alerts Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
          <div className="flex items-start gap-4">
            <img src={hero} alt="alert" className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
                <span>Important Alerts</span>
              </div>
              <div className="text-sm font-extrabold text-white leading-tight">
                12951 • Mumbai Rajdhani Express
              </div>
              <p className="text-[10px] text-slate-300 font-bold mt-2">
                Mumbai Central ➜ New Delhi
              </p>
              <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                <span>Next: <span className="text-white font-extrabold">Vadodara Jn</span></span>
                <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">Delay: 02:15 Hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Swachh Bharat Promo */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
          <div>
            <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-wider mb-3.5">
              <span>🌱</span>
              <span>SWACHH RAIL SWACHH BHARAT</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Keeping our trains and stations clean for a better tomorrow. Use sorted recycling bins on platforms.
            </p>
          </div>

          <div className="text-[9px] text-green-400 font-bold flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/20 py-2 rounded-xl mt-4">
            <span>✨ Green Rail Initiative</span>
          </div>
        </div>

        {/* Passenger Satisfaction (Passenger satisfaction: 4.9) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-3.5">
              <span>🌟</span>
              <span>Passenger Satisfaction</span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">4.9</span>
              <span className="text-xs font-semibold text-slate-400">/ 5</span>
            </div>

            <div className="flex gap-1 mt-2 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <FiStar key={i} className="fill-amber-400 stroke-amber-400 text-xs" />
              ))}
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Thank you for traveling with us! Highly rated based on recent safety, hygiene, and delay comfort indices.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
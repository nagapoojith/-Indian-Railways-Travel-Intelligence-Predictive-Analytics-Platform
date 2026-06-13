import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiSearch, FiCompass, FiClock, FiCloudDrizzle,
  FiUsers, FiAlertTriangle, FiActivity, FiMapPin
} from "react-icons/fi";
import TrainMap from "../TrainMap";

export default function LiveStatus() {
  const location = useLocation();
  const [trainNumber, setTrainNumber] = useState("");
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [crowd, setCrowd] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-search if parameter is passed from dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramTrain = params.get("trainNumber");
    if (paramTrain) {
      setTrainNumber(paramTrain);
      autoFetch(paramTrain);
    }
  }, [location]);

  const autoFetch = async (num) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/live-status?trainNumber=${num}`
      );
      if (response.data.error) {
        alert(response.data.error);
        setResult(null);
        return;
      }
      setResult(response.data);
      fetchExtra(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExtra = async (statusData) => {
    try {
      // Prefer weather for the upcoming station; fallback to current if none
      const targetCity = statusData.nextStation && statusData.nextStation !== "Destination Reached"
        ? statusData.nextStation
        : statusData.currentStation;
      const weatherResponse = await axios.get(
        `http://127.0.0.1:5000/weather?city=${targetCity}`
      );
      setWeather(weatherResponse.data);
    } catch (e) {
      console.log(e);
    }

    try {
      const crowdResponse = await axios.get(
        `http://127.0.0.1:5000/crowd-prediction?station=${statusData.nextStation}`
      );
      setCrowd(crowdResponse.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getLiveStatus = async () => {
    if (!trainNumber.trim()) {
      alert("Enter Train Number");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/live-status?trainNumber=${trainNumber}`
      );

      if (response.data.error) {
        alert(response.data.error);
        setResult(null);
        setWeather(null);
        setCrowd(null);
        return;
      }

      setResult(response.data);
      await fetchExtra(response.data);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch train status");
    } finally {
      setLoading(false);
    }
  };

  const bulletinText = result
    ? (result.statusMessage || `Train (${result.trainNumber || trainNumber}) is running on time. Next station: ${result.nextStation || 'VADODARA JN'}.`).replace(/<[^>]*>/g, "")
    : null;

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Title Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl text-rose-500 animate-pulse">📡</span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Live Journey Intelligence
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-medium">
          Real-time GPS Tracking, Upcoming Platform Halts, Weather Updates, and Waitlist Risk Calculations.
        </p>
      </div>

      {/* Query Console */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2">
          <span>📍</span> Live Tracking Console
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter 5-digit Train Number (e.g. 12951)..."
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              className="w-full pl-5 pr-4 py-3.5 text-sm rounded-2xl glass-input font-bold"
              onKeyDown={(e) => e.key === 'Enter' && getLiveStatus()}
            />
          </div>
          <button
            onClick={getLiveStatus}
            disabled={loading}
            className="px-8 py-3.5 btn-primary text-sm flex items-center justify-center gap-2 min-w-[140px]"
          >
            <span>{loading ? "Tracking..." : "Track Train"}</span>
          </button>
        </div>
      </div>

      {/* Map Widget (If Status Available) */}
      {result && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
            <span>🗺️</span> Real-time Track Route
          </h3>
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#030a1c]">
            <TrainMap
              currentStation={result.currentStation}
              nextStation={result.nextStation}
              destination={result.destination}
              routeStations={result.routeStations}
            />
          </div>
        </div>
      )}

      {/* Live Track Widgets & Cards */}
      {result && (
        <div className="grid grid-cols-1 gap-6 items-start">

          {/* Main Status Panel */}
          <div className="space-y-6">

            {/* Live Station Indicators */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Status Log</h4>
                <span className="badge-live">Live GPS Link</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">📍 Last Crossed Station</span>
                  <p className="text-base font-extrabold text-white">{result.currentStation}</p>
                </div>
                <div className="glass-card p-5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">➡️ Upcoming Station Halt</span>
                  <p className="text-base font-extrabold text-cyan-400">{result.nextStation}</p>
                </div>
                <div className="glass-card p-5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">🚉 Expected Platform</span>
                  <p className="text-base font-extrabold text-white">Platform #{result.currentPlatform}</p>
                </div>
                <div className="glass-card p-5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">🏁 Final Destination</span>
                  <p className="text-base font-extrabold text-slate-300">{result.destination}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar Panel */}
            <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-lg space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Journey Progression</h4>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{result.distanceCovered} Km Traveled</span>
                <span>{result.totalDistance} Km Total</span>
              </div>

              <div className="w-full bg-white/5 border border-white/5 rounded-full h-4.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  style={{ width: `${result.progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-black text-white">{result.progress}% Completed</span>
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                  Estimated Delay: {result.etaNextStation}
                </span>
              </div>
            </div>

            {/* Top bulletin removed per user request; bulletin is shown near Journey Risk Scoring */}

          </div>

            {/* Right Side Widgets: Weather & Crowd side-by-side, Risk below */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weather Widget */}
              {weather && (
                <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FiCloudDrizzle className="text-[#00D4FF] text-sm" /> Station Weather
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="glass-card p-3">
                      <span className="text-[9px] text-[#A7B1C2] font-bold block uppercase mb-0.5">Location</span>
                      <span className="font-bold text-slate-200">{weather.city}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-3">
                        <span className="text-[9px] text-[#A7B1C2] font-bold block uppercase mb-0.5">Temperature</span>
                        <span className="font-bold text-white">{weather.temperature}°C</span>
                      </div>
                      <div className="glass-card p-3">
                        <span className="text-[9px] text-[#A7B1C2] font-bold block uppercase mb-0.5">Humidity</span>
                        <span className="font-bold text-slate-300">{weather.humidity}%</span>
                      </div>
                    </div>
                    <div className="glass-card p-3">
                      <span className="text-[9px] text-[#A7B1C2] font-bold block uppercase mb-0.5">Condition</span>
                      <span className="font-bold text-[#FF7A00]">{weather.weather}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Crowd Intelligence Widget */}
              {crowd && (
                <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FiUsers className="text-purple-400 text-sm" /> Crowd Analytics
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="glass-card p-3 flex justify-between items-center">
                      <span className="text-[9px] text-[#A7B1C2] font-bold uppercase">Halt Crowd Density</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${crowd.crowd === "High" ? "bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/20" :
                          crowd.crowd === "Medium" ? "bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/20" :
                            "bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]/20"
                        }`}>
                        {crowd.crowd}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-3">
                        <span className="text-[9px] text-[#A7B1C2] font-bold block uppercase mb-0.5">Crowd Score</span>
                        <span className="font-bold text-white">{crowd.score}%</span>
                      </div>
                      <div className="glass-card p-3">
                        <span className="text-[9px] text-[#A7B1C2] font-bold block uppercase mb-0.5">Best Travel Time</span>
                        <span className="font-bold text-[#00FF9D]">{crowd.bestTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Scoring Banner */}
            {crowd && weather && (
              <div className={`glass-panel rounded-3xl p-6 border shadow-lg space-y-3 ${crowd.crowd === "High" ? "border-[#FF4D6D]/20 bg-[#FF4D6D]/5 text-[#FF4D6D]" :
                  crowd.crowd === "Medium" ? "border-[#FFC107]/20 bg-[#FFC107]/5 text-[#FFC107]" :
                    "border-[#00FF9D]/20 bg-[#00FF9D]/5 text-[#00FF9D]"
                }`}>
                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <FiActivity className="text-sm" /> Journey Risk Scoring
                </h4>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black uppercase tracking-wider">{crowd.crowd} RISK</span>
                  <span className="text-[10px] font-semibold opacity-70">Based on Station congestion & weather indexes</span>
                </div>
              </div>
            )}

            {/* Repeat Active Bulletin near risk scoring for quick visibility */}
            {bulletinText && (
              <div className="glass-panel rounded-3xl p-4 border border-orange-500/20 bg-orange-950/5 text-orange-400 text-xs font-semibold flex items-start gap-3">
                <FiAlertTriangle className="text-sm shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase tracking-wider mb-1">Active Bulletin Message</span>
                  <p>{bulletinText}</p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
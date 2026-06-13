import { useState } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import { Line } from "react-chartjs-2";
import { FiUsers, FiClock, FiActivity, FiAlertCircle, FiTrendingUp, FiSettings } from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CrowdPrediction() {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictCrowd = async () => {
    if (!station.trim()) {
      alert("Enter Station Name");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/crowd-prediction?station=${station}`
      );
      setResult(response.data);
    } catch (error) {
      console.log(error);
      alert("Prediction Failed");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`),
    datasets: [
      {
        label: "Expected Station Traffic (Index)",
        data: result?.forecast ? result.forecast : [],
        borderColor: "#00d4ff",
        backgroundColor: "rgba(0, 212, 255, 0.08)",
        borderWidth: 3,
        pointBackgroundColor: "#00d4ff",
        pointBorderColor: "rgba(255,255,255,0.4)",
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { family: "Outfit", size: 11, weight: "bold" }
        }
      },
      tooltip: {
        backgroundColor: "rgba(4, 14, 36, 0.95)",
        titleFont: { family: "Outfit", size: 12, weight: "black" },
        bodyFont: { family: "Outfit", size: 12 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: {
          color: "#94a3b8",
          font: { family: "Outfit", size: 9 },
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          padding: 6
        }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { color: "#94a3b8", font: { family: "Outfit", size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Title Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl text-purple-500 animate-float">🚶‍♂️</span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Crowd Density Analytics
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-medium">
          Predict Hourly Passenger Congestion, Peak Hour Train Movements, and Calculate Optimum Boarding Times.
        </p>
      </div>

      {/* Query Console */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
          <span>🚦</span> Crowd Prediction Console
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Station Name (e.g. MUMBAI CENTRAL)..."
              value={station}
              onChange={(e) => setStation(e.target.value.toUpperCase())}
              className="w-full pl-5 pr-4 py-3.5 text-sm rounded-2xl glass-input font-bold"
              onKeyDown={(e) => e.key === 'Enter' && predictCrowd()}
            />
          </div>
          <button
            onClick={predictCrowd}
            disabled={loading}
            className="px-8 py-3.5 btn-primary text-sm flex items-center justify-center gap-2 min-w-[150px]"
          >
            <span>{loading ? "Calculating..." : "Predict Density"}</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg space-y-5">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Station Location</span>
                <h2 className="text-2xl font-black text-white">{result.station}</h2>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Traffic Density Level</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${result.crowd === "High" ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                      result.crowd === "Medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20" :
                        "bg-green-500/20 text-green-400 border border-green-500/20"
                    }`}>
                    {result.crowd}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Crowd Congestion Index</span>
                  <span className="font-bold text-white">{result.score}%</span>
                </div>

                <div className="w-full bg-white/5 border border-white/5 rounded-full h-3.5 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${result.score >= 70 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" :
                        result.score >= 40 ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]" :
                          "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                      }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Crowd Analytics Metrics</h4>
              <div className="space-y-3 text-xs">
                <div className="glass-card p-3.5 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Peak Movements:</span>
                  <span className="font-bold text-white">{result.peakTraffic} trains/hr</span>
                </div>
                <div className="glass-card p-3.5 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Optimal Travel Hours:</span>
                  <span className="font-bold text-emerald-400">{result.bestTime}</span>
                </div>
                <div className="glass-card p-3.5 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Average Queue Wait:</span>
                  <span className="font-bold text-slate-300">{result.waitingTime}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Monitored Peak Hours</h4>
              <div className="flex flex-wrap gap-2.5">
                {result.peakHours?.map((hour, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs uppercase tracking-wider"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Traffic Forecast Trend</h4>
            <div className="h-[360px] relative">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
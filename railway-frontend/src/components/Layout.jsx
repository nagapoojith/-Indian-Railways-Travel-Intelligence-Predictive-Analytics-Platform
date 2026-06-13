import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch, FiBell, FiUser, FiChevronDown,
  FiCompass, FiMapPin, FiActivity, FiStar
} from "react-icons/fi";
import { RiDashboardLine } from "react-icons/ri";
import { HiOutlineIdentification, HiOutlineChartBar } from "react-icons/hi";
import { MdCardTravel } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";

import logo from "../assets/logo.png";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <RiDashboardLine className="text-xl" /> },
    { name: "Train Search", path: "/train-search", icon: <FiSearch className="text-xl" /> },
    { name: "Live Status", path: "/live-status", icon: <FiCompass className="text-xl" /> },
    { name: "Crowd Prediction", path: "/crowd-prediction", icon: <IoPeopleOutline className="text-xl" /> },
    { name: "Analytics", path: "/analytics", icon: <HiOutlineChartBar className="text-xl" /> },
    { name: "Recommendation", path: "/recommendation", icon: <MdCardTravel className="text-xl" /> },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      if (/^\d+$/.test(searchText.trim())) {
        navigate(`/live-status?trainNumber=${searchText.trim()}`);
      } else {
        navigate(`/train-search?query=${searchText.trim()}`);
      }
      setSearchText("");
    }
  };

  const notifications = [
    { id: 1, text: "Train 12951 Mumbai Rajdhani is running late by 2h 15m", time: "Just Now", type: "alert" },
    { id: 2, text: "New crowd density guidelines issued for major junctions", time: "12 mins ago", type: "info" },
    { id: 3, text: "Weekly analytics reports are now available for review", time: "1 hour ago", type: "success" }
  ];

  return (
    <div className="flex h-screen bg-[#030a1c] text-white relative overflow-hidden font-sans">

      {/* Indian flag vertical glow leaking behind sidebar */}
      <div className="absolute top-0 left-0 w-80 h-full pointer-events-none z-0 opacity-20 bg-gradient-to-b from-[#ff6b00] via-white to-[#10b981] blur-[80px]"></div>

      {/* Decorative background light leaking */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      {/* Sidebar (Matching 2nd image style, but only 6 items from 1st image) */}
      <aside className="w-68 h-full flex flex-col glass-panel-heavy border-r border-white/5 py-6 px-4 z-40 shrink-0 sticky top-0">

        {/* Sidebar Logo */}
        <div className="flex flex-col items-center gap-2 mb-10 px-2">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-70 blur-md group-hover:opacity-100 transition duration-500"></div>
            <img
              src={logo}
              alt="Indian Railways"
              className="relative w-16 h-16 rounded-full bg-[#0a193d] p-1.5 object-contain border border-white/10"
            />
          </div>
          <div className="text-center mt-3">
            <h2 className="text-lg font-black tracking-wider bg-gradient-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent">
              INDIAN RAILWAYS
            </h2>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Travel Intelligence
            </span>
          </div>
        </div>

        {/* 6 Sidebar Navigation Menu Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${isActive
                    ? "bg-gradient-to-r from-[#ff7f00] to-[#e65c00] text-white border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.35)]"
                    : "text-slate-300 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10"
                  }`}
              >
                <span className={isActive ? "text-white" : "text-cyan-400 opacity-80"}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language & Footer in sidebar */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>🇮🇳</span>
          </div>
        </div>

      </aside>

      {/* Main Content Area (Layout wrapper containing Header + pages) */}
      <div className="flex-1 flex flex-col min-w-0 h-full z-10">

        {/* Top Header (Matching 2nd image) */}
        <header className="h-22 glass-panel border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-30">

          {/* Logo & Slogan Header */}
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-orange-400 via-white to-green-400 bg-clip-text text-transparent">
                  INDIAN RAILWAYS
                </h1>
              </div>
              <p className="text-[10px] text-slate-300 font-bold tracking-wide mt-0.5">
                Nation's Lifeline, World's Standard • Safety | Security | Punctuality | Cleanliness | Comfort
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-80 max-w-md hidden md:block">
            <input
              type="text"
              placeholder="Search Trains, Stations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full glass-input border border-white/10 placeholder-slate-400"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          </form>

          {/* Notifications and Profile */}
          <div className="flex items-center gap-4">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-slate-200 relative"
              >
                <FiBell className="text-lg" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-[10px] font-bold text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#05112c]">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel-heavy rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-50">
                  <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Recent Alerts</span>
                  </div>
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  N
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-white leading-none">Welcome, NAGA POOJITH</p>
                </div>
                <FiChevronDown className="text-slate-400 text-xs hidden lg:block" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-3 w-48 glass-panel-heavy rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50">
                  <div className="py-1">
                    <Link to="/live-status" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      <FiCompass /> Track Journey
                    </Link>
                    <Link to="/train-search" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      <FiSearch /> Search Schedules
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Page Render Body */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>

      </div>
    </div>
  );
}

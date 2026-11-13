"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import TournamentPassCard from "../home/TournamentPassCard";
import HorizontalEventCard from "../home/HorizontalEventCard";
import VerticalEventCard from "../home/VerticalEventCard";
import MatchItem from "../event/MatchItem";
import {
  Bell,
  Search,
  X,
  Trophy,
  Flame,
  ChevronRight,
  RefreshCw,
  Calendar,
} from "lucide-react";

export function HomeTab() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [eventsRes, matchesRes, notifsRes] = await Promise.all([
        api.get("/events").catch(() => ({ data: [] })),
        api.get("/match/event/all").catch(() => ({ data: [] })),
        api.get("/notifications/my").catch(() => ({ data: [] })),
      ]);

      setEvents(eventsRes.data || []);

      const allM = matchesRes.data || [];
      const relevant = allM
        .filter((m: any) => m.status === "LIVE" || m.status === "UPCOMING")
        .sort((a: any, b: any) => {
          if (a.status === "LIVE" && b.status !== "LIVE") return -1;
          if (b.status === "LIVE" && a.status !== "LIVE") return 1;
          return new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime();
        });
      setLiveMatches(relevant);

      const notifs = notifsRes.data || [];
      setUnreadNotifs(notifs.filter((n: any) => !n.read).length);
    } catch (e) {
      console.error("Home data error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const filteredEvents = events.filter((ev) =>
    ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.sport?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cricketEvents = events.filter(
    (ev) => ev.sport?.toLowerCase() === "cricket"
  );
  const badmintonEvents = events.filter(
    (ev) => ev.sport?.toLowerCase() === "badminton"
  );

  const athleteName = user?.name ? user.name.split(" ")[0] : "Athlete";

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">
            {getGreeting()}
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-0.5">
            {athleteName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="w-11 h-11 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin text-cyan-400" : ""} />
          </button>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="relative w-11 h-11 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <Bell size={19} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-[#020617] animate-pulse">
                {unreadNotifs > 9 ? "9+" : unreadNotifs}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Official Tournament Pass Card */}
      <TournamentPassCard user={user} />

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tournaments, sports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0f172a] border border-[#1e293b] focus:border-cyan-500 rounded-2xl py-3.5 pl-11 pr-10 text-white text-sm outline-none placeholder:text-slate-500 transition-all shadow-inner"
        />
        <Search size={18} className="absolute left-4 top-4 text-cyan-400" />
        {searchQuery.length > 0 && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* If Search Active */}
      {searchQuery.length > 0 ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-black text-lg">Search Results</h2>
            <span className="text-slate-400 text-xs font-semibold">
              {filteredEvents.length} tournaments
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
              No tournaments match &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredEvents.map((item) => (
              <VerticalEventCard key={item._id} item={item} />
            ))
          )}
        </div>
      ) : (
        <>
          {/* ================= MATCH CENTER SECTION ================= */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400">
                  <Flame size={16} />
                </div>
                <div>
                  <h2 className="text-white font-black text-lg tracking-tight leading-tight">
                    Match Center
                  </h2>
                  <p className="text-slate-500 text-[11px] font-semibold">
                    {liveMatches.length > 0 ? "Live & Upcoming Fixtures" : "Scores & Results"}
                  </p>
                </div>
              </div>

              <Link
                href="/matches"
                className="text-cyan-400 font-bold text-xs uppercase hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {liveMatches.length > 0 ? (
              <div className="space-y-3">
                {liveMatches.slice(0, 3).map((match) => (
                  <MatchItem key={match._id} item={match} />
                ))}
              </div>
            ) : (
              <Link
                href="/matches"
                className="block p-6 rounded-2xl bg-[#0f172a]/60 border border-[#1e293b] border-dashed text-center hover:border-cyan-500/40 transition-colors"
              >
                <Calendar size={28} className="mx-auto text-slate-600 mb-2" />
                <span className="block text-slate-300 font-bold text-xs">
                  No matches running right now
                </span>
                <span className="text-cyan-400 font-bold text-[11px] mt-1 block">
                  Tap to browse full schedule & tournament results →
                </span>
              </Link>
            )}
          </div>

          {/* ================= CRICKET FEVER ================= */}
          {cricketEvents.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-lg tracking-tight">
                    🏏 Cricket Fever
                  </h2>
                  <p className="text-slate-500 text-[11px] font-semibold">
                    Tournaments & Box Leagues
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {cricketEvents.map((item) => (
                  <HorizontalEventCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ================= BADMINTON SMASH ================= */}
          {badmintonEvents.length > 0 && (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-lg tracking-tight">
                    🏸 Badminton Smash
                  </h2>
                  <p className="text-slate-500 text-[11px] font-semibold">
                    Singles & Mixed Doubles Court Battles
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {badmintonEvents.map((item) => (
                  <HorizontalEventCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ================= ALL TOURNAMENT EVENTS ================= */}
          {events.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-white font-black text-lg tracking-tight">
                All Tournament Events
              </h2>
              {events.map((item) => (
                <VerticalEventCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomeTab;

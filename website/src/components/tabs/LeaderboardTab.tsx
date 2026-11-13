"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Trophy, Medal, Award, Flame, RefreshCw, Users, User } from "lucide-react";

export function LeaderboardTab() {
  const [activeTab, setActiveTab] = useState<"TEAMS" | "ATHLETES">("TEAMS");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "ATHLETES" ? "/leaderboard/users" : "/leaderboard/teams";
      const res = await api.get(endpoint);
      setData(res.data || []);
    } catch (e) {
      console.error("Leaderboard Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-amber-500/20 border-amber-500/50 text-amber-400",
          icon: <Trophy size={18} className="text-amber-400" />,
          label: "1ST",
        };
      case 1:
        return {
          bg: "bg-slate-300/20 border-slate-300/50 text-slate-300",
          icon: <Medal size={18} className="text-slate-300" />,
          label: "2ND",
        };
      case 2:
        return {
          bg: "bg-amber-700/20 border-amber-700/50 text-amber-600",
          icon: <Medal size={18} className="text-amber-600" />,
          label: "3RD",
        };
      default:
        return {
          bg: "bg-slate-800 border-slate-700 text-slate-500",
          icon: <span className="font-mono font-bold text-xs">#{index + 1}</span>,
          label: `#${index + 1}`,
        };
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Leaderboard</h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Top Performers & Standings
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchLeaderboard();
          }}
          className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-cyan-400"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin text-cyan-400" : ""} />
        </button>
      </div>

      {/* Switcher Toggle */}
      <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-2xl p-1 gap-1">
        <button
          onClick={() => setActiveTab("TEAMS")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === "TEAMS"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users size={15} />
          <span>Top Teams</span>
        </button>

        <button
          onClick={() => setActiveTab("ATHLETES")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === "ATHLETES"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <User size={15} />
          <span>Athletes</span>
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-3 pt-1">
        {loading ? (
          <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            <span>Calculating standings...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
            No records found on the leaderboard yet.
          </div>
        ) : (
          data.map((item, index) => {
            const badge = getRankBadge(index);
            const isTeam = activeTab === "TEAMS";
            const title = isTeam ? item.teamName || "Team" : item.name || "Athlete";
            const sub = isTeam
              ? `${item.sport || "SPORTS"} • ${item.highestRoundReached || "QUALIFIERS"}`
              : `@${item.username || "nits"} • Scholar ID: ${item.scholarId || "N/A"}`;
            const metric = isTeam
              ? `${item.wins || 0} Wins`
              : `Active Participant`;

            return (
              <div
                key={item._id || index}
                className={`p-4 rounded-2xl bg-[#0f172a] border transition-all flex items-center gap-3.5 shadow-md ${
                  index === 0
                    ? "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[#0f172a] to-[#0f172a]"
                    : "border-[#1e293b]"
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${badge.bg}`}
                >
                  {badge.icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-black text-sm truncate">{title}</h3>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{sub}</p>
                </div>

                {/* Performance Metric */}
                <div className="text-right flex-shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-xl bg-[#020617] border border-[#1e293b] text-cyan-400 font-black font-mono text-xs">
                    {metric}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LeaderboardTab;

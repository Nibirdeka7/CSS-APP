"use client";

import React from "react";
import Link from "next/link";
import { Clock, MapPin, Trophy, ChevronRight } from "lucide-react";

interface MatchItemProps {
  item: {
    _id: string;
    event?: { name: string; sport?: string };
    teamA?: { _id: string; name: string };
    teamB?: { _id: string; name: string };
    scoreA?: string;
    scoreB?: string;
    status: "UPCOMING" | "LIVE" | "COMPLETED";
    winner?: { _id: string; name?: string } | string;
    round?: string;
    venue?: string;
    startTime?: string;
  };
}

export function MatchItem({ item }: MatchItemProps) {
  const formatTime = (iso?: string) => {
    if (!iso) return { date: "TBD", time: "TBD" };
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const { date, time } = formatTime(item.startTime);
  const isLive = item.status === "LIVE";
  const isCompleted = item.status === "COMPLETED";

  const winnerId = typeof item.winner === "object" ? item.winner?._id : item.winner;
  const isTeamAWinner = isCompleted && winnerId === item.teamA?._id;
  const isTeamBWinner = isCompleted && winnerId === item.teamB?._id;

  const teamAName = item.teamA?.name || "TBD";
  const teamBName = item.teamB?.name || "TBD";

  return (
    <Link
      href={`/match/${item._id}`}
      className="group block bg-[#0f172a] rounded-2xl border border-[#1e293b] p-4 hover:border-cyan-500/50 transition-all duration-200 shadow-md mb-3"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider ${
              isLive
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : isCompleted
                ? "bg-slate-800 text-slate-400 border border-slate-700"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
            }`}
          >
            {isLive ? "● LIVE NOW" : item.status}
          </span>

          {item.round && (
            <span className="text-slate-400 font-semibold text-[11px]">
              {item.round}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
          <Clock size={12} />
          <span>
            {date} • {time}
          </span>
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 py-2">
        {/* Team A */}
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-1.5 w-full">
            {isTeamAWinner && <Trophy size={14} className="text-amber-400 flex-shrink-0" />}
            <span
              className={`font-black text-sm truncate ${
                isTeamAWinner ? "text-amber-400" : "text-white"
              }`}
            >
              {teamAName}
            </span>
          </div>
          {item.scoreA && (
            <span className="text-cyan-400 font-mono text-lg font-black mt-0.5">
              {item.scoreA}
            </span>
          )}
        </div>

        {/* VS / Match Center */}
        <div className="flex flex-col items-center px-3">
          <span className="text-slate-600 font-mono font-black text-xs uppercase tracking-widest">
            VS
          </span>
        </div>

        {/* Team B */}
        <div className="flex flex-col items-end min-w-0">
          <div className="flex items-center justify-end gap-1.5 w-full">
            <span
              className={`font-black text-sm truncate text-right ${
                isTeamBWinner ? "text-amber-400" : "text-white"
              }`}
            >
              {teamBName}
            </span>
            {isTeamBWinner && <Trophy size={14} className="text-amber-400 flex-shrink-0" />}
          </div>
          {item.scoreB && (
            <span className="text-cyan-400 font-mono text-lg font-black mt-0.5">
              {item.scoreB}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1e293b]/70 text-[11px] text-slate-400">
        <div className="flex items-center gap-1 truncate">
          <MapPin size={12} className="text-cyan-400 flex-shrink-0" />
          <span className="truncate">{item.venue || "Campus Sports Arena"}</span>
        </div>

        <div className="flex items-center gap-1 text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0">
          <span>Match Arena</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export default MatchItem;

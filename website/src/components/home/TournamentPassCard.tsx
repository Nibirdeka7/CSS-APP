"use client";

import React from "react";
import { User } from "@/context/AuthContext";
import { ShieldCheck, Trophy, Sparkles, Flame } from "lucide-react";
import Link from "next/link";

export function TournamentPassCard({ user }: { user: User | null }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] border border-[#1e293b]/70 p-6 mb-6 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
            <Trophy size={16} className="text-cyan-400" />
          </div>
          <span className="text-cyan-400 text-xs font-black tracking-widest uppercase">
            CSS OLYMPICS PASS
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          NIT SILCHAR
        </span>
      </div>

      {/* Main Info */}
      <div className="relative z-10">
        <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
          ATHLETE IDENTITY
        </div>
        <div className="text-2xl font-black text-white tracking-tight mt-0.5 truncate">
          {user?.name || "Athlete"}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[#1e293b]/60">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Scholar ID
            </div>
            <div className="text-cyan-300 font-mono text-sm font-bold">
              {user?.scholarId || "NOT ASSIGNED"}
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#1e293b]" />

          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Role
            </div>
            <div className="text-white text-xs font-bold uppercase">
              {user?.role === "ADMIN" ? (
                <span className="text-red-400 font-black">ADMINISTRATOR</span>
              ) : (
                "PARTICIPANT"
              )}
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#1e293b]" />

          <Link
            href="/matches"
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-xs font-bold tracking-wide"
          >
            <span>Live Matches</span>
            <Flame size={14} className="text-cyan-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TournamentPassCard;

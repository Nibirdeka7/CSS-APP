"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, adminApi } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import AdminLiveScoreModal from "@/components/admin/AdminLiveScoreModal";
import AdminEndMatchModal from "@/components/admin/AdminEndMatchModal";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Clock,
  Shield,
  Activity,
  Play,
  CheckCircle2,
  Users,
  Flame,
  RefreshCw,
} from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [match, setMatch] = useState<any>(null);
  const [teamADetails, setTeamADetails] = useState<any>(null);
  const [teamBDetails, setTeamBDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Admin Modals
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadMatchDetails();
    }
  }, [id]);

  const loadMatchDetails = async () => {
    try {
      const res = await api.get(`/match/${id}`);
      const matchData = res.data;
      setMatch(matchData);

      // Fetch full team details if available
      const teamAId = matchData.teamA?._id || matchData.teamA;
      const teamBId = matchData.teamB?._id || matchData.teamB;

      if (teamAId && teamBId) {
        const [resA, resB] = await Promise.all([
          api.get(`/teams/${teamAId}`).catch(() => ({ data: null })),
          api.get(`/teams/${teamBId}`).catch(() => ({ data: null })),
        ]);
        setTeamADetails(resA.data);
        setTeamBDetails(resB.data);
      }
    } catch (e) {
      console.error("Match detail error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    try {
      await adminApi.startMatch(id);
      alert("Match is now LIVE!");
      loadMatchDetails();
    } catch (e: any) {
      alert("Error starting match: " + (e.response?.data?.message || e.message));
    }
  };

  if (loading) {
    return (
      <ScreenWrapper hideNav={false}>
        <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          <span>Entering Match Arena...</span>
        </div>
      </ScreenWrapper>
    );
  }

  if (!match) {
    return (
      <ScreenWrapper hideNav={false}>
        <div className="p-12 text-center text-slate-500 text-xs">
          Match not found or removed.
        </div>
      </ScreenWrapper>
    );
  }

  const isLive = match.status === "LIVE";
  const isCompleted = match.status === "COMPLETED";
  const winnerId = match.winner?._id || match.winner;
  const isWinnerA = isCompleted && winnerId === match.teamA?._id;
  const isWinnerB = isCompleted && winnerId === match.teamB?._id;

  const teamAName = match.teamA?.name || "Team A";
  const teamBName = match.teamB?.name || "Team B";

  const formatMatchTime = (iso?: string) => {
    if (!iso) return "TBD";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScreenWrapper hideNav={false}>
      <div className="space-y-5 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              {match.event?.name || "TOURNAMENT"}
            </span>
            <span className="text-cyan-400 text-xs font-bold font-mono">
              {match.round || "Match"}
            </span>
          </div>

          <button
            onClick={loadMatchDetails}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Live Arena Scoreboard Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#0f172a] to-[#020617] border border-[#1e293b] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-20 bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Status Badge */}
          <div className="flex justify-center mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${
                isLive
                  ? "bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse"
                  : isCompleted
                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              }`}
            >
              {isLive && <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />}
              {isLive ? "● LIVE IN PROGRESS" : match.status}
            </span>
          </div>

          {/* Head to Head Arena */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 py-4">
            {/* Team A */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-[#1e293b] flex items-center justify-center text-2xl font-black text-cyan-400 mb-2 shadow-inner">
                {teamAName.charAt(0)}
              </div>
              <h3
                className={`font-black text-sm tracking-tight ${
                  isWinnerA ? "text-amber-400" : "text-white"
                }`}
              >
                {teamAName}
              </h3>
              {isWinnerA && (
                <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase mt-0.5">
                  <Trophy size={11} />
                  <span>WINNER</span>
                </span>
              )}
              <span className="text-2xl font-black font-mono text-cyan-400 mt-2">
                {match.scoreA || "--"}
              </span>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center px-2">
              <span className="text-slate-600 font-mono font-black text-sm">VS</span>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-[#1e293b] flex items-center justify-center text-2xl font-black text-blue-400 mb-2 shadow-inner">
                {teamBName.charAt(0)}
              </div>
              <h3
                className={`font-black text-sm tracking-tight ${
                  isWinnerB ? "text-amber-400" : "text-white"
                }`}
              >
                {teamBName}
              </h3>
              {isWinnerB && (
                <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase mt-0.5">
                  <Trophy size={11} />
                  <span>WINNER</span>
                </span>
              )}
              <span className="text-2xl font-black font-mono text-cyan-400 mt-2">
                {match.scoreB || "--"}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-around pt-4 mt-2 border-t border-[#1e293b]/70 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-cyan-400" />
              <span>{match.venue || "Campus Sports Complex"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" />
              <span>{formatMatchTime(match.startTime)}</span>
            </div>
          </div>
        </div>

        {/* ================= ADMIN QUICK CONTROLS ================= */}
        {isAdmin && (
          <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase">
              <Shield size={16} />
              <span>Admin Live Match Controls</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {match.status === "UPCOMING" && (
                <button
                  onClick={handleStartMatch}
                  className="col-span-2 py-3 rounded-xl bg-green-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-green-400 transition-colors shadow-md"
                >
                  <Play size={15} />
                  <span>Start Match (Go Live)</span>
                </button>
              )}

              {match.status === "LIVE" && (
                <>
                  <button
                    onClick={() => setScoreModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-cyan-400 transition-colors"
                  >
                    <Activity size={14} />
                    <span>Update Score</span>
                  </button>

                  <button
                    onClick={() => setEndModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-red-600 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-red-500 transition-colors"
                  >
                    <Trophy size={14} />
                    <span>End & Declare Winner</span>
                  </button>
                </>
              )}

              {match.status === "COMPLETED" && (
                <div className="col-span-2 text-center text-slate-400 text-xs font-semibold py-1">
                  Match completed. Winner:{" "}
                  <b className="text-amber-400">
                    {typeof match.winner === "object" ? match.winner?.name : "Winner"}
                  </b>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TEAM ROSTERS ================= */}
        <div className="space-y-4 pt-1">
          <h2 className="text-white font-black text-base uppercase tracking-tight">
            Team Lineups & Rosters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team A Roster */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <h3 className="text-cyan-400 font-black text-xs uppercase">{teamAName}</h3>
                <span className="text-slate-500 text-[10px] font-mono">
                  {teamADetails?.members?.length || 0} athletes
                </span>
              </div>

              {teamADetails?.members && teamADetails.members.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {teamADetails.members.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-white font-semibold">{m.name || m.email}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{m.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic pt-1">
                  Direct team entry without registered members.
                </p>
              )}
            </div>

            {/* Team B Roster */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <h3 className="text-blue-400 font-black text-xs uppercase">{teamBName}</h3>
                <span className="text-slate-500 text-[10px] font-mono">
                  {teamBDetails?.members?.length || 0} athletes
                </span>
              </div>

              {teamBDetails?.members && teamBDetails.members.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {teamBDetails.members.map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-white font-semibold">{m.name || m.email}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{m.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic pt-1">
                  Direct team entry without registered members.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modals */}
      {scoreModalOpen && (
        <AdminLiveScoreModal
          isOpen={scoreModalOpen}
          onClose={() => setScoreModalOpen(false)}
          match={match}
          onSuccess={loadMatchDetails}
        />
      )}

      {endModalOpen && (
        <AdminEndMatchModal
          isOpen={endModalOpen}
          onClose={() => setEndModalOpen(false)}
          match={match}
          onSuccess={loadMatchDetails}
        />
      )}
    </ScreenWrapper>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminApi, api } from "@/lib/api";
import AdminDirectTeamModal from "./AdminDirectTeamModal";
import AdminScheduleMatchModal from "./AdminScheduleMatchModal";
import AdminLiveScoreModal from "./AdminLiveScoreModal";
import AdminEndMatchModal from "./AdminEndMatchModal";
import AdminEventModal from "./AdminEventModal";
import {
  X,
  Shield,
  Activity,
  Trophy,
  Users,
  Swords,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Trash2,
  Edit,
  Clock,
  Layers,
  Sparkles,
  Phone,
} from "lucide-react";

export function AdminDrawer() {
  const { adminOpen, setAdminOpen, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "teams" | "events">(
    "overview"
  );

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeMatches: 0,
    totalTeams: 0,
    pendingTeams: 0,
  });

  // Data
  const [events, setEvents] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [pendingTeams, setPendingTeams] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Submodals
  const [directTeamModalOpen, setDirectTeamModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<any>(null);
  const [scoreModalMatch, setScoreModalMatch] = useState<any>(null);
  const [endModalMatch, setEndModalMatch] = useState<any>(null);

  // Teams Subtab
  const [teamsSubTab, setTeamsSubTab] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    if (adminOpen && isAdmin) {
      loadAllData();
    }
  }, [adminOpen, isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, matchesRes, pendingRes, allTeamsRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ data: {} })),
        api.get("/events").catch(() => ({ data: [] })),
        api.get("/match/event/all").catch(() => ({ data: [] })),
        adminApi.getPendingTeams().catch(() => ({ data: [] })),
        adminApi.getAllTeams().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data || {});
      setEvents(eventsRes.data || []);
      setMatches(matchesRes.data || []);
      setPendingTeams(pendingRes.data || []);
      setAllTeams(allTeamsRes.data || []);
    } catch (e) {
      console.error("Admin data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!adminOpen || !isAdmin) return null;

  const handleStartMatch = async (matchId: string) => {
    try {
      await adminApi.startMatch(matchId);
      alert("Match is now LIVE!");
      loadAllData();
    } catch (e: any) {
      alert("Start Match Error: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      await adminApi.deleteMatch(matchId);
      alert("Match removed!");
      loadAllData();
    } catch (e: any) {
      alert("Delete Match Error: " + (e.response?.data?.message || e.message));
    }
  };

  const handleApproveTeam = async (teamId: string) => {
    try {
      await adminApi.approveTeam(teamId);
      alert("Team approved successfully!");
      loadAllData();
    } catch (e: any) {
      alert("Approval Error: " + (e.response?.data?.message || e.message));
    }
  };

  const handleRejectTeam = async (teamId: string) => {
    const reason = prompt("Enter reason for rejection (optional):");
    try {
      await adminApi.rejectTeam(teamId, reason || undefined);
      alert("Team rejected!");
      loadAllData();
    } catch (e: any) {
      alert("Reject Error: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure? This will delete the event!")) return;
    try {
      await adminApi.deleteEvent(eventId);
      alert("Event deleted!");
      loadAllData();
    } catch (e: any) {
      alert("Delete Event Error: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#020617] border border-[#1e293b] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.2)] flex flex-col h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#1e293b] bg-[#0f172a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-black text-base uppercase tracking-tight">
                  ADMIN CONTROL HUB
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">System Management & Matchmaking</p>
            </div>
          </div>

          <button
            onClick={() => setAdminOpen(false)}
            className="p-2 rounded-full bg-[#1e293b] text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#0f172a]/70 border-b border-[#1e293b] p-1.5 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={14} />
            <span>Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === "teams"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users size={14} />
            <span>Teams</span>
            {pendingTeams.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-black">
                {pendingTeams.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "matches"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Swords size={14} />
            <span>Matches</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "events"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy size={14} />
            <span>Events</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDirectTeamModalOpen(true)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-[#0f172a] border border-cyan-500/40 text-left hover:border-cyan-400 transition-all shadow-lg group"
                >
                  <PlusCircle size={22} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-white font-black text-xs uppercase">
                    ⚡ DIRECT ADD TEAM
                  </span>
                  <span className="text-slate-400 text-[10px] mt-0.5 block">
                    0 players required, instantly ready for matchmaking
                  </span>
                </button>

                <button
                  onClick={() => setScheduleModalOpen(true)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-[#0f172a] border border-blue-500/40 text-left hover:border-blue-400 transition-all shadow-lg group"
                >
                  <Swords size={22} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-white font-black text-xs uppercase">
                    Schedule Match
                  </span>
                  <span className="text-slate-400 text-[10px] mt-0.5 block">
                    Set up fixtures & tournament rounds
                  </span>
                </button>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Total Users
                  </span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    {stats.totalUsers || 0}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Tournament Events
                  </span>
                  <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                    {events.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Active Live
                  </span>
                  <span className="text-2xl font-black text-green-400 font-mono mt-1 block">
                    {matches.filter((m) => m.status === "LIVE").length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Total Matches
                  </span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    {matches.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Total Teams
                  </span>
                  <span className="text-2xl font-black text-cyan-300 font-mono mt-1 block">
                    {allTeams.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                    Pending Teams
                  </span>
                  <span className="text-2xl font-black text-red-400 font-mono mt-1 block">
                    {pendingTeams.length}
                  </span>
                </div>
              </div>

              {/* System Notice */}
              <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/20 text-xs text-slate-300">
                <span className="text-cyan-400 font-bold block mb-1">
                  🛡️ Note on Point Investment:
                </span>
                Points investment / gambling logic has been completely decoupled from the system. Match settlements now strictly govern tournament standings, rankings, and match results.
              </div>
            </div>
          )}

          {/* ================= TEAMS TAB ================= */}
          {activeTab === "teams" && (
            <div className="space-y-4 animate-fade-in">
              {/* Top Action Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-[#1e293b]">
                  <button
                    onClick={() => setTeamsSubTab("pending")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                      teamsSubTab === "pending"
                        ? "bg-cyan-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Pending ({pendingTeams.length})
                  </button>
                  <button
                    onClick={() => setTeamsSubTab("approved")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                      teamsSubTab === "approved"
                        ? "bg-cyan-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Approved ({allTeams.filter((t) => t.approved).length})
                  </button>
                </div>

                {/* NEW DIRECT ADD BUTTON */}
                <button
                  onClick={() => setDirectTeamModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <PlusCircle size={14} />
                  <span>Direct Add</span>
                </button>
              </div>

              {/* Pending Teams List */}
              {teamsSubTab === "pending" && (
                <div className="space-y-3">
                  {pendingTeams.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-semibold bg-[#0f172a] rounded-2xl border border-[#1e293b]">
                      No pending team registrations at the moment.
                    </div>
                  ) : (
                    pendingTeams.map((team) => (
                      <div
                        key={team._id}
                        className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                              PENDING REVIEW
                            </span>
                            <h3 className="text-white font-black text-base mt-1">
                              {team.name}
                            </h3>
                            <p className="text-cyan-400 text-xs font-bold">
                              Event: {team.event?.name || "Tournament"}
                            </p>
                          </div>
                          <span className="text-slate-500 text-[11px] font-mono">
                            {team.members?.length || 0} players
                          </span>
                        </div>

                        {team.captainPhone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Phone size={13} className="text-slate-500" />
                            <span>Captain: {team.captainPhone}</span>
                          </div>
                        )}

                        {/* Members preview */}
                        {team.members && team.members.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-[#020617] text-xs text-slate-300 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Roster:
                            </span>
                            {team.members.map((m: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-white">{m.name || m.email}</span>
                                <span className="text-slate-500 font-mono">{m.role}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleApproveTeam(team._id)}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={15} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectTeam(team._id)}
                            className="py-2 px-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs uppercase hover:bg-red-500/25 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={15} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Approved Teams List */}
              {teamsSubTab === "approved" && (
                <div className="space-y-3">
                  {allTeams.filter((t) => t.approved).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-semibold bg-[#0f172a] rounded-2xl border border-[#1e293b]">
                      No approved teams found.
                    </div>
                  ) : (
                    allTeams
                      .filter((t) => t.approved)
                      .map((team) => (
                        <div
                          key={team._id}
                          className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-black text-sm">{team.name}</h3>
                              {team.members?.length === 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[9px] font-black uppercase">
                                  Direct / 0 Players
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {team.event?.name || "Event"} • {team.members?.length || 0} players
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                            Approved
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= MATCHES TAB ================= */}
          {activeTab === "matches" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Total Fixtures: {matches.length}
                </span>

                <button
                  onClick={() => setScheduleModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <PlusCircle size={14} />
                  <span>Schedule Match</span>
                </button>
              </div>

              {matches.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold bg-[#0f172a] rounded-2xl border border-[#1e293b]">
                  No matches scheduled yet. Tap &quot;Schedule Match&quot; to set up the first fixture.
                </div>
              ) : (
                matches.map((m) => (
                  <div
                    key={m._id}
                    className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          m.status === "LIVE"
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : m.status === "COMPLETED"
                            ? "bg-slate-800 text-slate-400"
                            : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-slate-400 text-[11px] font-semibold">
                        {m.round || "Fixture"} • {m.event?.name}
                      </span>
                    </div>

                    {/* Team vs Team */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <span className="block text-white font-black text-sm truncate">
                          {m.teamA?.name || "Team A"}
                        </span>
                        {m.scoreA && (
                          <span className="text-cyan-400 font-mono text-base font-bold">
                            {m.scoreA}
                          </span>
                        )}
                      </div>

                      <span className="text-slate-600 font-mono font-bold text-xs px-2">VS</span>

                      <div className="flex-1 text-right">
                        <span className="block text-white font-black text-sm truncate">
                          {m.teamB?.name || "Team B"}
                        </span>
                        {m.scoreB && (
                          <span className="text-cyan-400 font-mono text-base font-bold">
                            {m.scoreB}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Admin Actions Row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#1e293b]">
                      {m.status === "UPCOMING" && (
                        <button
                          onClick={() => handleStartMatch(m._id)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-green-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1 hover:bg-green-400 transition-colors"
                        >
                          <Play size={13} />
                          <span>Start Match</span>
                        </button>
                      )}

                      {m.status === "LIVE" && (
                        <>
                          <button
                            onClick={() => setScoreModalMatch(m)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1 hover:bg-cyan-400 transition-colors"
                          >
                            <Activity size={13} />
                            <span>Live Score</span>
                          </button>

                          <button
                            onClick={() => setEndModalMatch(m)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-red-600 text-white font-black text-xs uppercase flex items-center justify-center gap-1 hover:bg-red-500 transition-colors"
                          >
                            <Trophy size={13} />
                            <span>Declare Winner</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteMatch(m._id)}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete Match"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= EVENTS TAB ================= */}
          {activeTab === "events" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Tournaments ({events.length})
                </span>

                <button
                  onClick={() => {
                    setSelectedEventToEdit(null);
                    setEventModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <PlusCircle size={14} />
                  <span>Create Event</span>
                </button>
              </div>

              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase">
                        {ev.sport} • {ev.type}
                      </span>
                      <h3 className="text-white font-black text-base mt-1">{ev.name}</h3>
                      <p className="text-slate-400 text-xs">
                        Category: {ev.category} • Team size: {ev.minTeamSize}-{ev.maxTeamSize}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedEventToEdit(ev);
                          setEventModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-[#020617] border border-[#1e293b] text-slate-300 hover:text-white"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-xs">
                    <span
                      className={`font-bold ${
                        ev.registrationOpen ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {ev.registrationOpen ? "● Registration Open" : "○ Closed"}
                    </span>
                    <span
                      className={`font-bold ${
                        ev.isActive ? "text-cyan-400" : "text-slate-500"
                      }`}
                    >
                      {ev.isActive ? "Active Event" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submodals */}
        <AdminDirectTeamModal
          isOpen={directTeamModalOpen}
          onClose={() => setDirectTeamModalOpen(false)}
          events={events}
          onSuccess={loadAllData}
        />

        <AdminScheduleMatchModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          events={events}
          onSuccess={loadAllData}
        />

        {scoreModalMatch && (
          <AdminLiveScoreModal
            isOpen={!!scoreModalMatch}
            onClose={() => setScoreModalMatch(null)}
            match={scoreModalMatch}
            onSuccess={loadAllData}
          />
        )}

        {endModalMatch && (
          <AdminEndMatchModal
            isOpen={!!endModalMatch}
            onClose={() => setEndModalMatch(null)}
            match={endModalMatch}
            onSuccess={loadAllData}
          />
        )}

        <AdminEventModal
          isOpen={eventModalOpen}
          onClose={() => {
            setEventModalOpen(false);
            setSelectedEventToEdit(null);
          }}
          eventToEdit={selectedEventToEdit}
          onSuccess={loadAllData}
        />
      </div>
    </div>
  );
}

export default AdminDrawer;

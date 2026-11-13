"use client";

import React, { useState, useEffect } from "react";
import { adminApi, api } from "@/lib/api";
import { X, Calendar, MapPin, Swords, Loader2 } from "lucide-react";

interface AdminScheduleMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: any[];
  onSuccess: () => void;
}

export function AdminScheduleMatchModal({
  isOpen,
  onClose,
  events,
  onSuccess,
}: AdminScheduleMatchModalProps) {
  const [eventId, setEventId] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [round, setRound] = useState("QUALIFIERS");
  const [venue, setVenue] = useState("Campus Sports Ground");
  const [startTime, setStartTime] = useState("");
  const [eligibleTeams, setEligibleTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (eventId) {
      loadTeams(eventId);
    } else {
      setEligibleTeams([]);
    }
  }, [eventId]);

  const loadTeams = async (evId: string) => {
    setLoadingTeams(true);
    try {
      const res = await adminApi.getEligibleTeams(evId);
      setEligibleTeams(res.data || []);
    } catch (e) {
      console.error("Failed to load eligible teams:", e);
      // Fallback: try event teams
      try {
        const fallbackRes = await api.get(`/teams/event/${evId}`);
        setEligibleTeams(fallbackRes.data || []);
      } catch (err) {
        setEligibleTeams([]);
      }
    } finally {
      setLoadingTeams(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!eventId) return setErrorMsg("Select an Event");
    if (!teamA || !teamB) return setErrorMsg("Select both Team A and Team B");
    if (teamA === teamB) return setErrorMsg("Team A and Team B cannot be identical");
    if (!round) return setErrorMsg("Select Tournament Stage");

    try {
      setSubmitting(true);
      await adminApi.createMatch({
        event: eventId,
        teamA,
        teamB,
        round,
        venue,
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      });

      alert("Match scheduled successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Match schedule error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to schedule match");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#020617]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Swords size={18} />
            </div>
            <div>
              <h2 className="text-white font-black text-base uppercase">SCHEDULE NEW MATCH</h2>
              <p className="text-slate-400 text-[11px]">Matchmaking Arena</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1e293b] text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Event Select */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Tournament Event
            </label>
            <select
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                setTeamA("");
                setTeamB("");
              }}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
              required
            >
              <option value="">-- Choose Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name} ({ev.sport})
                </option>
              ))}
            </select>
          </div>

          {/* Stage / Round */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Tournament Stage / Round
            </label>
            <select
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
              required
            >
              <option value="QUALIFIERS">Qualifiers</option>
              <option value="QUARTER_FINALS">Quarter Finals</option>
              <option value="SEMI_FINALS">Semi Finals</option>
              <option value="FINALS">Grand Finals</option>
              <option value="NONE">League Match</option>
            </select>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Team A */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Team A
              </label>
              <select
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                disabled={!eventId || loadingTeams}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none transition-colors disabled:opacity-50"
                required
              >
                <option value="">{loadingTeams ? "Loading..." : "-- Team A --"}</option>
                {eligibleTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Team B */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Team B
              </label>
              <select
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                disabled={!eventId || loadingTeams}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none transition-colors disabled:opacity-50"
                required
              >
                <option value="">{loadingTeams ? "Loading..." : "-- Team B --"}</option>
                {eligibleTeams
                  .filter((t) => t._id !== teamA)
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {eventId && eligibleTeams.length === 0 && !loadingTeams && (
            <p className="text-amber-400 text-xs font-medium">
              ⚠️ No approved teams found for this event. You can directly add a team using the &quot;Direct Add Team&quot; button in Teams tab!
            </p>
          )}

          {/* Venue */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Venue
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Gymkhana Ground, Court 2"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 pl-10 text-white text-sm outline-none"
              />
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Scheduled Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting || eligibleTeams.length < 2}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Confirm Schedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminScheduleMatchModal;

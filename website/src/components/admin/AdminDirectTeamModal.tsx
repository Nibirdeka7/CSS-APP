"use client";

import React, { useState } from "react";
import { adminApi } from "@/lib/api";
import { X, PlusCircle, ShieldAlert, Loader2, Trophy } from "lucide-react";

interface AdminDirectTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: any[];
  onSuccess: () => void;
}

export function AdminDirectTeamModal({
  isOpen,
  onClose,
  events,
  onSuccess,
}: AdminDirectTeamModalProps) {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Team Name is required");
      return;
    }

    if (!eventId) {
      setErrorMsg("Please select an event");
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.createDirectTeam({
        name: name.trim(),
        eventId,
        captainPhone: captainPhone.trim() || "0000000000",
      });

      alert(`Team "${name.trim()}" created and approved directly with 0 players! Ready for matchmaking.`);
      setName("");
      setCaptainPhone("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Direct team creation error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to create team directly");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#020617]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <PlusCircle size={18} />
            </div>
            <div>
              <h2 className="text-white font-black text-base uppercase">DIRECT TEAM CREATION</h2>
              <p className="text-slate-400 text-[11px]">Instant approved team with 0 players</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
            💡 <b>Admin Feature:</b> This team is immediately marked as <b>Approved</b> for matchmaking with <b>0 players</b>. No approval queue or member invitations needed.
          </div>

          {/* Event Select */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Target Tournament Event
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
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

          {/* Team Name */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Team Name
            </label>
            <input
              type="text"
              placeholder="e.g. Thunder CSE / Alpha Squad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
              required
            />
          </div>

          {/* Optional Phone */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Captain Contact Phone <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210 (Optional)"
              value={captainPhone}
              onChange={(e) => setCaptainPhone(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors font-mono"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Adding Team...</span>
                </>
              ) : (
                <span>Add Approved Team</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDirectTeamModal;

"use client";

import React, { useState } from "react";
import { adminApi } from "@/lib/api";
import { X, Activity, Loader2 } from "lucide-react";

interface AdminLiveScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    _id: string;
    teamA?: { name: string };
    teamB?: { name: string };
    scoreA?: string;
    scoreB?: string;
  };
  onSuccess: () => void;
}

export function AdminLiveScoreModal({
  isOpen,
  onClose,
  match,
  onSuccess,
}: AdminLiveScoreModalProps) {
  const [scoreA, setScoreA] = useState(match.scoreA || "");
  const [scoreB, setScoreB] = useState(match.scoreB || "");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.updateScore(match._id, { scoreA, scoreB });
      alert("Live score broadcasted!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Score update error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#020617]">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-green-400 animate-pulse" />
            <h2 className="text-white font-black text-sm uppercase">UPDATE LIVE SCORE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1e293b] text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleUpdate} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Team A */}
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-300 truncate mb-1.5">
                {match.teamA?.name || "Team A"}
              </span>
              <input
                type="text"
                placeholder="e.g. 154/4"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                className="w-full text-center bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-2xl py-3 px-2 text-white font-mono text-xl font-black outline-none"
              />
            </div>

            {/* Team B */}
            <div className="text-center">
              <span className="block text-xs font-bold text-slate-300 truncate mb-1.5">
                {match.teamB?.name || "Team B"}
              </span>
              <input
                type="text"
                placeholder="e.g. 142/8"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                className="w-full text-center bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-2xl py-3 px-2 text-white font-mono text-xl font-black outline-none"
              />
            </div>
          </div>

          <p className="text-slate-500 text-[11px] text-center">
            Formats: Cricket (e.g. &quot;154/4 (20.0)&quot;), Badminton/Football (e.g. &quot;21 - 18&quot;).
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-950" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <span>Broadcast Score</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLiveScoreModal;

"use client";

import React, { useState } from "react";
import { adminApi } from "@/lib/api";
import { X, Trophy, AlertTriangle, Loader2 } from "lucide-react";

interface AdminEndMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    _id: string;
    teamA?: { _id: string; name: string };
    teamB?: { _id: string; name: string };
    round?: string;
  };
  onSuccess: () => void;
}

export function AdminEndMatchModal({
  isOpen,
  onClose,
  match,
  onSuccess,
}: AdminEndMatchModalProps) {
  const [winnerId, setWinnerId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEnd = async () => {
    if (!winnerId) {
      alert("Please select the winning team!");
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.endMatch(match._id, winnerId);
      alert("Match marked as COMPLETED and winner declared!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("End Match Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const teamAId = match.teamA?._id || "";
  const teamBId = match.teamB?._id || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#020617]">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-white font-black text-sm uppercase">DECLARE MATCH WINNER</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1e293b] text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300 text-xs">
            Select the champion of this contest. This concludes the fixture and advances tournament brackets.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Team A Button */}
            <button
              type="button"
              onClick={() => setWinnerId(teamAId)}
              className={`p-4 rounded-2xl border text-center transition-all ${
                winnerId === teamAId
                  ? "bg-amber-500/20 border-amber-500 text-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                  : "bg-[#020617] border-[#1e293b] text-slate-300 hover:border-slate-700"
              }`}
            >
              <Trophy size={20} className="mx-auto mb-2 text-amber-400" />
              <span className="block text-xs font-black truncate">
                {match.teamA?.name || "Team A"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 block">
                Winner
              </span>
            </button>

            {/* Team B Button */}
            <button
              type="button"
              onClick={() => setWinnerId(teamBId)}
              className={`p-4 rounded-2xl border text-center transition-all ${
                winnerId === teamBId
                  ? "bg-amber-500/20 border-amber-500 text-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                  : "bg-[#020617] border-[#1e293b] text-slate-300 hover:border-slate-700"
              }`}
            >
              <Trophy size={20} className="mx-auto mb-2 text-amber-400" />
              <span className="block text-xs font-black truncate">
                {match.teamB?.name || "Team B"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-1 block">
                Winner
              </span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <b>Tournament Settlement:</b> Loser loses 1 tournament life. If round is Grand Finals, 1st and 2nd rank will be finalized.
            </span>
          </div>

          <button
            type="button"
            onClick={handleEnd}
            disabled={!winnerId || submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Finalizing...</span>
              </>
            ) : (
              <span>Confirm Match Conclusion</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEndMatchModal;

"use client";

import React, { useState } from "react";
import { adminApi } from "@/lib/api";
import { X, Trophy, Loader2 } from "lucide-react";

interface AdminEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: any;
}

export function AdminEventModal({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit,
}: AdminEventModalProps) {
  const [name, setName] = useState(eventToEdit?.name || "");
  const [sport, setSport] = useState(eventToEdit?.sport || "CRICKET");
  const [category, setCategory] = useState(eventToEdit?.category || "MALE");
  const [type, setType] = useState(eventToEdit?.type || "TEAM");
  const [minTeamSize, setMinTeamSize] = useState(eventToEdit?.minTeamSize || 2);
  const [maxTeamSize, setMaxTeamSize] = useState(eventToEdit?.maxTeamSize || 11);
  const [bannerImageUrl, setBannerImageUrl] = useState(
    eventToEdit?.bannerImageUrl || ""
  );
  const [rules, setRules] = useState(
    eventToEdit?.rules || "Standard CSS Tournament rules apply."
  );
  const [registrationOpen, setRegistrationOpen] = useState(
    eventToEdit ? eventToEdit.registrationOpen : true
  );
  const [isActive, setIsActive] = useState(
    eventToEdit ? eventToEdit.isActive : true
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) return setErrorMsg("Event name required");

    const payload = {
      name: name.trim(),
      sport,
      category,
      type,
      minTeamSize: Number(minTeamSize),
      maxTeamSize: Number(maxTeamSize),
      bannerImageUrl:
        bannerImageUrl.trim() ||
        (sport === "CRICKET"
          ? "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
          : "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"),
      rules,
      registrationOpen,
      isActive,
    };

    try {
      setSubmitting(true);
      if (eventToEdit?._id) {
        await adminApi.updateEvent(eventToEdit._id, payload);
        alert("Event updated successfully!");
      } else {
        await adminApi.createEvent(payload);
        alert("Event created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Event submit error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save event");
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
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-white font-black text-base uppercase">
                {eventToEdit ? "EDIT EVENT" : "NEW TOURNAMENT EVENT"}
              </h2>
              <p className="text-slate-400 text-[11px]">Configuration & Rules</p>
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

          {/* Event Name */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Event Name
            </label>
            <input
              type="text"
              placeholder="e.g. CSS Premier League 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none"
              required
            />
          </div>

          {/* Sport & Category Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Sport
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none uppercase font-bold"
              >
                <option value="CRICKET">Cricket</option>
                <option value="BADMINTON">Badminton</option>
                <option value="FOOTBALL">Football</option>
                <option value="BASKETBALL">Basketball</option>
                <option value="TABLE_TENNIS">Table Tennis</option>
                <option value="CHESS">Chess</option>
                <option value="VOLLEYBALL">Volleyball</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none uppercase font-bold"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
          </div>

          {/* Type & Sizes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none uppercase font-bold"
              >
                <option value="TEAM">Team</option>
                <option value="SOLO">Solo</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Min Size
              </label>
              <input
                type="number"
                min={1}
                value={minTeamSize}
                onChange={(e) => setMinTeamSize(Number(e.target.value))}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Max Size
              </label>
              <input
                type="number"
                min={1}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-3 text-white text-xs outline-none font-mono"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Banner Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-xs outline-none font-mono"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Tournament Rules
            </label>
            <textarea
              rows={2}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#020617] border border-[#1e293b] cursor-pointer">
              <input
                type="checkbox"
                checked={registrationOpen}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
                className="w-4 h-4 text-cyan-500 accent-cyan-500 rounded"
              />
              <span className="text-xs font-bold text-slate-300">Registration Open</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-[#020617] border border-[#1e293b] cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-cyan-500 accent-cyan-500 rounded"
              />
              <span className="text-xs font-bold text-slate-300">Event Active</span>
            </label>
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
                  <span>Saving Event...</span>
                </>
              ) : (
                <span>{eventToEdit ? "Update Event" : "Create Event"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEventModal;

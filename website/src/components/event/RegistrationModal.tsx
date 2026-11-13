"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { X, Plus, Trash2, Users, Phone, ShieldCheck, Loader2 } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    _id: string;
    name: string;
    sport: string;
    type: string;
    minTeamSize?: number;
    maxTeamSize?: number;
  };
  user: any;
  onSuccess: () => void;
}

export function RegistrationModal({
  isOpen,
  onClose,
  event,
  user,
  onSuccess,
}: RegistrationModalProps) {
  const [teamName, setTeamName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const isSolo = event.type === "SOLO";

  const addMemberField = () => {
    if (event.maxTeamSize && memberEmails.length >= event.maxTeamSize - 1) {
      alert(`Maximum team size is ${event.maxTeamSize} (including Captain)`);
      return;
    }
    setMemberEmails([...memberEmails, ""]);
  };

  const removeMemberField = (index: number) => {
    const updated = [...memberEmails];
    updated.splice(index, 1);
    setMemberEmails(updated);
  };

  const updateEmail = (val: string, index: number) => {
    const updated = [...memberEmails];
    updated[index] = val;
    setMemberEmails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!captainPhone.trim()) {
      setErrorMsg("Captain phone number is required");
      return;
    }

    if (!isSolo && !teamName.trim()) {
      setErrorMsg("Team Name is required");
      return;
    }

    const validEmails = memberEmails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e !== "");

    if (!isSolo && validEmails.length === 0) {
      setErrorMsg("Please add at least one member email");
      return;
    }

    try {
      setSubmitting(true);
      const membersPayload = validEmails.map((email) => ({
        email,
        role: "PLAYER",
        phone: "",
      }));

      await api.post("/teams", {
        eventId: event._id,
        name: isSolo ? user?.name : teamName.trim(),
        captainPhone: captainPhone.trim(),
        members: membersPayload,
      });

      alert("Registration submitted! Awaiting administrator confirmation.");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Team registration error:", err);
      setErrorMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#020617]">
          <div>
            <h2 className="text-white font-black text-lg">REGISTER ENTRY</h2>
            <p className="text-cyan-400 text-xs font-bold uppercase">{event.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1e293b] text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Team Name (if group) */}
          {!isSolo && (
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Team Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cyber Strikers"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                required
              />
            </div>
          )}

          {/* Captain Contact */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Captain WhatsApp / Phone
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-3 pl-10 text-white text-sm outline-none transition-colors font-mono"
                required
              />
              <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            </div>
          </div>

          {/* Members (if group) */}
          {!isSolo && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Team Members (CSE Webmail)
                </label>
                <button
                  type="button"
                  onClick={addMemberField}
                  className="flex items-center gap-1 text-cyan-400 text-xs font-black hover:underline"
                >
                  <Plus size={14} />
                  <span>Add Player</span>
                </button>
              </div>

              {memberEmails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder={`Player ${idx + 1} email (@cse.nits.ac.in)`}
                    value={email}
                    onChange={(e) => updateEmail(e.target.value, idx)}
                    className="flex-1 bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none font-mono"
                  />
                  {memberEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(idx)}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-slate-500 text-[11px]">
                Allowed team size: {event.minTeamSize || 1} to {event.maxTeamSize || 11} members.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Confirm Registration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationModal;

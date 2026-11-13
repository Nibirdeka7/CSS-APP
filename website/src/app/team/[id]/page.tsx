"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  ArrowLeft,
  Users,
  Phone,
  Shield,
  Heart,
  Edit,
  Loader2,
  RefreshCw,
  Trophy,
} from "lucide-react";

export default function TeamDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadTeam();
  }, [id]);

  const loadTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
      setTeamName(res.data.name || "");
      setCaptainPhone(res.data.captainPhone || "");
    } catch (e) {
      console.error("Team load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/teams/${id}`, {
        name: teamName,
        captainPhone,
      });
      alert("Team details updated!");
      setEditing(false);
      loadTeam();
    } catch (err: any) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper hideNav={false}>
        <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          <span>Loading team dossier...</span>
        </div>
      </ScreenWrapper>
    );
  }

  if (!team) {
    return (
      <ScreenWrapper hideNav={false}>
        <div className="p-12 text-center text-slate-500 text-xs">Team not found.</div>
      </ScreenWrapper>
    );
  }

  const isCreator =
    user?._id &&
    (team.createdBy?._id === user._id || team.createdBy === user._id);

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
          <h1 className="text-xl font-black text-white tracking-tight">Team Details</h1>
          <button
            onClick={loadTeam}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Team Card */}
        <div className="p-6 rounded-3xl bg-[#0f172a] border border-[#1e293b] shadow-2xl relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                {team.event?.sport || "SPORT"} • {team.event?.name}
              </span>
              <h2 className="text-white text-2xl font-black mt-2 tracking-tight">
                {team.name}
              </h2>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                team.approved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}
            >
              {team.approved ? "Approved" : "Pending Review"}
            </span>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#1e293b] text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-cyan-400" />
              <span>{team.members?.length || 0} Members</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-red-400" />
              <span>{team.lives || 1} Tournament Lives</span>
            </div>

            {team.captainPhone && (
              <div className="flex items-center gap-1.5 font-mono">
                <Phone size={14} className="text-slate-400" />
                <span>{team.captainPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form if Creator */}
        {isCreator && (
          <div className="p-5 rounded-3xl bg-[#0f172a] border border-[#1e293b] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-black text-sm uppercase">Edit Team Info</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-cyan-400 text-xs font-bold hover:underline"
              >
                {editing ? "Cancel" : "Modify Details"}
              </button>
            </div>

            {editing && (
              <form onSubmit={handleUpdate} className="space-y-3 pt-2">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1">
                    Captain Phone
                  </label>
                  <input
                    type="tel"
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-xs outline-none font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Roster List */}
        <div className="space-y-3 pt-1">
          <h3 className="text-white font-black text-base uppercase tracking-tight">
            Athlete Roster
          </h3>

          {team.members && team.members.length > 0 ? (
            team.members.map((member: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-between"
              >
                <div>
                  <span className="text-white font-bold text-sm block">
                    {member.name || member.email}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono block">
                    {member.email}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    member.role === "CAPTAIN"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-[#0f172a] rounded-2xl border border-[#1e293b]">
              No players currently attached. (Direct Admin Team)
            </div>
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}

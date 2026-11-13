"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  User,
  Shield,
  LogOut,
  Hash,
  Mail,
  Trophy,
  Users,
  ChevronRight,
  Edit3,
  RefreshCw,
  Heart,
} from "lucide-react";

export function ProfileTab() {
  const { user, logout, isAdmin, setAdminOpen, updateUser } = useAuth();
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScholarId, setEditingScholarId] = useState(false);
  const [newScholarId, setNewScholarId] = useState(user?.scholarId || "");
  const [updatingId, setUpdatingId] = useState(false);

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    try {
      const res = await api.get("/teams/my").catch(() => ({ data: [] }));
      setMyTeams(res.data || []);
    } catch (e) {
      console.error("Profile teams fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScholarId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScholarId.trim()) return;

    try {
      setUpdatingId(true);
      const res = await api.patch("/users/me", { scholarId: newScholarId.trim() });
      updateUser({ scholarId: res.data.scholarId || newScholarId.trim() });
      setEditingScholarId(false);
      alert("Scholar ID updated!");
    } catch (e: any) {
      alert("Update failed: " + (e.response?.data?.message || e.message));
    } finally {
      setUpdatingId(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Athlete Profile</h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Official Credentials
          </p>
        </div>

        <button
          onClick={logout}
          className="p-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Profile ID Card */}
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-[#1e293b] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full p-1 border-2 border-cyan-400 overflow-hidden bg-slate-900 flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <img
              src={
                user?.profilePicture ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
              }
              alt={user?.name || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-white text-xl font-black truncate">{user?.name}</h2>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black uppercase">
                  ADMIN
                </span>
              )}
            </div>

            <p className="text-slate-400 text-xs truncate mt-0.5 font-mono">
              {user?.email}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-xl bg-[#020617] border border-[#1e293b] text-cyan-300 font-mono text-xs font-bold">
                ID: {user?.scholarId || "Not Linked"}
              </div>

              <button
                onClick={() => setEditingScholarId(!editingScholarId)}
                className="text-slate-400 hover:text-cyan-400 text-xs"
                title="Edit Scholar ID"
              >
                <Edit3 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Scholar ID Edit inline */}
        {editingScholarId && (
          <form
            onSubmit={handleUpdateScholarId}
            className="mt-4 pt-4 border-t border-[#1e293b] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Enter new Scholar ID"
              value={newScholarId}
              onChange={(e) => setNewScholarId(e.target.value)}
              className="flex-1 bg-[#020617] border border-[#1e293b] focus:border-cyan-500 rounded-xl px-3 py-2 text-white text-xs outline-none font-mono"
            />
            <button
              type="submit"
              disabled={updatingId}
              className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase"
            >
              Save
            </button>
          </form>
        )}
      </div>

      {/* Admin Quick Action Button (if admin) */}
      {isAdmin && (
        <button
          onClick={() => setAdminOpen(true)}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 flex items-center justify-between group hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Shield size={20} className="text-white" />
            <div className="text-left">
              <span className="block leading-tight">LAUNCH ADMIN PORTAL</span>
              <span className="text-red-200 text-[10px] font-normal normal-case block">
                Manage matches, fixtures, direct teams & approvals
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* My Registered Teams Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-cyan-400" />
            <h3 className="text-white font-black text-base uppercase tracking-tight">
              My Teams ({myTeams.length})
            </h3>
          </div>

          <span className="text-slate-500 text-xs font-semibold">Tournament Entries</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-cyan-400 font-bold text-xs">
            Loading teams...
          </div>
        ) : myTeams.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
            <p className="font-bold">You haven&apos;t registered any teams yet.</p>
            <p className="mt-1 text-slate-600">
              Browse tournaments from Dash and click &quot;Register Team&quot; to join!
            </p>
          </div>
        ) : (
          myTeams.map((team) => (
            <Link
              key={team._id}
              href={`/team/${team._id}`}
              className="block p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-cyan-500/50 transition-colors shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    {team.event?.sport || "SPORT"} • {team.event?.name}
                  </span>
                  <h4 className="text-white text-base font-black group-hover:text-cyan-400 transition-colors mt-0.5">
                    {team.name}
                  </h4>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    team.approved
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {team.approved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1e293b]/70 text-xs text-slate-400">
                <span>Roster: {team.members?.length || 0} athletes</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <span>View Team</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Logout Action */}
      <div className="pt-4">
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-slate-900 border border-red-500/30 text-red-400 font-black text-xs uppercase tracking-wider hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          <span>Exit Session / Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileTab;

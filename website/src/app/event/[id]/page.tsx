"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import MatchItem from "@/components/event/MatchItem";
import RegistrationModal from "@/components/event/RegistrationModal";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  ShieldAlert,
  Flame,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      const [eventRes, matchesRes, myTeamsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/match/event/${id}`).catch(() => ({ data: [] })),
        api.get("/teams/my").catch(() => ({ data: [] })),
      ]);

      setEvent(eventRes.data);
      setMatches(matchesRes.data || []);

      const myTeams = myTeamsRes.data || [];
      const alreadyReg = myTeams.some(
        (t: any) => t.event?._id === id || t.event === id
      );
      setIsRegistered(alreadyReg);
    } catch (e) {
      console.error("Event detail load error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper hideNav={false}>
        <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          <span>Loading tournament details...</span>
        </div>
      </ScreenWrapper>
    );
  }

  if (!event) {
    return (
      <ScreenWrapper hideNav={false}>
        <div className="p-12 text-center text-slate-500 text-xs">
          Tournament event not found.
        </div>
      </ScreenWrapper>
    );
  }

  const getButtonState = () => {
    if (isRegistered) {
      return {
        text: "ALREADY REGISTERED",
        disabled: true,
        className: "bg-slate-700 text-slate-300 cursor-not-allowed",
      };
    }
    if (!event.registrationOpen) {
      return {
        text: "REGISTRATION CLOSED",
        disabled: true,
        className: "bg-red-500/80 text-white cursor-not-allowed",
      };
    }
    return {
      text: "REGISTER TEAM",
      disabled: false,
      className:
        "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95",
    };
  };

  const btnState = getButtonState();

  const defaultImage =
    event.sport?.toLowerCase() === "cricket"
      ? "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
      : event.sport?.toLowerCase() === "badminton"
      ? "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
      : "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";

  return (
    <ScreenWrapper hideNav={false}>
      <div className="space-y-5 animate-fade-in pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight truncate">
              Tournament Details
            </h1>
          </div>

          <button
            onClick={loadEventData}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0f172a] border border-[#1e293b] shadow-2xl">
          <div className="relative h-52 w-full bg-slate-900">
            <img
              src={event.bannerImageUrl || defaultImage}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />

            <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
              {event.sport}
            </div>

            {event.isActive && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            <h2 className="text-white text-2xl font-black tracking-tight leading-snug">
              {event.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#1e293b] text-xs text-slate-400">
              <span className="font-bold text-slate-300 uppercase">
                Category: <b className="text-cyan-400">{event.category}</b>
              </span>
              <span>•</span>
              <span className="font-bold text-slate-300 uppercase">
                Type: <b className="text-cyan-400">{event.type}</b>
              </span>
              <span>•</span>
              <span className="font-bold text-slate-300">
                Team Size: {event.minTeamSize}-{event.maxTeamSize}
              </span>
            </div>

            {/* Rules */}
            {event.rules && (
              <div className="mt-4 p-4 rounded-2xl bg-[#020617] border border-[#1e293b] text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  Tournament Guidelines:
                </span>
                {event.rules}
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Register Team */}
        <div>
          <button
            onClick={() => setRegistrationModalOpen(true)}
            disabled={btnState.disabled}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${btnState.className}`}
          >
            {isRegistered ? (
              <>
                <CheckCircle2 size={18} />
                <span>ALREADY REGISTERED</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>{btnState.text}</span>
              </>
            )}
          </button>
        </div>

        {/* Matches Scheduled in this Event */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-black text-base uppercase tracking-tight">
              Event Fixtures ({matches.length})
            </h3>
            <span className="text-slate-500 text-xs font-semibold">Match Schedule</span>
          </div>

          {matches.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
              No matches scheduled yet for this tournament.
            </div>
          ) : (
            matches.map((m) => <MatchItem key={m._id} item={m} />)
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {registrationModalOpen && (
        <RegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          event={event}
          user={user}
          onSuccess={() => {
            setIsRegistered(true);
            loadEventData();
          }}
        />
      )}
    </ScreenWrapper>
  );
}

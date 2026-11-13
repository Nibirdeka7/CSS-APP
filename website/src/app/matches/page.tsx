"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import MatchItem from "@/components/event/MatchItem";
import { ArrowLeft, RefreshCw, Calendar, Flame } from "lucide-react";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState("ALL");
  const [selectedRound, setSelectedRound] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const [matchesRes, eventsRes] = await Promise.all([
        api.get("/match/event/all").catch(() => ({ data: [] })),
        api.get("/events").catch(() => ({ data: [] })),
      ]);

      setMatches(matchesRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (e) {
      console.error("Matches error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sportsList = [
    "ALL",
    ...Array.from(new Set(events.map((e) => e.sport).filter(Boolean))),
  ];

  const roundsList = [
    "ALL",
    "QUALIFIERS",
    "QUARTER_FINALS",
    "SEMI_FINALS",
    "FINALS",
  ];

  const filteredMatches = matches.filter((m) => {
    const sportMatch =
      selectedSport === "ALL" ||
      m.event?.sport?.toUpperCase() === selectedSport.toUpperCase();
    const roundMatch =
      selectedRound === "ALL" ||
      m.round?.toUpperCase() === selectedRound.toUpperCase();
    return sportMatch && roundMatch;
  });

  return (
    <ScreenWrapper activeTab="matches" hideNav={false}>
      <div className="space-y-4 animate-fade-in pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Match Center
              </h1>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                Full Tournament Schedule
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              loadMatches();
            }}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-cyan-400"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-cyan-400" : ""} />
          </button>
        </div>

        {/* Sports Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sportsList.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex-shrink-0 transition-all ${
                selectedSport === sport
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Rounds Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {roundsList.map((round) => (
            <button
              key={round}
              onClick={() => setSelectedRound(round)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider flex-shrink-0 transition-all ${
                selectedRound === round
                  ? "bg-blue-600 text-white"
                  : "bg-[#020617] border border-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              {round === "ALL" ? "All Stages" : round.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Matches List */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Fetching fixtures...</span>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
              <Calendar size={28} className="mx-auto text-slate-600 mb-2" />
              <p className="font-bold">No matches found for the selected filters.</p>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <MatchItem key={match._id} item={match} />
            ))
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}

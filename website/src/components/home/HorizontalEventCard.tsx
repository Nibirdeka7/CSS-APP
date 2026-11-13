"use client";

import React from "react";
import Link from "next/link";
import { Zap, Flame } from "lucide-react";

interface HorizontalEventCardProps {
  item: {
    _id: string;
    name: string;
    sport: string;
    type: string;
    bannerImageUrl?: string;
    isActive?: boolean;
    registrationOpen?: boolean;
  };
}

export function HorizontalEventCard({ item }: HorizontalEventCardProps) {
  const defaultImage =
    item.sport?.toLowerCase() === "cricket"
      ? "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
      : item.sport?.toLowerCase() === "badminton"
      ? "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
      : "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";

  const imageUrl = item.bannerImageUrl || defaultImage;

  return (
    <Link
      href={`/event/${item._id}`}
      className="group block flex-shrink-0 w-72 rounded-3xl overflow-hidden bg-[#0f172a] border border-[#1e293b] hover:border-cyan-500/50 transition-all duration-300 shadow-xl"
    >
      {/* Banner Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />

        {/* Live Badge */}
        {item.isActive && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}

        {/* Sport Category Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
          {item.sport}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 bg-[#0f172a]">
        <h3 className="text-white text-base font-black leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e293b]/70">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            {item.type} EVENT
          </span>

          <span className="inline-flex items-center gap-1 text-cyan-400 text-xs font-black tracking-wide group-hover:translate-x-0.5 transition-transform">
            <span>ENTER</span>
            <Zap size={13} className="text-cyan-400" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default HorizontalEventCard;

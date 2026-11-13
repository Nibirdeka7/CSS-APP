"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface VerticalEventCardProps {
  item: {
    _id: string;
    name: string;
    sport: string;
    type: string;
    bannerImageUrl?: string;
    isActive?: boolean;
  };
}

export function VerticalEventCard({ item }: VerticalEventCardProps) {
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
      className="group block w-full rounded-3xl overflow-hidden bg-[#0f172a] border border-[#1e293b] hover:border-cyan-500/50 transition-all duration-300 mb-4 shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />

        <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
          {item.sport}
        </div>

        {item.isActive && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className="p-5 bg-[#0f172a]">
        <h3 className="text-white text-lg font-black leading-snug group-hover:text-cyan-400 transition-colors">
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e293b]/70">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {item.type}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
            <span>VIEW DETAILS</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default VerticalEventCard;

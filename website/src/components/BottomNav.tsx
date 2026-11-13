"use client";

import React from "react";
import Link from "next/link";
import { Home, Swords, Globe2, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "matches" | "feed" | "profile" | "none" | "leaderboard";
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const navItems = [
    {
      id: "home",
      label: "Dash",
      href: "/?tab=home",
      icon: Home,
    },
    {
      id: "matches",
      label: "Matches",
      href: "/matches",
      icon: Swords,
    },
    {
      id: "feed",
      label: "Community",
      href: "/?tab=feed",
      icon: Globe2,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/?tab=profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-[480px] bg-[#0f172a]/95 backdrop-blur-xl border-t border-[#1e293b] px-4 py-2 flex items-center justify-around pointer-events-auto shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#06b6d4] scale-105"
                  : "text-[#64748b] hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${
                    isActive ? "drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]" : ""
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-black tracking-tight uppercase ${
                  isActive ? "text-[#06b6d4]" : "text-[#64748b]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;

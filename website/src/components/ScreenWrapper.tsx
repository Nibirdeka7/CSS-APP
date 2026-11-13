"use client";

import React, { ReactNode } from "react";
import BottomNav from "./BottomNav";
import AdminDrawer from "./admin/AdminDrawer";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";
import { Badge } from "./ui/badge";

interface ScreenWrapperProps {
  children: ReactNode;
  activeTab?: "home" | "matches" | "feed" | "profile" | "leaderboard" | "none";
  hideNav?: boolean;
}

export function ScreenWrapper({
  children,
  activeTab = "home",
  hideNav = false,
}: ScreenWrapperProps) {
  const { user, isAdmin, setAdminOpen } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] text-[#f8fafc] flex justify-center items-start selection:bg-cyan-500 selection:text-black">
      {/* Ambient background decoration for larger displays */}
      <div className="fixed inset-0 pointer-events-none hidden md:block overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Mobile App Viewport Frame */}
      <div className="relative w-full max-w-[480px] min-h-screen bg-[#020617] md:border-x md:border-[#1e293b] md:shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col z-10">
        {/* Top Mobile Status Header Bar */}
        <div className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-[#1e293b]/50 text-xs">
          <div className="flex items-center gap-2">
            {/* <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" /> */}
            
            <span className="font-extrabold tracking-wider text-cyan-400 text-[11px] uppercase">
              CSS OLYMPICS
            </span>
            <span className="text-slate-500 font-mono text-[10px]">NIT SILCHAR</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 transition-all text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.25)]"
              >
                <Shield size={12} className="text-red-400" />
                <span>Admin Hub</span>
              </button>
            )}
            <Badge variant="outline" className="text-[10px] font-mono">
              ACTIVE
            </Badge>
          </div>
        </div>

        {/* Screen Content */}
        <main className={`flex-1 flex flex-col px-4 pt-3 ${hideNav ? "pb-6" : "pb-24"}`}>
          {children}
        </main>

        {/* Bottom Nav Bar */}
        {!hideNav && <BottomNav activeTab={activeTab} />}

        {/* Admin Drawer Modal */}
        <AdminDrawer />
      </div>
    </div>
  );
}

export default ScreenWrapper;

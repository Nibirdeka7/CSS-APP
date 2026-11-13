"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  CheckCheck,
  RefreshCw,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications/my");
      setNotifications(res.data || []);
    } catch (e) {
      console.error("Notifications error:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      case "WARNING":
        return <AlertTriangle size={18} className="text-amber-400" />;
      case "ERROR":
        return <XCircle size={18} className="text-red-400" />;
      default:
        return <Info size={18} className="text-cyan-400" />;
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "recently";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  return (
    <ScreenWrapper hideNav={false}>
      <div className="space-y-4 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Notifications
            </h1>
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold uppercase transition-colors"
          >
            <CheckCheck size={16} />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Fetching alerts...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
              <Bell size={28} className="mx-auto text-slate-600 mb-2" />
              <span>No notifications right now. You are all caught up!</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-md ${
                  n.read
                    ? "bg-[#0f172a] border-[#1e293b] opacity-75"
                    : "bg-[#0f172a] border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                }`}
              >
                <div className="p-2 rounded-xl bg-[#020617] border border-[#1e293b] flex-shrink-0">
                  {getTypeIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-black text-sm truncate">
                      {n.title}
                    </h3>
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}

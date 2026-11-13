"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hash, Loader2, ArrowRight } from "lucide-react";

export function OnboardingView() {
  const { user, updateUser } = useAuth();
  const [scholarId, setScholarId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarId.trim()) return alert("Scholar ID is required");

    try {
      setLoading(true);
      const res = await api.patch("/users/me", { scholarId: scholarId.trim() });
      updateUser({ scholarId: res.data.scholarId || scholarId.trim() });
    } catch (error: any) {
      console.error("Scholar ID update error:", error);
      alert(error.response?.data?.message || "Failed to update Scholar ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Ambient glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-sm border-[#1e293b] bg-[#0f172a]/90 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
            <Hash size={26} />
          </div>

          <CardTitle className="text-2xl font-black text-white tracking-tight">
            Enter Scholar ID
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Welcome, <span className="text-white font-bold">{user?.name}</span>. Link your college Scholar ID to participate in CSS Olympics.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                NIT Silchar Scholar ID
              </label>
              <Input
                type="text"
                placeholder="e.g. 2412109"
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
                className="h-12 font-mono text-lg font-black tracking-wider text-center"
                required
              />
            </div>

            <Button
              type="submit"
              variant="cyan"
              disabled={loading}
              className="w-full h-12 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950 mr-2" />
                  <span>CONFIRMING ID...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM ID</span>
                  <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingView;

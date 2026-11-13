"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, Loader2, Sparkles } from "lucide-react";

export function LoginView() {
  const { handleGoogleSuccess, handleWebmailLogin, googleClientId, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showWebmailForm, setShowWebmailForm] = useState(!googleClientId);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return alert("Email required");
    if (!cleanEmail.endsWith("nits.ac.in")) {
      return alert("Access Restricted:\nOnly official NIT Silchar institute email (@cse.nits.ac.in / @nits.ac.in) is allowed.\nPersonal emails like @gmail.com are not permitted.");
    }

    setSubmitting(true);
    try {
      await handleWebmailLogin(cleanEmail, name);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-sm border-[#1e293b] bg-[#0f172a]/90 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center pb-4 pt-8">
          {/* Logo */}
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#020617] border-2 border-cyan-500/40 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.25)]">
            <span className="text-2xl font-black text-cyan-400 font-mono tracking-tighter">
              CSS
            </span>
          </div>

          <CardTitle className="text-2xl font-black tracking-tight text-white">
            CSS <span className="text-cyan-400">OLYMPICS</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs font-semibold tracking-wider uppercase mt-1">
            NIT Silchar Sports Portal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-8">
          {/* Official Google OAuth Login */}
          {googleClientId ? (
            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Google Sign-In Failed")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="300"
                />
              </div>

              <div className="relative w-full text-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1e293b]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0f172a] px-2 text-slate-500 font-bold">
                    Or Webmail Login
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWebmailForm(!showWebmailForm)}
                className="text-xs text-slate-400 hover:text-cyan-400 font-bold transition-colors"
              >
                {showWebmailForm ? "Hide Webmail Login" : "Sign In with College Email"}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <p className="text-xs text-cyan-300 font-semibold">
                Sign in with your campus Google Webmail
              </p>
            </div>
          )}

          {/* Webmail Sign In Form */}
          {showWebmailForm && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Pankaj Deka"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  College Webmail (@cse.nits.ac.in)
                </label>
                <Input
                  type="email"
                  placeholder="scholar_id@cse.nits.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 font-mono text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="cyan"
                disabled={submitting || isLoading}
                className="w-full h-11 text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-slate-950 mr-2" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Continue to Tournament</span>
                )}
              </Button>
            </form>
          )}

          <div className="pt-2 text-center">
            <span className="text-[10px] text-slate-500 leading-tight block">
              Restricted strictly to NIT Silchar CSE department students. User roles are authenticated against the system database.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginView;

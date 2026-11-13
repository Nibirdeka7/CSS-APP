"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ScreenWrapper from "@/components/ScreenWrapper";
import LoginView from "@/components/auth/LoginView";
import OnboardingView from "@/components/auth/OnboardingView";
import HomeTab from "@/components/tabs/HomeTab";
import FeedTab from "@/components/tabs/FeedTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import { Loader2 } from "lucide-react";

function MainContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "home";

  useEffect(() => {
    if (tabParam === "leaderboard" || tabParam === "matches") {
      router.replace("/matches");
    }
  }, [tabParam, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
        <span className="text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">
          INITIALIZING CSS OLYMPICS...
        </span>
      </div>
    );
  }

  // Not logged in -> Show Login View
  if (!user) {
    return <LoginView />;
  }

  // Logged in but missing Scholar ID -> Show Onboarding View
  if (!user.scholarId) {
    return <OnboardingView />;
  }

  // Authenticated with Scholar ID -> Show Tab View inside ScreenWrapper
  const activeTab = (
    ["home", "feed", "profile"].includes(tabParam)
      ? tabParam
      : "home"
  ) as "home" | "feed" | "profile";

  return (
    <ScreenWrapper activeTab={activeTab}>
      {activeTab === "home" && <HomeTab />}
      {activeTab === "feed" && <FeedTab />}
      {activeTab === "profile" && <ProfileTab />}
    </ScreenWrapper>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}

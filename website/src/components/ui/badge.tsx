import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "live" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    secondary: "bg-[#1e293b] text-slate-300 border-slate-700",
    destructive: "bg-red-500/20 text-red-400 border-red-500/40",
    outline: "text-slate-300 border-[#1e293b]",
    live: "bg-green-500/20 text-green-400 border-green-500/40",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

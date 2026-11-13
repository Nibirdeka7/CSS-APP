import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "cyan"
    | "glow";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20",
      cyan: "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25 hover:opacity-95",
      destructive:
        "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-500/20",
      outline:
        "border border-[#1e293b] bg-transparent text-slate-200 hover:bg-[#0f172a] hover:text-white hover:border-slate-700",
      secondary:
        "bg-[#1e293b] text-slate-200 hover:bg-[#334155] hover:text-white",
      ghost:
        "text-slate-400 hover:text-white hover:bg-[#0f172a]",
      link: "text-cyan-400 underline-offset-4 hover:underline",
      glow: "bg-cyan-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2.5",
      sm: "h-9 rounded-lg px-3 text-[11px]",
      lg: "h-13 rounded-2xl px-7 text-sm",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

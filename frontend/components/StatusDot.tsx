import { ServiceStatus } from "@/lib/types";

function dotColorClass(status: ServiceStatus): string {
  switch (status) {
    case "healthy":
      return "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]";
    case "down":
      return "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]";
    default:
      return "bg-slate-400 shadow-[0_0_4px_rgba(148,163,184,0.5)]";
  }
}

function shouldPulse(status: ServiceStatus): boolean {
  return status === "healthy" || status === "down";
}

interface StatusDotProps {
  status: ServiceStatus;
  size?: "sm" | "md";
}

export function StatusDot({ status, size = "sm" }: StatusDotProps) {
  const sizeClass = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <span
      className={`inline-block shrink-0 rounded-full ${sizeClass} ${dotColorClass(status)} ${
        shouldPulse(status) ? "animate-pulse" : ""
      }`}
      aria-hidden="true"
    />
  );
}

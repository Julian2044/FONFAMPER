import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "red" | "gray" | "blue";
};

const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-100"
};

export function Badge({ children, tone = "gray" }: BadgeProps) {
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", tones[tone])}>{children}</span>;
}

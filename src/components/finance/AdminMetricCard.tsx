import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type AdminMetricCardProps = {
  title: string;
  value: string;
  helper: string;
  trend?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "orange" | "gray";
};

const tones = {
  blue: "bg-blue-50 text-[#0057d9]",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-600",
  gray: "bg-slate-100 text-slate-600"
};

export function AdminMetricCard({ title, value, helper, trend, icon: Icon, tone = "blue" }: AdminMetricCardProps) {
  return (
    <Card className="min-h-[178px]">
      <div className="flex min-w-0 items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tones[tone])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 whitespace-nowrap text-[24px] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[30px]">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
          {trend ? <p className="mt-3 text-xs font-bold text-emerald-700">{trend}</p> : null}
        </div>
      </div>
    </Card>
  );
}

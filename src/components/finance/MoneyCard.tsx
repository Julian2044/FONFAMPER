import type { LucideIcon } from "lucide-react";
import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

type MoneyCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: "blue" | "green" | "gray" | "red";
  helper?: string;
};

const tones = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  gray: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-700"
};

export function MoneyCard({ title, value, icon: Icon, tone = "blue", helper }: MoneyCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">{formatCOP(value)}</p>
          {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
        </div>
        <div className={cn("rounded-lg p-3", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

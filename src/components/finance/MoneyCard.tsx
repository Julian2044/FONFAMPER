import type { LucideIcon } from "lucide-react";
import { formatCurrencyCOP } from "@/lib/fonfamper/format";
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
    <Card className="min-h-[168px]">
      <div className="flex min-w-0 items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 whitespace-nowrap text-[24px] font-bold leading-none tracking-tight text-slate-950 sm:text-[30px]">{formatCurrencyCOP(value)}</p>
          {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
        </div>
      </div>
    </Card>
  );
}

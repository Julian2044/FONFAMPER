"use client";

import { MoreHorizontal } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCOP } from "@/lib/format";
import { Card } from "@/components/ui/Card";

const data = [
  { month: "Ene", value: 950000 },
  { month: "Feb", value: 1150000 },
  { month: "Mar", value: 1280000 },
  { month: "Abr", value: 1430000 },
  { month: "May", value: 1650000 },
  { month: "Jun", value: 1320000 },
  { month: "Jul", value: 1480000 },
  { month: "Ago", value: 1520000 },
  { month: "Sep", value: 1390000 },
  { month: "Oct", value: 1580000 },
  { month: "Nov", value: 1460000 },
  { month: "Dic", value: 1650000 }
];

export function MonthlyActivityChart() {
  return (
    <Card className="min-h-[420px] p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-extrabold text-slate-950">Actividad mensual</h3>
          <p className="mt-1 text-sm text-slate-500">Aportes registrados por mes.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-[#0057d9]">
            Este año
          </button>
          <button type="button" className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Opciones de actividad mensual">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-8 h-[300px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis width={58} tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(219, 234, 254, 0.35)" }}
            formatter={(value) => formatCOP(Number(value))}
            contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)" }}
          />
          <Bar dataKey="value" fill="#0057d9" maxBarSize={34} radius={[8, 8, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

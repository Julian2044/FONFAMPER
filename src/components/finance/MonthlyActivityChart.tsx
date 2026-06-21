"use client";

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
  { month: "Dic", value: 1610000 }
];

export function MonthlyActivityChart() {
  return (
    <Card className="h-96">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-950">Actividad mensual</h3>
          <p className="mt-1 text-sm text-slate-500">Aportes registrados por mes.</p>
        </div>
        <p className="text-xl font-extrabold text-[#0057d9]">{formatCOP(1650000)}</p>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatCOP(Number(value))} contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} />
          <Bar dataKey="value" fill="#0057d9" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

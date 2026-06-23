"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCOP } from "@/lib/format";
import { Card } from "@/components/ui/Card";

type BalanceChartProps = {
  data: Array<{
    period: string;
    balance: number;
  }>;
  title?: string;
};

export function BalanceChart({ data, title = "Evolución de tu cuenta" }: BalanceChartProps) {
  return (
    <Card className="h-96 min-w-0">
      <div className="mb-6 flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">Comportamiento del saldo acumulado.</p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0057d9]">COP</div>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <LineChart data={data} margin={{ left: 0, right: 16, top: 22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatCOP(Number(value))} contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#0057d9"
            strokeWidth={4}
            dot={{ r: 6, fill: "#0057d9", stroke: "#ffffff", strokeWidth: 3 }}
            activeDot={{ r: 8 }}
            label={({ x, y, value }) => (
              <text x={x} y={Number(y) - 14} textAnchor="middle" fill="#0f172a" fontSize={12} fontWeight={700}>
                {formatCOP(Number(value))}
              </text>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

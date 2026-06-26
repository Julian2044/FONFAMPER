"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyCOP } from "@/lib/fonfamper/format";
import { Card } from "@/components/ui/Card";

type BalanceChartProps = {
  data: Array<{
    period: string;
    balance: number;
  }>;
  title?: string;
};

export function BalanceChart({ data, title = "Evolución de tu cuenta" }: BalanceChartProps) {
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const update = () => setShowLabels(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

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
        <LineChart data={data} margin={{ left: 4, right: 56, top: 22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} width={72} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatCurrencyCOP(Number(value))} contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#0057d9"
            strokeWidth={4}
            dot={{ r: 6, fill: "#0057d9", stroke: "#ffffff", strokeWidth: 3 }}
            activeDot={{ r: 8 }}
            label={
              showLabels
                ? ({ x, y, value }) => (
                    <text x={Number(x)} y={Number(y) - 14} textAnchor="middle" fill="#0f172a" fontSize={12} fontWeight={700}>
                      {formatCurrencyCOP(Number(value))}
                    </text>
                  )
                : false
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";

export type BalanceEvolutionPoint = {
  date: string;
  totalAdministrado: number;
};

type BalanceEvolutionChartProps = {
  title: string;
  subtitle: string;
  points: BalanceEvolutionPoint[];
  currencyLabel: string;
};

function formatAxisCurrency(value: number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$ 0";
  }

  if (Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    const formatted = new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: millions >= 10 ? 0 : 1
    }).format(millions);

    return `$ ${formatted} M`;
  }

  if (Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    const formatted = new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0
    }).format(thousands);

    return `$ ${formatted} k`;
  }

  return formatCurrencyCOP(amount);
}

export function BalanceEvolutionChart({ title, subtitle, points, currencyLabel }: BalanceEvolutionChartProps) {
  return (
    <Card className="min-h-[420px] min-w-0 p-5 sm:p-6">
      <div className="mb-6 flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-xl font-extrabold text-slate-950">{title}</h3>
          <p className="mt-1 break-words text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0057d9]">{currencyLabel}</div>
      </div>

      {points.length > 0 ? (
        <div className="h-[300px] min-w-0 sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ bottom: 0, left: 0, right: 10, top: 12 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(value) => formatDate(String(value))}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(value) => formatAxisCurrency(Number(value))}
                tickLine={false}
                width={76}
              />
              <Tooltip
                contentStyle={{
                  borderColor: "#e2e8f0",
                  borderRadius: 16,
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)"
                }}
                formatter={(value) => [formatCurrencyCOP(Number(value)), "Total administrado"]}
                labelFormatter={(label) => formatDate(String(label))}
              />
              <Line
                activeDot={{ r: 7 }}
                dataKey="totalAdministrado"
                dot={{ fill: "#0057d9", r: 4, stroke: "#ffffff", strokeWidth: 2 }}
                stroke="#0057d9"
                strokeWidth={4}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="max-w-md text-sm font-semibold leading-6 text-slate-500">Aún no hay datos suficientes para graficar la evolución del fondo.</p>
        </div>
      )}
    </Card>
  );
}

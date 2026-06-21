import type { Movement } from "@/types/finance";
import { formatCOP, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

type MovementTableProps = {
  movements: Movement[];
};

function valueClass(value: number) {
  if (value > 0) return "text-emerald-700";
  if (value < 0) return "text-red-600";
  return "text-slate-500";
}

function typeTone(type: Movement["type"]) {
  if (type === "Aporte" || type === "Utilidad") return "green";
  if (type === "Retiro") return "red";
  if (type === "Saldo inicial") return "blue";
  return "gray";
}

function formatMovementValue(value: number, type: Movement["type"]) {
  if (value > 0 && type !== "Saldo inicial") return `+${formatCOP(value)}`;
  return formatCOP(value);
}

export function MovementTable({ movements }: MovementTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Fecha</th>
              <th className="px-5 py-3 font-semibold">Concepto</th>
              <th className="px-5 py-3 font-semibold">Tipo</th>
              <th className="px-5 py-3 text-right font-semibold">Valor</th>
              <th className="px-5 py-3 text-right font-semibold">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movements.map((movement) => (
              <tr key={`${movement.date}-${movement.concept}`} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(movement.date)}</td>
                <td className="px-5 py-4 font-medium text-slate-900">{movement.concept}</td>
                <td className="px-5 py-4">
                  <Badge tone={typeTone(movement.type)}>{movement.type}</Badge>
                </td>
                <td className={cn("whitespace-nowrap px-5 py-4 text-right font-semibold", valueClass(movement.value))}>
                  {formatMovementValue(movement.value, movement.type)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                  {formatCOP(movement.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { Movement } from "@/types/finance";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";
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
  if (value > 0 && type !== "Saldo inicial") return `+${formatCurrencyCOP(value)}`;
  return formatCurrencyCOP(value);
}

export function MovementTable({ movements }: MovementTableProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="block lg:hidden">
        <div className="divide-y divide-slate-100">
          {movements.map((movement) => (
            <div key={`${movement.date}-${movement.concept}`} className="space-y-3 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-950">{movement.concept}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(movement.date)}</p>
                </div>
                <Badge tone={typeTone(movement.type)}>{movement.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-slate-400">Valor</p>
                  <p className={cn("mt-1 whitespace-nowrap font-semibold", valueClass(movement.value))}>{formatMovementValue(movement.value, movement.type)}</p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-xs font-semibold uppercase text-slate-400">Saldo</p>
                  <p className="mt-1 whitespace-nowrap font-semibold text-slate-900">{formatCurrencyCOP(movement.balance)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="w-full min-w-0 max-w-full overflow-x-auto">
          <table className="w-full min-w-[920px] table-fixed divide-y divide-slate-200 text-left text-sm">
          <colgroup>
              <col className="w-[15%]" />
              <col className="w-[40%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
          </colgroup>
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
                  <td className="whitespace-nowrap px-5 py-4 align-top text-slate-600">{formatDate(movement.date)}</td>
                  <td className="break-words px-5 py-4 align-top font-medium leading-6 text-slate-900">{movement.concept}</td>
                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex max-w-full">
                      <Badge tone={typeTone(movement.type)}>{movement.type}</Badge>
                    </span>
                  </td>
                  <td className={cn("whitespace-nowrap px-5 py-4 align-top text-right font-semibold", valueClass(movement.value))}>
                    {formatMovementValue(movement.value, movement.type)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top text-right font-semibold text-slate-900">
                    {formatCurrencyCOP(movement.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/Badge";
import { formatCurrencyCOP, formatDate } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";
import type { AccountStatementMovement } from "@/lib/fonfamper/statement-data";

type StatementMovementListProps = {
  movements: AccountStatementMovement[];
};

const movementLabels: Record<AccountStatementMovement["movementType"], string> = {
  SALDO_INICIAL: "Saldo inicial",
  APORTE: "Aporte",
  RETIRO: "Retiro",
  AJUSTE: "Ajuste"
};

function movementTone(type: AccountStatementMovement["movementType"]) {
  if (type === "APORTE") return "green";
  if (type === "RETIRO") return "red";
  if (type === "SALDO_INICIAL") return "blue";
  return "gray";
}

function valueClass(type: AccountStatementMovement["movementType"]) {
  if (type === "APORTE" || type === "AJUSTE") return "text-emerald-700";
  if (type === "RETIRO") return "text-red-600";
  return "text-slate-700";
}

function formatMovementAmount(movement: AccountStatementMovement) {
  const value = formatCurrencyCOP(Math.abs(movement.amount));

  if (movement.movementType === "RETIRO") {
    return `-${value}`;
  }

  if (movement.movementType === "APORTE" || movement.movementType === "AJUSTE") {
    return `+${value}`;
  }

  return value;
}

export function StatementMovementList({ movements }: StatementMovementListProps) {
  if (movements.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay movimientos en este periodo.</p>;
  }

  return (
    <div className="min-w-0">
      <div className="space-y-3 xl:hidden">
        {movements.map((movement) => (
          <div key={movement.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-extrabold text-slate-950">{movement.concept}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(movement.movementDate)}</p>
              </div>
              <Badge tone={movementTone(movement.movementType)}>{movementLabels[movement.movementType]}</Badge>
            </div>

            <p className="mt-3 break-words text-sm text-slate-600">{movement.description || "Sin descripción"}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-slate-400">Valor</p>
                <p className={cn("mt-1 whitespace-nowrap font-extrabold", valueClass(movement.movementType))}>{formatMovementAmount(movement)}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-xs font-bold uppercase text-slate-400">Saldo después</p>
                <p className="mt-1 whitespace-nowrap font-extrabold text-slate-950">{formatCurrencyCOP(movement.balanceAfter)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white xl:block">
        <table className="w-full table-fixed divide-y divide-slate-200 text-left text-sm">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
            <col className="w-[26%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Concepto</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 text-right font-semibold">Valor</th>
              <th className="px-4 py-3 text-right font-semibold">Saldo después</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-4 align-top font-semibold text-slate-600">{formatDate(movement.movementDate)}</td>
                <td className="px-4 py-4 align-top">
                  <Badge tone={movementTone(movement.movementType)}>{movementLabels[movement.movementType]}</Badge>
                </td>
                <td className="break-words px-4 py-4 align-top font-semibold text-slate-950">{movement.concept}</td>
                <td className="break-words px-4 py-4 align-top text-slate-600">{movement.description || "Sin descripción"}</td>
                <td className={cn("whitespace-nowrap px-4 py-4 align-top text-right font-extrabold", valueClass(movement.movementType))}>
                  {formatMovementAmount(movement)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 align-top text-right font-extrabold text-slate-950">{formatCurrencyCOP(movement.balanceAfter)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

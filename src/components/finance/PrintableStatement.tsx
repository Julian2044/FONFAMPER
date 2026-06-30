import { formatCurrencyCOP, formatDate, formatDateTime, formatDocumentId } from "@/lib/fonfamper/format";
import { cn } from "@/lib/utils";
import type { AccountStatement, AccountStatementMovement } from "@/lib/fonfamper/statement-data";

type PrintableStatementProps = {
  statement: AccountStatement;
  generatedAt: string;
};

type PrintableStatementErrorProps = {
  title?: string;
  errors: string[];
};

const movementLabels: Record<AccountStatementMovement["movementType"], string> = {
  SALDO_INICIAL: "Saldo inicial",
  APORTE: "Aporte",
  RETIRO: "Retiro",
  AJUSTE: "Ajuste"
};

function movementValueClass(type: AccountStatementMovement["movementType"]) {
  if (type === "RETIRO") return "text-red-700";
  if (type === "APORTE" || type === "AJUSTE") return "text-emerald-700";
  return "text-slate-800";
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

function PrintStyles() {
  return (
    <style>
      {`
        @page {
          size: letter;
          margin: 14mm;
        }

        @media print {
          html,
          body {
            background: #ffffff !important;
            color: #111827 !important;
          }

          aside,
          header.sticky,
          nav.fixed,
          .print-actions {
            display: none !important;
          }

          body > div > div {
            padding-left: 0 !important;
          }

          main {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .statement-print-shell {
            margin: 0 !important;
            padding: 0 !important;
          }

          .statement-print-page {
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            margin: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          .statement-print-table {
            display: block !important;
            overflow: visible !important;
          }

          .statement-print-mobile-cards {
            display: none !important;
          }

          .statement-print-table table {
            min-width: 0 !important;
            width: 100% !important;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          tr,
          .statement-print-summary-item,
          .statement-print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}
    </style>
  );
}

export function PrintableStatementError({ title = "No se pudo generar el estado de cuenta", errors }: PrintableStatementErrorProps) {
  return (
    <div className="statement-print-shell min-w-0 py-4 sm:py-6">
      <PrintStyles />
      <div className="statement-print-page mx-auto max-w-[8.5in] rounded-xl border border-red-100 bg-white p-6 text-red-800 shadow-soft sm:p-10">
        <h1 className="text-2xl font-extrabold text-red-900">{title}</h1>
        <div className="mt-4 space-y-2 text-sm font-semibold">
          {errors.length > 0 ? errors.map((error) => <p key={error}>{error}</p>) : <p>Revisa los filtros e intenta nuevamente.</p>}
        </div>
      </div>
    </div>
  );
}

export function PrintableStatement({ statement, generatedAt }: PrintableStatementProps) {
  const summaryItems = [
    ["Saldo anterior", formatCurrencyCOP(statement.previousBalance)],
    ["Total aportes", formatCurrencyCOP(statement.totalContributions)],
    ["Total retiros", formatCurrencyCOP(statement.totalWithdrawals)],
    ["Total ajustes", formatCurrencyCOP(statement.totalAdjustments)],
    ["Saldo final", formatCurrencyCOP(statement.finalBalance)],
    ["Movimientos", String(statement.movementCount)]
  ] as const;

  const identityItems: Array<readonly [string, string]> = [
    ["Nombre del usuario", statement.profile.full_name],
    ["Número de cuenta", statement.account.account_number ?? "No registrado"],
    ["Periodo", statement.period.label],
    ["Fecha de generación", formatDateTime(generatedAt)]
  ];

  if (statement.profile.document_id) {
    identityItems.splice(1, 0, ["Documento", formatDocumentId(statement.profile.document_id)]);
  }

  return (
    <div className="statement-print-shell min-w-0 py-4 sm:py-6">
      <PrintStyles />
      <div className="print-actions mx-auto mb-4 flex max-w-[8.5in] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500">Vista imprimible del estado de cuenta</p>
      </div>

      <article className="statement-print-page mx-auto max-w-[8.5in] rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-soft sm:p-10">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-extrabold tracking-normal text-[#062B5F]">FONFAMPER</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Fondo de Ahorro Familiar</p>
            </div>
            <div className="text-left sm:text-right">
              <h1 className="text-3xl font-extrabold text-slate-950">Estado de cuenta</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">{statement.period.label}</p>
            </div>
          </div>
        </div>

        <section className="statement-print-section mt-6 grid gap-4 md:grid-cols-2">
          {identityItems.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 break-words text-sm font-extrabold text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="statement-print-section mt-6">
          <h2 className="text-lg font-extrabold text-slate-950">Resumen financiero</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summaryItems.map(([label, value]) => (
              <div
                key={label}
                className={cn(
                  "statement-print-summary-item min-w-0 rounded-lg border p-4",
                  label === "Saldo final" ? "border-blue-100 bg-blue-50 text-[#062B5F]" : "border-slate-200 bg-white"
                )}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 break-words text-lg font-extrabold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="statement-print-section mt-8">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">Movimientos del periodo</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{statement.movementCount} movimientos</p>
            </div>
          </div>

          {statement.movements.length > 0 ? (
            <>
              <div className="statement-print-mobile-cards space-y-3 md:hidden">
                {statement.movements.map((movement) => (
                  <div key={movement.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-extrabold text-slate-950">{movement.concept}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(movement.movementDate)}</p>
                      </div>
                      <p className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{movementLabels[movement.movementType]}</p>
                    </div>
                    <p className="mt-3 break-words text-sm text-slate-600">{movement.description || "Sin descripción"}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-400">Valor</p>
                        <p className={cn("mt-1 whitespace-nowrap font-extrabold", movementValueClass(movement.movementType))}>{formatMovementAmount(movement)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Saldo después</p>
                        <p className="mt-1 whitespace-nowrap font-extrabold text-slate-950">{formatCurrencyCOP(movement.balanceAfter)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="statement-print-table hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                <table className="min-w-[760px] w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] uppercase text-slate-600">
                    <tr>
                      <th className="w-[12%] px-3 py-3 font-extrabold">Fecha</th>
                      <th className="w-[13%] px-3 py-3 font-extrabold">Tipo</th>
                      <th className="w-[19%] px-3 py-3 font-extrabold">Concepto</th>
                      <th className="w-[26%] px-3 py-3 font-extrabold">Descripción</th>
                      <th className="w-[15%] px-3 py-3 text-right font-extrabold">Valor</th>
                      <th className="w-[15%] px-3 py-3 text-right font-extrabold">Saldo después</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {statement.movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="whitespace-nowrap px-3 py-3 align-top font-semibold text-slate-700">{formatDate(movement.movementDate)}</td>
                        <td className="px-3 py-3 align-top font-semibold text-slate-700">{movementLabels[movement.movementType]}</td>
                        <td className="break-words px-3 py-3 align-top font-semibold text-slate-950">{movement.concept}</td>
                        <td className="break-words px-3 py-3 align-top text-slate-700">{movement.description || "Sin descripción"}</td>
                        <td className={cn("whitespace-nowrap px-3 py-3 text-right align-top font-extrabold", movementValueClass(movement.movementType))}>
                          {formatMovementAmount(movement)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right align-top font-extrabold text-slate-950">{formatCurrencyCOP(movement.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">No hay movimientos en este periodo.</p>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold leading-5 text-slate-500">Este estado de cuenta fue generado desde la información registrada en FONFAMPER.</p>
        </footer>
      </article>
    </div>
  );
}

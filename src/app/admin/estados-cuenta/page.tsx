import Link from "next/link";
import { FileText, Printer, Search } from "lucide-react";
import { StatementMovementList } from "@/components/finance/StatementMovementList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrencyCOP } from "@/lib/fonfamper/format";
import { getAdminStatementForProfile, getAdminStatementProfiles, type StatementResult } from "@/lib/fonfamper/statement-data";

export const dynamic = "force-dynamic";

type AdminStatementsPageProps = {
  searchParams?: {
    profileId?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  };
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function emptyStatementResult(): StatementResult {
  return {
    statement: null,
    errors: []
  };
}

export default async function AdminStatementsPage({ searchParams }: AdminStatementsPageProps) {
  const profileId = getSearchValue(searchParams?.profileId);
  const startDate = getSearchValue(searchParams?.startDate);
  const endDate = getSearchValue(searchParams?.endDate);
  const hasFilters = Boolean(profileId || startDate || endDate);

  const [profilesResult, statementResult] = await Promise.all([
    getAdminStatementProfiles(),
    hasFilters ? getAdminStatementForProfile(profileId || undefined, { startDate, endDate }) : Promise.resolve(emptyStatementResult())
  ]);
  const statement = statementResult.statement;
  const pdfHref = statement
    ? `/api/admin/estados-cuenta/pdf?profileId=${encodeURIComponent(profileId)}&from=${encodeURIComponent(statement.period.startDate)}&to=${encodeURIComponent(statement.period.endDate)}`
    : null;

  const summaryItems = statement
    ? [
        ["Nombre del usuario", statement.profile.full_name],
        ["Número de cuenta", statement.account.account_number ?? "No registrado"],
        ["Periodo", statement.period.label],
        ["Saldo anterior", formatCurrencyCOP(statement.previousBalance)],
        ["Total aportes", formatCurrencyCOP(statement.totalContributions)],
        ["Total retiros", formatCurrencyCOP(statement.totalWithdrawals)],
        ["Total ajustes", formatCurrencyCOP(statement.totalAdjustments)],
        ["Saldo final", formatCurrencyCOP(statement.finalBalance)],
        ["Movimientos", String(statement.movementCount)]
      ]
    : [];

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Estados de cuenta</h2>
        <p className="mt-2 text-base text-slate-500">Consulta estados de cuenta generados desde cuentas y movimientos reales.</p>
      </div>

      {profilesResult.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">{profilesResult.error}</p>
        </Card>
      ) : null}

      <Card className="min-w-0">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end" method="GET">
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Usuario</span>
            <Select name="profileId" defaultValue={profileId} required>
              <option value="">Selecciona un usuario con cuenta</option>
              {profilesResult.profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName} - {profile.accountNumber ?? "Sin número"}
                </option>
              ))}
            </Select>
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Fecha inicial</span>
            <Input name="startDate" type="date" defaultValue={startDate} required />
          </label>
          <label className="min-w-0">
            <span className="mb-2 block text-sm font-bold text-slate-700">Fecha final</span>
            <Input name="endDate" type="date" defaultValue={endDate} required />
          </label>
          <Button className="w-full lg:w-auto" type="submit">
            <Search className="h-4 w-4" />
            Consultar
          </Button>
        </form>
        <div className="mt-4 flex justify-end">
          {pdfHref ? (
            <Link
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#004aad] ring-1 ring-[#0057d9]/25 transition hover:bg-blue-50 sm:w-auto"
              download
              href={pdfHref}
            >
              <Printer className="h-4 w-4" />
              Generar PDF
            </Link>
          ) : (
            <Button className="w-full sm:w-auto" disabled type="button" variant="secondary">
              <Printer className="h-4 w-4" />
              Generar PDF
            </Button>
          )}
        </div>
      </Card>

      {profilesResult.profiles.length === 0 ? (
        <Card className="border-slate-200 bg-slate-50 text-slate-600">
          <p className="text-sm font-semibold">No hay perfiles con cuenta de ahorro disponibles.</p>
        </Card>
      ) : null}

      {hasFilters && statementResult.errors.length > 0 ? (
        <Card className="border-red-200 bg-red-50 text-red-800">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1 text-sm font-semibold">
              {statementResult.errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      {!hasFilters ? (
        <Card className="border-blue-100 bg-blue-50 text-[#062B5F]">
          <p className="text-sm font-semibold">Selecciona un usuario con cuenta y un rango de fechas para consultar el estado de cuenta.</p>
        </Card>
      ) : null}

      {statement ? (
        <>
          <Card className="min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold text-slate-950">Resumen del estado de cuenta</h3>
                <p className="mt-1 break-words text-sm font-semibold text-slate-500">{statement.profile.full_name}</p>
              </div>
              <div className="min-w-0 rounded-xl bg-blue-50 px-4 py-3 text-[#062B5F]">
                <p className="text-xs font-bold uppercase">Saldo final</p>
                <p className="mt-1 break-words text-xl font-extrabold">{formatCurrencyCOP(statement.finalBalance)}</p>
              </div>
            </div>

            <dl className="mt-6 grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map(([label, value]) => (
                <div key={label} className="min-w-0 border-t border-slate-100 pt-4">
                  <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
                  <dd className="mt-2 break-words text-base font-extrabold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="min-w-0">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Movimientos del periodo</h3>
                <p className="mt-1 text-sm text-slate-500">{statement.period.label}</p>
              </div>
              <p className="text-sm font-bold text-slate-500">{statement.movementCount} movimientos</p>
            </div>
            <StatementMovementList movements={statement.movements} />
          </Card>
        </>
      ) : null}
    </div>
  );
}

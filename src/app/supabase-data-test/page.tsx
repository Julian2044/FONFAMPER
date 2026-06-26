import { createClientServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type QueryError = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN" | "AHORRADOR";
  status: string;
};

type AccountRow = {
  id: string;
  initial_balance: number;
  current_balance: number;
  total_contributions: number;
  total_withdrawals: number;
  total_utilities: number;
};

type MovementRow = {
  id: string;
  movement_date: string;
  movement_type: string;
  concept: string;
  amount: number;
  balance_after: number;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

type AuditRow = {
  id: string;
};

function toText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatError(error: QueryError | null | undefined) {
  if (!error) return null;

  return {
    message: toText(error.message),
    code: toText(error.code),
    details: toText(error.details),
    hint: toText(error.hint)
  };
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function DiagnosticCard({
  title,
  status,
  count,
  message,
  error
}: {
  title: string;
  status: string;
  count?: number;
  message?: string;
  error?: ReturnType<typeof formatError>;
}) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0057D7]">{title}</p>
          <p className="mt-2 text-lg font-extrabold text-slate-950">{status}</p>
        </div>
        {typeof count === "number" ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-[#004AAD] ring-1 ring-blue-100">{count}</span>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      {error ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-bold text-slate-950">Error técnico</p>
          <div className="mt-2 space-y-2 break-words">
            <p><span className="font-semibold">message:</span> {error.message || "-"}</p>
            <p><span className="font-semibold">code:</span> {error.code || "-"}</p>
            <p><span className="font-semibold">details:</span> {error.details || "-"}</p>
            <p><span className="font-semibold">hint:</span> {error.hint || "-"}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default async function SupabaseDataTestPage() {
  const supabase = createClientServer();
  const email = "camilo.perez@email.com";

  const profileResponse = await supabase
    .schema("public")
    .from("profiles")
    .select("id, full_name, email, role, status")
    .eq("email", email)
    .maybeSingle<ProfileRow>();

  const profileError = formatError(profileResponse.error);
  const profileRow = profileResponse.data;
  const profileData: ProfileRow = profileRow ?? {
    id: "",
    full_name: "Camilo Perez",
    email,
    role: "AHORRADOR",
    status: "N/A"
  };
  const profileFound = Boolean(profileRow);
  const profileId = profileRow?.id ?? null;

  let accountResponse:
    | {
        data: AccountRow | null;
        error: QueryError | null;
        count: number | null;
      }
    | undefined;
  let movementsResponse:
    | {
        data: MovementRow[] | null;
        error: QueryError | null;
        count: number | null;
      }
    | undefined;
  let notificationsResponse:
    | {
        data: NotificationRow[] | null;
        error: QueryError | null;
        count: number | null;
      }
    | undefined;
  let auditResponse:
    | {
        data: AuditRow[] | null;
        error: QueryError | null;
        count: number | null;
      }
    | undefined;

  if (profileId) {
    const [account, movements, notifications, audits] = await Promise.all([
      supabase
        .schema("public")
        .from("accounts")
        .select("id, initial_balance, current_balance, total_contributions, total_withdrawals, total_utilities", { count: "exact" })
        .eq("profile_id", profileId)
        .maybeSingle<AccountRow>(),
      supabase
        .schema("public")
        .from("movements")
        .select("id, movement_date, movement_type, concept, amount, balance_after", { count: "exact" })
        .eq("profile_id", profileId)
        .order("movement_date", { ascending: true }),
      supabase
        .schema("public")
        .from("notifications")
        .select("id, title, body, is_read, created_at", { count: "exact" })
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false }),
      supabase.schema("public").from("audit_logs").select("id", { count: "exact" })
    ]);

    accountResponse = account;
    movementsResponse = movements;
    notificationsResponse = notifications;
    auditResponse = audits;
  }

  const accountError = formatError(accountResponse?.error);
  const movementsError = formatError(movementsResponse?.error);
  const notificationsError = formatError(notificationsResponse?.error);
  const auditError = formatError(auditResponse?.error);

  const accountCount = accountResponse?.count ?? 0;
  const movementsCount = movementsResponse?.count ?? 0;
  const notificationsCount = notificationsResponse?.count ?? 0;
  const auditCount = auditResponse?.count ?? 0;

  const movements = movementsResponse?.data ?? [];
  const notifications = notificationsResponse?.data ?? [];
  const account = accountResponse?.data ?? null;

  const connectionStatus =
    profileError || accountError || movementsError || notificationsError || auditError
      ? "Se detectaron problemas en una o más consultas"
      : "Lectura Supabase verificada";

  const foundMessage = !profileFound
    ? "No se encontró Camilo Perez. Puede ser que no exista o que RLS esté bloqueando la lectura."
    : null;

  const rlsMessage = !profileFound && !profileError
    ? "La consulta no devolvió datos. Revisa policies RLS demo para lectura anon."
    : null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-[#0057D7]">FONFAMPER</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Lectura Supabase</h1>
          <p className="mt-3 text-base text-slate-600">Datos reales cargados correctamente o con diagnóstico visible.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DiagnosticCard
            title="Conexión"
            status={connectionStatus}
            message="Esta página consulta Supabase con el cliente server existente y muestra el estado real de cada lectura."
          />
          <DiagnosticCard
            title="Profiles"
            status={profileFound ? "Consulta exitosa" : "Sin datos"}
            count={profileRow ? 1 : profileResponse.count ?? 0}
            message={profileFound ? `Se encontró ${profileRow?.full_name ?? "Camilo Perez"}` : foundMessage ?? rlsMessage ?? "No hay respuesta visible para profiles."}
            error={profileError}
          />
          <DiagnosticCard
            title="Account"
            status={account ? "Consulta exitosa" : "Sin datos"}
            count={accountCount}
            message={account ? "Cuenta principal localizada." : profileId ? "No se devolvió una cuenta para Camilo Perez." : "Sin profile_id para consultar la cuenta."}
            error={accountError}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DiagnosticCard
            title="Movements"
            status={movementsCount > 0 ? "Consulta exitosa" : "Sin datos"}
            count={movementsCount}
            message={
              movementsError
                ? "Hubo un error al leer movements."
                : movementsCount > 0
                  ? `Se devolvieron ${movementsCount} movimientos.`
                  : profileId
                    ? "La consulta no devolvió datos. Revisa policies RLS demo para lectura anon."
                    : "Sin profile_id para consultar movimientos."
            }
            error={movementsError}
          />
          <DiagnosticCard
            title="Notifications"
            status={notificationsCount > 0 ? "Consulta exitosa" : "Sin datos"}
            count={notificationsCount}
            message={
              notificationsError
                ? "Hubo un error al leer notifications."
                : notificationsCount > 0
                  ? `Se devolvieron ${notificationsCount} notificaciones.`
                  : profileId
                    ? "La consulta no devolvió datos. Revisa policies RLS demo para lectura anon."
                    : "Sin profile_id para consultar notificaciones."
            }
            error={notificationsError}
          />
        </div>

        <DiagnosticCard
          title="Audit logs"
          status={auditError ? "Error" : "Consulta exitosa"}
          count={auditCount}
          message={auditError ? "Hubo un error al leer audit_logs." : `Se encontraron ${auditCount} registros de auditoría.`}
          error={auditError}
        />

        {profileFound ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase text-slate-400">Nombre</p>
              <p className="mt-2 text-lg font-extrabold text-slate-950">{profileData.full_name}</p>
              <p className="mt-1 text-sm text-slate-500">{profileData.email}</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase text-slate-400">Rol</p>
              <p className="mt-2 text-lg font-extrabold text-slate-950">{profileData.role}</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
              <p className="mt-2 text-lg font-extrabold text-slate-950">{profileData.status}</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase text-slate-400">Cuenta</p>
              <p className="mt-2 text-lg font-extrabold text-slate-950">{account ? formatCOP(account.current_balance) : "Sin cuenta"}</p>
              <p className="mt-1 text-sm text-slate-500">Saldo actual</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase text-slate-400">Registros</p>
              <p className="mt-2 text-lg font-extrabold text-slate-950">{movementsCount + notificationsCount + auditCount}</p>
              <p className="mt-1 text-sm text-slate-500">Movimientos + notificaciones + auditorías</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-soft">
            <h2 className="text-lg font-extrabold text-slate-950">Movimientos de Camilo</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto max-w-full">
                <table className="min-w-max w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold">Fecha</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold">Tipo</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold">Concepto</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold">Monto</th>
                      <th className="whitespace-nowrap px-4 py-3 font-semibold">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(movement.movement_date)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{movement.movement_type}</td>
                        <td className="px-4 py-3 text-slate-700">{movement.concept}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{formatCOP(movement.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{formatCOP(movement.balance_after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-soft">
              <h2 className="text-lg font-extrabold text-slate-950">Notificaciones de Camilo</h2>
              <div className="mt-5 space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-extrabold text-slate-950">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{notification.body}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      {notification.is_read ? "Leída" : "No leída"} · {formatDate(notification.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-soft">
              <h2 className="text-lg font-extrabold text-slate-950">Notas de diagnóstico</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>No se usan .single() en esta página.</p>
                <p>Las lecturas de profile y account usan .maybeSingle().</p>
                <p>Movements, notifications y audit_logs usan arrays normales con conteo.</p>
                <p>{profileFound ? "Camilo Perez fue localizado." : "No se encontró Camilo Perez. Puede ser que no exista o que RLS esté bloqueando la lectura."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

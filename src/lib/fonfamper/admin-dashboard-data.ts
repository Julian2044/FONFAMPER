import { createClientServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/fonfamper/auth";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type MovementRow = Database["public"]["Tables"]["movements"]["Row"];

type QueryIssue = {
  message: string;
  code: string;
  details: string;
  hint: string;
};

export type AdminDashboardMovement = {
  id: string;
  profileId: string;
  profileName: string;
  movementType: MovementRow["movement_type"];
  concept: string;
  amount: number;
  balanceAfter: number;
  movementDate: string;
  createdAt: string;
};

export type AdminDashboardUserBalance = {
  profileId: string;
  fullName: string;
  role: ProfileRow["role"];
  currentBalance: number;
};

export type AdminDashboardUserAlert = {
  id: string;
  fullName: string;
  email: string;
  role: ProfileRow["role"];
  status: string;
};

export type AdminDashboardBalancePoint = {
  date: string;
  period: string;
  totalAdministrado: number;
};

export type AdminDashboardData = {
  metrics: {
    totalAhorrado: number;
    totalAportes: number;
    totalRetiros: number;
    totalUtilidades: number;
    totalUsuarios: number;
    usuariosActivos: number;
    usuariosInactivos: number;
    usuariosBloqueados: number;
    accesosPendientes: number;
    accesosActivos: number;
    usuariosConCuenta: number;
    usuariosSinCuenta: number;
  };
  monthMetrics: {
    monthStart: string;
    nextMonthStart: string;
    aportesMes: number;
    retirosMes: number;
    ajustesMes: number;
    movimientosMes: number;
  };
  latestMovements: AdminDashboardMovement[];
  topUsuariosPorSaldo: AdminDashboardUserBalance[];
  accesosPendientesLista: AdminDashboardUserAlert[];
  usuariosBloqueadosLista: AdminDashboardUserAlert[];
  usuariosSinCuentaLista: AdminDashboardUserAlert[];
  fundEvolution: AdminDashboardBalancePoint[];
  error: string | null;
};

function toIssue(error: unknown): QueryIssue | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const value = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };

  return {
    message: value.message ? String(value.message) : "",
    code: value.code ? String(value.code) : "",
    details: value.details ? String(value.details) : "",
    hint: value.hint ? String(value.hint) : ""
  };
}

function issuesToMessage(issues: Array<QueryIssue | null>) {
  return issues
    .filter(Boolean)
    .map((issue) => issue?.message || issue?.code || issue?.details || issue?.hint)
    .filter(Boolean)
    .join(" | ");
}

function formatDateOnly(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function getBogotaCurrentMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric"
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value ?? new Date().getFullYear());
  const month = Number(parts.find((part) => part.type === "month")?.value ?? new Date().getMonth() + 1);

  return { year, month };
}

function getBogotaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric"
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? String(new Date().getFullYear());
  const month = parts.find((part) => part.type === "month")?.value ?? String(new Date().getMonth() + 1).padStart(2, "0");
  const day = parts.find((part) => part.type === "day")?.value ?? String(new Date().getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonthRange() {
  const { year, month } = getBogotaCurrentMonth();
  const start = new Date(year, month - 1, 1);
  const nextStart = new Date(year, month, 1);

  return {
    monthStart: formatDateOnly(start),
    nextMonthStart: formatDateOnly(nextStart)
  };
}

function normalizeStatus(status: string | null | undefined) {
  return String(status ?? "").trim().toUpperCase();
}

function buildUserAlert(profile: ProfileRow): AdminDashboardUserAlert {
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    status: profile.status
  };
}

function buildMovementRows(movements: MovementRow[], profilesById: Map<string, ProfileRow>): AdminDashboardMovement[] {
  return movements.map((movement) => ({
    id: movement.id,
    profileId: movement.profile_id,
    profileName: profilesById.get(movement.profile_id)?.full_name ?? "No registrado",
    movementType: movement.movement_type,
    concept: movement.concept,
    amount: Number(movement.amount ?? 0),
    balanceAfter: Number(movement.balance_after ?? 0),
    movementDate: movement.movement_date,
    createdAt: movement.created_at
  }));
}

function numericValue(value: number | null | undefined) {
  const numeric = Number(value ?? 0);

  return Number.isFinite(numeric) ? numeric : 0;
}

function totalKnownBalances(balancesByProfileId: Map<string, number>) {
  return Array.from(balancesByProfileId.values()).reduce((total, balance) => total + balance, 0);
}

function buildFundEvolution(accounts: AccountRow[], movements: MovementRow[]): AdminDashboardBalancePoint[] {
  if (accounts.length === 0 && movements.length === 0) {
    return [];
  }

  const movementProfileIds = new Set(movements.map((movement) => movement.profile_id));
  const balancesByProfileId = new Map<string, number>();

  accounts.forEach((account) => {
    const initialBalance = numericValue(account.initial_balance);
    const currentBalance = numericValue(account.current_balance);
    const startingBalance = movementProfileIds.has(account.profile_id) ? initialBalance : currentBalance || initialBalance;

    balancesByProfileId.set(account.profile_id, startingBalance);
  });

  if (movements.length === 0) {
    const today = getBogotaToday();

    return [
      {
        date: today,
        period: today,
        totalAdministrado: totalKnownBalances(balancesByProfileId)
      }
    ];
  }

  const pointsByDate = new Map<string, AdminDashboardBalancePoint>();
  const orderedMovements = movements.slice().sort((left, right) => {
    const dateComparison = left.movement_date.localeCompare(right.movement_date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return left.created_at.localeCompare(right.created_at);
  });

  orderedMovements.forEach((movement) => {
    balancesByProfileId.set(movement.profile_id, numericValue(movement.balance_after));

    pointsByDate.set(movement.movement_date, {
      date: movement.movement_date,
      period: movement.movement_date,
      totalAdministrado: totalKnownBalances(balancesByProfileId)
    });
  });

  return Array.from(pointsByDate.values()).sort((left, right) => left.date.localeCompare(right.date));
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || currentProfile.role !== "ADMIN" || normalizeStatus(currentProfile.status) !== "ACTIVO") {
    return {
      metrics: {
        totalAhorrado: 0,
        totalAportes: 0,
        totalRetiros: 0,
        totalUtilidades: 0,
        totalUsuarios: 0,
        usuariosActivos: 0,
        usuariosInactivos: 0,
        usuariosBloqueados: 0,
        accesosPendientes: 0,
        accesosActivos: 0,
        usuariosConCuenta: 0,
        usuariosSinCuenta: 0
      },
      monthMetrics: {
        monthStart: "",
        nextMonthStart: "",
        aportesMes: 0,
        retirosMes: 0,
        ajustesMes: 0,
        movimientosMes: 0
      },
      latestMovements: [],
      topUsuariosPorSaldo: [],
      accesosPendientesLista: [],
      usuariosBloqueadosLista: [],
      usuariosSinCuentaLista: [],
      fundEvolution: [],
      error: "Solo un administrador activo puede consultar el dashboard."
    };
  }

  const supabase = createClientServer();
  const { monthStart, nextMonthStart } = getCurrentMonthRange();
  const [profilesResponse, accountsResponse, monthMovementsResponse, latestMovementsResponse, evolutionMovementsResponse] = await Promise.all([
    supabase.schema("public").from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.schema("public").from("accounts").select("*").order("current_balance", { ascending: false }),
    supabase
      .schema("public")
      .from("movements")
      .select("*")
      .gte("movement_date", monthStart)
      .lt("movement_date", nextMonthStart)
      .order("movement_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .schema("public")
      .from("movements")
      .select("*")
      .order("movement_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .schema("public")
      .from("movements")
      .select("*")
      .order("movement_date", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  const profileIssue = toIssue(profilesResponse.error);
  const accountIssue = toIssue(accountsResponse.error);
  const monthMovementIssue = toIssue(monthMovementsResponse.error);
  const latestMovementIssue = toIssue(latestMovementsResponse.error);
  const evolutionMovementIssue = toIssue(evolutionMovementsResponse.error);

  if (profileIssue) console.error("[admin-dashboard-data] profiles", profilesResponse.error);
  if (accountIssue) console.error("[admin-dashboard-data] accounts", accountsResponse.error);
  if (monthMovementIssue) console.error("[admin-dashboard-data] month movements", monthMovementsResponse.error);
  if (latestMovementIssue) console.error("[admin-dashboard-data] latest movements", latestMovementsResponse.error);
  if (evolutionMovementIssue) console.error("[admin-dashboard-data] evolution movements", evolutionMovementsResponse.error);

  const profiles = profilesResponse.data ?? [];
  const accounts = accountsResponse.data ?? [];
  const monthMovements = monthMovementsResponse.data ?? [];
  const latestMovementsRaw = latestMovementsResponse.data ?? [];
  const evolutionMovements = evolutionMovementsResponse.data ?? [];
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const accountProfileIds = new Set(accounts.map((account) => account.profile_id));
  const pendingAccessUsers = profiles.filter((profile) => !profile.auth_user_id);
  const blockedUsers = profiles.filter((profile) => normalizeStatus(profile.status) === "BLOQUEADO");
  const usersWithoutAccount = profiles.filter((profile) => !accountProfileIds.has(profile.id));

  const metrics = {
    totalAhorrado: accounts.reduce((total, account) => total + Number(account.current_balance ?? 0), 0),
    totalAportes: accounts.reduce((total, account) => total + Number(account.total_contributions ?? 0), 0),
    totalRetiros: accounts.reduce((total, account) => total + Number(account.total_withdrawals ?? 0), 0),
    totalUtilidades: accounts.reduce((total, account) => total + Number(account.total_utilities ?? 0), 0),
    totalUsuarios: profiles.length,
    usuariosActivos: profiles.filter((profile) => normalizeStatus(profile.status) === "ACTIVO").length,
    usuariosInactivos: profiles.filter((profile) => normalizeStatus(profile.status) === "INACTIVO").length,
    usuariosBloqueados: blockedUsers.length,
    accesosPendientes: pendingAccessUsers.length,
    accesosActivos: profiles.filter((profile) => Boolean(profile.auth_user_id)).length,
    usuariosConCuenta: accountProfileIds.size,
    usuariosSinCuenta: usersWithoutAccount.length
  };

  const monthMetrics = {
    monthStart,
    nextMonthStart,
    aportesMes: monthMovements
      .filter((movement) => movement.movement_type === "APORTE")
      .reduce((total, movement) => total + Number(movement.amount ?? 0), 0),
    retirosMes: monthMovements
      .filter((movement) => movement.movement_type === "RETIRO")
      .reduce((total, movement) => total + Number(movement.amount ?? 0), 0),
    ajustesMes: monthMovements
      .filter((movement) => movement.movement_type === "AJUSTE")
      .reduce((total, movement) => total + Number(movement.amount ?? 0), 0),
    movimientosMes: monthMovements.length
  };

  const topUsuariosPorSaldo = accounts.slice(0, 5).map((account: AccountRow) => {
    const profile = profilesById.get(account.profile_id);

    return {
      profileId: account.profile_id,
      fullName: profile?.full_name ?? "No registrado",
      role: profile?.role ?? "AHORRADOR",
      currentBalance: Number(account.current_balance ?? 0)
    };
  });

  return {
    metrics,
    monthMetrics,
    latestMovements: buildMovementRows(latestMovementsRaw, profilesById),
    topUsuariosPorSaldo,
    accesosPendientesLista: pendingAccessUsers.slice(0, 5).map(buildUserAlert),
    usuariosBloqueadosLista: blockedUsers.slice(0, 5).map(buildUserAlert),
    usuariosSinCuentaLista: usersWithoutAccount.slice(0, 5).map(buildUserAlert),
    fundEvolution: buildFundEvolution(accounts, evolutionMovements),
    error: issuesToMessage([profileIssue, accountIssue, monthMovementIssue, latestMovementIssue, evolutionMovementIssue]) || null
  };
}

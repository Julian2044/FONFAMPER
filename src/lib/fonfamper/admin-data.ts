import { createClientServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/fonfamper/auth";
import type { Database, Json } from "@/lib/supabase/types";
import { formatDate } from "@/lib/fonfamper/format";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type MovementRow = Database["public"]["Tables"]["movements"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

type QueryIssue = {
  message: string;
  code: string;
  details: string;
  hint: string;
};

export type AdminUserData = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  documentId: string | null;
  role: ProfileRow["role"];
  status: string;
  createdAt: string;
  updatedAt: string;
  account: AccountRow | null;
  summary: {
    currentBalance: number;
    initialBalance: number;
    totalContributions: number;
    totalWithdrawals: number;
    totalUtilities: number;
  };
  recentMovements: AdminMovementData[];
  movementCount: number;
};

export type AdminMovementData = {
  id: string;
  profileId: string;
  profileName: string;
  profileRole: ProfileRow["role"] | "SYSTEM";
  accountId: string;
  createdBy: string | null;
  createdByName: string | null;
  movementType: MovementRow["movement_type"];
  concept: string;
  description: string | null;
  amount: number;
  balanceAfter: number;
  movementDate: string;
  createdAt: string;
};

export type AdminAuditLogData = {
  id: string;
  actorProfileId: string | null;
  actorName: string;
  module: string;
  action: string;
  description: string;
  status: string;
  metadata: Json;
  createdAt: string;
};

export type AdminMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalManagedBalance: number;
  totalContributions: number;
  totalWithdrawals: number;
  totalUtilities: number;
  pendingMovements: number;
  movementCount: number;
  auditCount: number;
};

export type AdminTimeline = {
  statementPeriodLabel: string;
  latestMovementDate: string | null;
  latestMovementMonthLabel: string;
  auditPeriodLabel: string;
  latestAuditDateTime: string | null;
  reportIssuedAt: string;
};

export type AdminUserProfile = AdminUserData;

export type DemoAdminData = {
  adminProfile: ProfileRow | null;
  users: AdminUserData[];
  accounts: AccountRow[];
  movements: AdminMovementData[];
  auditLogs: AdminAuditLogData[];
  metrics: AdminMetrics;
  timeline: AdminTimeline;
  monthlyActivity: Array<{
    month: string;
    value: number;
  }>;
  recentOperations: AdminMovementData[];
  recentAuditLogs: AdminAuditLogData[];
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

function parseDateValue(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function formatMonthYear(value: string | null | undefined) {
  const date = parseDateValue(value);
  if (!date) {
    return "No registrado";
  }

  const formatted = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric"
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatType(type: MovementRow["movement_type"]) {
  const labels: Record<MovementRow["movement_type"], AdminMovementData["movementType"]> = {
    SALDO_INICIAL: "SALDO_INICIAL",
    APORTE: "APORTE",
    RETIRO: "RETIRO",
    AJUSTE: "AJUSTE"
  };

  return labels[type] ?? "AJUSTE";
}

function getMonthIndex(dateValue: string) {
  const date = new Date(dateValue);
  return Number.isFinite(date.getTime()) ? date.getMonth() : 0;
}

function getDateTimestamp(dateValue: string) {
  const date = parseDateValue(dateValue);
  return date ? date.getTime() : 0;
}

function buildMonthTotals(movements: AdminMovementData[]) {
  const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const totals = new Array(12).fill(0);

  movements
    .filter((movement) => movement.movementType === "APORTE")
    .forEach((movement) => {
      totals[getMonthIndex(movement.movementDate)] += movement.amount;
    });

  return labels.map((month, index) => ({
    month,
    value: totals[index]
  }));
}

function buildMovementRows(
  movements: MovementRow[],
  profilesById: Map<string, ProfileRow>
): AdminMovementData[] {
  return movements.map((movement) => {
    const profile = profilesById.get(movement.profile_id);
    const createdBy = movement.created_by ? profilesById.get(movement.created_by) : null;

    return {
      id: movement.id,
      profileId: movement.profile_id,
      profileName: profile?.full_name ?? "No registrado",
      profileRole: profile?.role ?? "SYSTEM",
      accountId: movement.account_id,
      createdBy: movement.created_by,
      createdByName: createdBy?.full_name ?? null,
      movementType: formatType(movement.movement_type),
      concept: movement.concept,
      description: movement.description,
      amount: Number(movement.amount),
      balanceAfter: Number(movement.balance_after),
      movementDate: movement.movement_date,
      createdAt: movement.created_at
    };
  });
}

function buildUserRows(profiles: ProfileRow[], accounts: AccountRow[], movements: AdminMovementData[]): AdminUserData[] {
  const accountsByProfileId = new Map(accounts.map((account) => [account.profile_id, account]));

  return profiles.map((profile) => {
    const account = accountsByProfileId.get(profile.id) ?? null;
    const userMovements = movements.filter((movement) => movement.profileId === profile.id);

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      documentId: profile.document_id,
      role: profile.role,
      status: profile.status,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      account,
      summary: {
        currentBalance: Number(account?.current_balance ?? 0),
        initialBalance: Number(account?.initial_balance ?? 0),
        totalContributions: Number(account?.total_contributions ?? 0),
        totalWithdrawals: Number(account?.total_withdrawals ?? 0),
        totalUtilities: Number(account?.total_utilities ?? 0)
      },
      recentMovements: userMovements.slice(0, 3),
      movementCount: userMovements.length
    };
  });
}

function buildAuditRows(auditLogs: AuditLogRow[], profilesById: Map<string, ProfileRow>): AdminAuditLogData[] {
  return auditLogs.map((log) => {
    const actor = log.actor_profile_id ? profilesById.get(log.actor_profile_id) : null;

    return {
      id: log.id,
      actorProfileId: log.actor_profile_id,
      actorName: actor?.full_name ?? (log.actor_profile_id ? "No registrado" : "Sistema"),
      module: log.module,
      action: log.action,
      description: log.description,
      status: log.status,
      metadata: log.metadata,
      createdAt: log.created_at
    };
  });
}

export async function getDemoAdminData(): Promise<DemoAdminData> {
  const supabase = createClientServer();
  const currentProfile = await getCurrentProfile();

  const [profilesResponse, accountsResponse, movementsResponse, auditLogsResponse] = await Promise.all([
    supabase.schema("public").from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.schema("public").from("accounts").select("*").order("created_at", { ascending: false }),
    supabase.schema("public").from("movements").select("*").order("created_at", { ascending: false }),
    supabase.schema("public").from("audit_logs").select("*").order("created_at", { ascending: false })
  ]);

  const profileIssue = toIssue(profilesResponse.error);
  const accountIssue = toIssue(accountsResponse.error);
  const movementIssue = toIssue(movementsResponse.error);
  const auditIssue = toIssue(auditLogsResponse.error);

  if (profileIssue) console.error("[admin-data] profiles", profilesResponse.error);
  if (accountIssue) console.error("[admin-data] accounts", accountsResponse.error);
  if (movementIssue) console.error("[admin-data] movements", movementsResponse.error);
  if (auditIssue) console.error("[admin-data] audit_logs", auditLogsResponse.error);

  const profiles = profilesResponse.data ?? [];
  const accounts = accountsResponse.data ?? [];
  const movementsRaw = movementsResponse.data ?? [];
  const auditRaw = auditLogsResponse.data ?? [];
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const movements = buildMovementRows(movementsRaw, profilesById);
  const users = buildUserRows(profiles, accounts, movements);
  const auditLogs = buildAuditRows(auditRaw, profilesById);
  const adminProfile = currentProfile?.role === "ADMIN" ? currentProfile : profiles.find((profile) => profile.role === "ADMIN") ?? null;
  const activeUsers = users.filter((user) => user.status.toUpperCase() === "ACTIVO").length;
  const totalManagedBalance = accounts.reduce((total, account) => total + Number(account.current_balance ?? 0), 0);
  const totalContributions = accounts.reduce((total, account) => total + Number(account.total_contributions ?? 0), 0);
  const totalWithdrawals = accounts.reduce((total, account) => total + Number(account.total_withdrawals ?? 0), 0);
  const totalUtilities = accounts.reduce((total, account) => total + Number(account.total_utilities ?? 0), 0);
  const movementDates = movements.map((movement) => movement.movementDate).filter(Boolean).sort((left, right) => getDateTimestamp(left) - getDateTimestamp(right));
  const auditDates = auditLogs.map((log) => log.createdAt).filter(Boolean).sort((left, right) => getDateTimestamp(left) - getDateTimestamp(right));
  const firstMovementDate = movementDates[0] ?? null;
  const lastMovementDate = movementDates[movementDates.length - 1] ?? null;
  const lastAuditDate = auditDates[auditDates.length - 1] ?? null;
  const latestMovementMonthLabel = formatMonthYear(lastMovementDate);
  const statementPeriodLabel = firstMovementDate && lastMovementDate ? `${formatDate(firstMovementDate)} - ${formatDate(lastMovementDate)}` : "No registrado";
  const auditPeriodLabel = auditDates.length > 0 ? `${formatDate(auditDates[0])} - ${formatDate(auditDates[auditDates.length - 1])}` : "No registrado";
  const pendingMovements = 0;

  const metrics: AdminMetrics = {
    totalUsers: profiles.length,
    activeUsers,
    totalManagedBalance,
    totalContributions,
    totalWithdrawals,
    totalUtilities,
    pendingMovements,
    movementCount: movements.length,
    auditCount: auditLogs.length
  };

  const timeline: AdminTimeline = {
    statementPeriodLabel,
    latestMovementDate: lastMovementDate,
    latestMovementMonthLabel,
    auditPeriodLabel,
    latestAuditDateTime: lastAuditDate,
    reportIssuedAt: new Date().toISOString()
  };

  const error = issuesToMessage([profileIssue, accountIssue, movementIssue, auditIssue]) || null;

  return {
    adminProfile,
    users,
    accounts,
    movements,
    auditLogs,
    metrics,
    timeline,
    monthlyActivity: buildMonthTotals(movements),
    recentOperations: movements.slice(0, 5),
    recentAuditLogs: auditLogs.slice(0, 5),
    error
  };
}

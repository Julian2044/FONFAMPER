import { createClientServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/fonfamper/auth";
import type { Database } from "@/lib/supabase/types";
import { formatDate } from "./format";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type MovementRow = Database["public"]["Tables"]["movements"]["Row"];
type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

type QueryIssue = {
  message: string;
  code: string;
  details: string;
  hint: string;
};

export type AhorradorMovement = {
  date: string;
  concept: string;
  type: "Saldo inicial" | "Aporte" | "Retiro" | "Ajuste" | "Utilidad";
  value: number;
  balance: number;
  status: "Completado";
  createdAt: string;
};

export type AhorradorNotification = {
  title: string;
  message: string;
  type: "Movimiento" | "Estado de cuenta" | "Seguridad" | "Perfil";
  isRead: boolean;
  href: string | null;
  createdAt: string;
};

export type DemoAhorradorData = {
  profile: ProfileRow | null;
  account: AccountRow | null;
  movements: AhorradorMovement[];
  notifications: AhorradorNotification[];
  unreadNotificationsCount: number;
  latestMovement: AhorradorMovement | null;
  totals: {
    currentBalance: number;
    initialBalance: number;
    totalContributions: number;
    totalWithdrawals: number;
    totalUtilities: number;
  };
  balanceHistory: Array<{
    period: string;
    balance: number;
  }>;
  error: string | null;
  issues: {
    profile: QueryIssue | null;
    account: QueryIssue | null;
    movements: QueryIssue | null;
    notifications: QueryIssue | null;
  };
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

function combineIssues(...issues: Array<QueryIssue | null>) {
  return issues.filter(Boolean) as QueryIssue[];
}

function issuesToMessage(issues: QueryIssue[]) {
  return issues
    .map((issue) => issue.message || issue.code || issue.details || issue.hint)
    .filter(Boolean)
    .join(" | ");
}

function mapMovement(movement: MovementRow): AhorradorMovement {
  const typeMap: Record<string, AhorradorMovement["type"]> = {
    SALDO_INICIAL: "Saldo inicial",
    APORTE: "Aporte",
    RETIRO: "Retiro",
    AJUSTE: "Ajuste"
  };

  return {
    date: movement.movement_date,
    concept: movement.concept,
    type: typeMap[movement.movement_type] ?? "Ajuste",
    value: Number(movement.amount),
    balance: Number(movement.balance_after),
    status: "Completado",
    createdAt: movement.created_at
  };
}

function mapNotification(notification: NotificationRow): AhorradorNotification {
  const typeMap: Record<string, AhorradorNotification["type"]> = {
    MOVIMIENTO: "Movimiento",
    ESTADO_CUENTA: "Estado de cuenta",
    SEGURIDAD: "Seguridad",
    PERFIL: "Perfil"
  };

  return {
    title: notification.title,
    message: notification.body,
    type: typeMap[notification.notification_type] ?? "Movimiento",
    isRead: notification.is_read,
    href: notification.action_href,
    createdAt: notification.created_at
  };
}

export async function getDemoAhorradorData(): Promise<DemoAhorradorData> {
  const supabase = createClientServer();
  const currentProfile = await getCurrentProfile();

  if (!currentProfile) {
    const profileError = {
      message: "No se encontró el perfil autenticado del ahorrador.",
      code: "",
      details: "",
      hint: ""
    };

    return {
      profile: null,
      account: null,
      movements: [],
      notifications: [],
      unreadNotificationsCount: 0,
      latestMovement: null,
      totals: {
        currentBalance: 0,
        initialBalance: 0,
        totalContributions: 0,
        totalWithdrawals: 0,
        totalUtilities: 0
      },
      balanceHistory: [],
      error: profileError.message,
      issues: {
        profile: profileError,
        account: null,
        movements: null,
        notifications: null
      }
    };
  }

  const profile = currentProfile;
  const profileIssue: QueryIssue | null = null;

  const [accountResponse, movementsResponse, notificationsResponse] = await Promise.all([
    supabase
      .schema("public")
      .from("accounts")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle<AccountRow>(),
    supabase
      .schema("public")
      .from("movements")
      .select("*")
      .eq("profile_id", profile.id)
      .order("movement_date", { ascending: false }),
    supabase
      .schema("public")
      .from("notifications")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
  ]);

  const accountIssue = toIssue(accountResponse.error);
  const movementsIssue = toIssue(movementsResponse.error);
  const notificationsIssue = toIssue(notificationsResponse.error);

  if (accountIssue) console.error("[ahorrador-data] accounts", accountResponse.error);
  if (movementsIssue) console.error("[ahorrador-data] movements", movementsResponse.error);
  if (notificationsIssue) console.error("[ahorrador-data] notifications", notificationsResponse.error);

  const movements = (movementsResponse.data ?? []).map(mapMovement);
  const notifications = (notificationsResponse.data ?? []).map(mapNotification);
  const latestMovement = movements[0] ?? null;
  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;
  const account = accountResponse.data ?? null;

  const balanceHistory = [
    account
      ? {
          period: "Saldo inicial",
          balance: Number(account.initial_balance)
        }
      : null,
    ...movements
      .slice()
      .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
      .map((movement) => ({
        period: formatDate(movement.date),
        balance: movement.balance
      }))
  ].filter(Boolean) as Array<{ period: string; balance: number }>;

  const issues = {
    profile: profileIssue,
    account: accountIssue,
    movements: movementsIssue,
    notifications: notificationsIssue
  };

  const joined = issuesToMessage(combineIssues(profileIssue, accountIssue, movementsIssue, notificationsIssue));

  return {
    profile,
    account,
    movements,
    notifications,
    unreadNotificationsCount,
    latestMovement,
    totals: {
      currentBalance: Number(account?.current_balance ?? 0),
      initialBalance: Number(account?.initial_balance ?? 0),
      totalContributions: Number(account?.total_contributions ?? 0),
      totalWithdrawals: Number(account?.total_withdrawals ?? 0),
      totalUtilities: Number(account?.total_utilities ?? 0)
    },
    balanceHistory,
    error: joined || null,
    issues
  };
}

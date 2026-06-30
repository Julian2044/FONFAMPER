import { createClientServer } from "@/lib/supabase/server";
import { getCurrentProfile, type AuthProfile } from "@/lib/fonfamper/auth";
import { formatDate } from "@/lib/fonfamper/format";
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

export type StatementDateRange = {
  startDate?: string;
  endDate?: string;
};

export type StatementProfileOption = {
  id: string;
  fullName: string;
  email: string;
  documentId: string | null;
  status: string;
  role: ProfileRow["role"];
  accountId: string;
  accountNumber: string | null;
};

export type AccountStatementMovement = {
  id: string;
  profileId: string;
  accountId: string;
  movementType: MovementRow["movement_type"];
  concept: string;
  description: string | null;
  amount: number;
  balanceAfter: number;
  movementDate: string;
  createdAt: string;
};

export type AccountStatement = {
  profile: ProfileRow;
  account: AccountRow;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  previousBalance: number;
  totalContributions: number;
  totalWithdrawals: number;
  totalAdjustments: number;
  finalBalance: number;
  movementCount: number;
  movements: AccountStatementMovement[];
};

export type StatementResult = {
  statement: AccountStatement | null;
  errors: string[];
};

export type AdminStatementProfilesResult = {
  profiles: StatementProfileOption[];
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

function issueToMessage(issue: QueryIssue | null, fallback: string) {
  return issue?.message || issue?.code || issue?.details || issue?.hint || fallback;
}

function parseDateOnly(value: string | undefined) {
  if (!value) return null;

  const input = value.trim();
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  const normalized = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");

  return normalized === input ? date : null;
}

function validateDateRange(range: StatementDateRange) {
  const errors: string[] = [];
  const startDate = range.startDate?.trim() ?? "";
  const endDate = range.endDate?.trim() ?? "";
  const parsedStart = parseDateOnly(startDate);
  const parsedEnd = parseDateOnly(endDate);

  if (!startDate) {
    errors.push("La fecha inicial es requerida.");
  } else if (!parsedStart) {
    errors.push("La fecha inicial no es válida.");
  }

  if (!endDate) {
    errors.push("La fecha final es requerida.");
  } else if (!parsedEnd) {
    errors.push("La fecha final no es válida.");
  }

  if (parsedStart && parsedEnd && parsedEnd.getTime() < parsedStart.getTime()) {
    errors.push("La fecha final no puede ser menor que la fecha inicial.");
  }

  return {
    errors,
    startDate,
    endDate
  };
}

function mapStatementMovement(movement: MovementRow): AccountStatementMovement {
  return {
    id: movement.id,
    profileId: movement.profile_id,
    accountId: movement.account_id,
    movementType: movement.movement_type,
    concept: movement.concept,
    description: movement.description,
    amount: Number(movement.amount ?? 0),
    balanceAfter: Number(movement.balance_after ?? 0),
    movementDate: movement.movement_date,
    createdAt: movement.created_at
  };
}

function canReadProfileStatement(viewer: AuthProfile, profileId: string) {
  if (viewer.role === "ADMIN") {
    return true;
  }

  return viewer.role === "AHORRADOR" && viewer.id === profileId;
}

async function getViewerProfile(viewerProfile?: AuthProfile | null) {
  if (viewerProfile !== undefined) {
    return viewerProfile;
  }

  return getCurrentProfile();
}

async function buildStatementForProfile(
  profileId: string,
  range: StatementDateRange,
  viewerProfile?: AuthProfile | null
): Promise<StatementResult> {
  const viewer = await getViewerProfile(viewerProfile);

  if (!viewer) {
    return {
      statement: null,
      errors: ["No se encontró un usuario autenticado."]
    };
  }

  if (!canReadProfileStatement(viewer, profileId)) {
    return {
      statement: null,
      errors: ["No tienes permiso para consultar este estado de cuenta."]
    };
  }

  const validation = validateDateRange(range);

  if (validation.errors.length > 0) {
    return {
      statement: null,
      errors: validation.errors
    };
  }

  const supabase = createClientServer();
  const [profileResponse, accountResponse] = await Promise.all([
    supabase.schema("public").from("profiles").select("*").eq("id", profileId).maybeSingle<ProfileRow>(),
    supabase.schema("public").from("accounts").select("*").eq("profile_id", profileId).maybeSingle<AccountRow>()
  ]);

  const profileIssue = toIssue(profileResponse.error);
  const accountIssue = toIssue(accountResponse.error);

  if (profileIssue) {
    console.error("[statement-data] profiles", profileResponse.error);
    return {
      statement: null,
      errors: [issueToMessage(profileIssue, "No se pudo cargar el perfil.")]
    };
  }

  if (accountIssue) {
    console.error("[statement-data] accounts", accountResponse.error);
    return {
      statement: null,
      errors: [issueToMessage(accountIssue, "No se pudo cargar la cuenta.")]
    };
  }

  const profile = profileResponse.data ?? null;
  const account = accountResponse.data ?? null;

  if (!profile) {
    return {
      statement: null,
      errors: ["El perfil seleccionado no existe."]
    };
  }

  if (!account) {
    return {
      statement: null,
      errors: ["El perfil seleccionado no tiene cuenta de ahorro."]
    };
  }

  const [previousMovementResponse, periodMovementsResponse] = await Promise.all([
    supabase
      .schema("public")
      .from("movements")
      .select("*")
      .eq("profile_id", profileId)
      .eq("account_id", account.id)
      .lt("movement_date", validation.startDate)
      .order("movement_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<MovementRow>(),
    supabase
      .schema("public")
      .from("movements")
      .select("*")
      .eq("profile_id", profileId)
      .eq("account_id", account.id)
      .gte("movement_date", validation.startDate)
      .lte("movement_date", validation.endDate)
      .order("movement_date", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  const previousIssue = toIssue(previousMovementResponse.error);
  const movementsIssue = toIssue(periodMovementsResponse.error);

  if (previousIssue) {
    console.error("[statement-data] previous movement", previousMovementResponse.error);
    return {
      statement: null,
      errors: [issueToMessage(previousIssue, "No se pudo calcular el saldo anterior.")]
    };
  }

  if (movementsIssue) {
    console.error("[statement-data] period movements", periodMovementsResponse.error);
    return {
      statement: null,
      errors: [issueToMessage(movementsIssue, "No se pudieron cargar los movimientos del periodo.")]
    };
  }

  const previousBalance = Number(previousMovementResponse.data?.balance_after ?? account.initial_balance ?? 0);
  const movements = (periodMovementsResponse.data ?? []).map(mapStatementMovement);
  const lastMovement = movements[movements.length - 1] ?? null;
  const finalBalance = lastMovement ? lastMovement.balanceAfter : previousBalance;
  const totalContributions = movements
    .filter((movement) => movement.movementType === "APORTE")
    .reduce((total, movement) => total + movement.amount, 0);
  const totalWithdrawals = movements
    .filter((movement) => movement.movementType === "RETIRO")
    .reduce((total, movement) => total + movement.amount, 0);
  const totalAdjustments = movements
    .filter((movement) => movement.movementType === "AJUSTE")
    .reduce((total, movement) => total + movement.amount, 0);

  return {
    statement: {
      profile,
      account,
      period: {
        startDate: validation.startDate,
        endDate: validation.endDate,
        label: `${formatDate(validation.startDate)} - ${formatDate(validation.endDate)}`
      },
      previousBalance,
      totalContributions,
      totalWithdrawals,
      totalAdjustments,
      finalBalance,
      movementCount: movements.length,
      movements
    },
    errors: []
  };
}

export async function getStatementForProfile(profileId: string, range: StatementDateRange): Promise<StatementResult> {
  if (!profileId) {
    return {
      statement: null,
      errors: ["Selecciona un usuario con cuenta para consultar el estado de cuenta."]
    };
  }

  return buildStatementForProfile(profileId, range);
}

export async function getCurrentUserStatement(range: StatementDateRange): Promise<StatementResult> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile) {
    return {
      statement: null,
      errors: ["No se encontró el perfil autenticado."]
    };
  }

  return buildStatementForProfile(currentProfile.id, range, currentProfile);
}

export async function getAdminStatementForProfile(profileId: string | undefined, range: StatementDateRange): Promise<StatementResult> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || currentProfile.role !== "ADMIN") {
    return {
      statement: null,
      errors: ["Solo un administrador puede consultar estados de cuenta de otros usuarios."]
    };
  }

  if (!profileId) {
    return {
      statement: null,
      errors: ["Selecciona un usuario con cuenta para consultar el estado de cuenta."]
    };
  }

  return buildStatementForProfile(profileId, range, currentProfile);
}

export async function getAdminStatementProfiles(): Promise<AdminStatementProfilesResult> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || currentProfile.role !== "ADMIN") {
    return {
      profiles: [],
      error: "Solo un administrador puede listar usuarios con cuenta."
    };
  }

  const supabase = createClientServer();
  const accountsResponse = await supabase.schema("public").from("accounts").select("*").order("created_at", { ascending: false });
  const accountIssue = toIssue(accountsResponse.error);

  if (accountIssue) {
    console.error("[statement-data] account options", accountsResponse.error);
    return {
      profiles: [],
      error: issueToMessage(accountIssue, "No se pudieron cargar las cuentas.")
    };
  }

  const accounts = accountsResponse.data ?? [];
  const profileIds = accounts.map((account) => account.profile_id);

  if (profileIds.length === 0) {
    return {
      profiles: [],
      error: null
    };
  }

  const profilesResponse = await supabase
    .schema("public")
    .from("profiles")
    .select("*")
    .in("id", profileIds)
    .order("full_name", { ascending: true });
  const profileIssue = toIssue(profilesResponse.error);

  if (profileIssue) {
    console.error("[statement-data] profile options", profilesResponse.error);
    return {
      profiles: [],
      error: issueToMessage(profileIssue, "No se pudieron cargar los perfiles con cuenta.")
    };
  }

  const accountsByProfileId = new Map(accounts.map((account) => [account.profile_id, account]));
  const profiles = (profilesResponse.data ?? [])
    .map((profile) => {
      const account = accountsByProfileId.get(profile.id);

      if (!account) {
        return null;
      }

      return {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        documentId: profile.document_id,
        status: profile.status,
        role: profile.role,
        accountId: account.id,
        accountNumber: account.account_number
      };
    })
    .filter(Boolean) as StatementProfileOption[];

  return {
    profiles,
    error: null
  };
}

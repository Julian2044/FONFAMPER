"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClientServer } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type MovementRow = Database["public"]["Tables"]["movements"]["Row"];
type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;
type ServerSupabaseClient = ReturnType<typeof createClientServer>;
type AuthUserSummary = {
  id: string;
  email?: string | null;
};

const PROTECTED_BASE_USER_EMAILS = new Set(["camilo.perez@email.com", "sonia.perez@email.com"]);

const ADMIN_REVALIDATION_PATHS = [
  "/admin/dashboard",
  "/admin/usuarios",
  "/admin/movimientos",
  "/admin/estados-cuenta",
  "/admin/utilidades",
  "/admin/reportes",
  "/admin/auditoria",
  "/admin/importaciones"
];

function redirectWithError(message: string): never {
  redirect(`/admin/usuarios?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(success: string, profileId: string): never {
  const query = new URLSearchParams({
    success,
    profile_id: profileId
  });

  redirect(`/admin/usuarios?${query.toString()}`);
}

function createAdminClientForAction() {
  try {
    return createSupabaseAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible inicializar el cliente admin de Supabase.";
    redirectWithError(message);
  }
}

function redirectWithAccessSuccess(profileId: string, temporaryPassword: string): never {
  const query = new URLSearchParams({
    success: "access_activated",
    profile_id: profileId,
    temporary_password: temporaryPassword
  });

  redirect(`/admin/usuarios?${query.toString()}`);
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value || null;
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function nullableDateValue(formData: FormData, key: string, label: string) {
  const value = textValue(formData, key);

  if (!value) {
    return null;
  }

  if (!isValidDateInput(value)) {
    redirectWithError(`${label} no es valida.`);
  }

  return value;
}

function parseAmount(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return 0;
  }

  const amount = Number(rawValue.replace(/[^\d]/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

function normalizeEmail(email: string | null | undefined) {
  return String(email ?? "").trim().toLowerCase();
}

function isProtectedBaseUser(email: string | null | undefined) {
  return PROTECTED_BASE_USER_EMAILS.has(normalizeEmail(email));
}

function numberValue(value: number | string | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function isAuthUserNotFoundError(error: unknown) {
  const value = error as { message?: unknown; name?: unknown; status?: unknown; code?: unknown };
  const raw = [value?.message, value?.name, value?.status, value?.code].filter(Boolean).join(" ").toLowerCase();

  return raw.includes("not found") || raw.includes("not_found") || raw.includes("404");
}

async function deleteAuthUser(adminSupabase: AdminSupabaseClient, authUserId: string, context: string) {
  const { error } = await adminSupabase.auth.admin.deleteUser(authUserId);

  if (error && !isAuthUserNotFoundError(error)) {
    console.error(`[admin-usuarios] ${context} delete auth user`, error);
    return error.message || "No fue posible eliminar el usuario en Supabase Auth.";
  }

  return null;
}

function getTestUserDeletionBlockReason(account: AccountRow | null, movements: MovementRow[]) {
  if (numberValue(account?.current_balance) > 0) {
    return "No se puede eliminar un usuario con saldo actual mayor a cero.";
  }

  if (
    numberValue(account?.initial_balance) > 0 ||
    numberValue(account?.total_contributions) > 0 ||
    numberValue(account?.total_withdrawals) > 0 ||
    numberValue(account?.total_utilities) > 0
  ) {
    return "No se puede eliminar un usuario con saldos acumulados o historial financiero.";
  }

  if (movements.some((movement) => movement.movement_type !== "SALDO_INICIAL")) {
    return "No se puede eliminar un usuario con movimientos reales diferentes de saldo inicial.";
  }

  if (movements.length > 1) {
    return "No se puede eliminar un usuario con multiples movimientos o historial financiero.";
  }

  if (movements.some((movement) => numberValue(movement.amount) > 0 || numberValue(movement.balance_after) > 0)) {
    return "No se puede eliminar un usuario con saldo inicial o saldo resultante mayor a cero.";
  }

  return null;
}

function generateTemporaryPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@$%*?";
  const allCharacters = `${letters}${numbers}${symbols}`;
  const requiredCharacters = [
    letters[randomInt(letters.length)],
    numbers[randomInt(numbers.length)],
    symbols[randomInt(symbols.length)]
  ];

  while (requiredCharacters.length < 14) {
    requiredCharacters.push(allCharacters[randomInt(allCharacters.length)]);
  }

  for (let index = requiredCharacters.length - 1; index > 0; index -= 1) {
    const targetIndex = randomInt(index + 1);
    [requiredCharacters[index], requiredCharacters[targetIndex]] = [requiredCharacters[targetIndex], requiredCharacters[index]];
  }

  return requiredCharacters.join("");
}

function isAdminActive(profile: ProfileRow | null): profile is ProfileRow {
  return profile?.role === "ADMIN" && String(profile.status ?? "").toUpperCase() === "ACTIVO";
}

async function getAuthenticatedUserForAction(actionLabel: string) {
  const supabase = createClientServer();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[admin-usuarios] get user", authError);
  }

  if (!user) {
    redirectWithError(`Debes iniciar sesion para ${actionLabel}.`);
  }

  return user;
}

async function requireActiveAdminProfile(adminSupabase: AdminSupabaseClient, authUserId: string, actionLabel: string) {
  const { data: adminProfile, error: adminProfileError } = await adminSupabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle<ProfileRow>();

  if (adminProfileError) {
    console.error("[admin-usuarios] current admin profile", adminProfileError);
    redirectWithError(adminProfileError.message || "No fue posible validar el perfil administrador.");
  }

  if (!isAdminActive(adminProfile)) {
    redirectWithError(`Solo un administrador activo puede ${actionLabel}.`);
  }

  return adminProfile;
}

async function requireActiveAdminProfileWithSession(supabase: ServerSupabaseClient, actionLabel: string) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[admin-usuarios] get user", authError);
  }

  if (!user) {
    redirectWithError(`Debes iniciar sesion para ${actionLabel}.`);
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (adminProfileError) {
    console.error("[admin-usuarios] current admin profile", adminProfileError);
    redirectWithError(adminProfileError.message || "No fue posible validar el perfil administrador.");
  }

  if (!isAdminActive(adminProfile)) {
    redirectWithError(`Solo un administrador activo puede ${actionLabel}.`);
  }

  return adminProfile;
}

async function findAuthUserByEmail(adminSupabase: AdminSupabaseClient, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (page <= 20) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      return { user: null, error };
    }

    const users = (data?.users ?? []) as AuthUserSummary[];
    const user = users.find((candidate) => candidate.email?.trim().toLowerCase() === normalizedEmail) ?? null;

    if (user || users.length < perPage) {
      return { user, error: null };
    }

    page += 1;
  }

  return { user: null, error: null };
}

export async function createInternalUserProfileAction(formData: FormData) {
  const adminSupabase = createAdminClientForAction();
  const currentUser = await getAuthenticatedUserForAction("crear usuarios");
  await requireActiveAdminProfile(adminSupabase, currentUser.id, "crear usuarios");

  const fullName = textValue(formData, "full_name");
  const email = textValue(formData, "email").toLowerCase();
  const role = textValue(formData, "role").toUpperCase();
  const phone = nullableTextValue(formData, "phone");
  const documentId = nullableTextValue(formData, "document_id");
  const createAccount = formData.get("create_account") === "on";
  const accountNumber = nullableTextValue(formData, "account_number");
  const initialBalance = createAccount ? parseAmount(formData.get("initial_balance")) : 0;
  const initialBalanceDate = createAccount ? nullableDateValue(formData, "initial_balance_date", "La fecha del saldo inicial") : null;

  if (!fullName) {
    redirectWithError("El nombre completo es obligatorio.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirectWithError("El correo electronico no es valido.");
  }

  if (!["ADMIN", "AHORRADOR"].includes(role)) {
    redirectWithError("Selecciona un rol valido.");
  }

  if (initialBalance === null || initialBalance < 0) {
    redirectWithError("El saldo inicial debe ser cero o mayor.");
  }

  if (createAccount && initialBalance > 0 && !initialBalanceDate) {
    redirectWithError("La fecha del saldo inicial es obligatoria cuando el saldo inicial es mayor a cero.");
  }

  const supabase = createClientServer();
  const { data, error } = await (supabase as any).rpc("create_internal_user_profile", {
    p_full_name: fullName,
    p_email: email,
    p_role: role,
    p_phone: phone,
    p_document_id: documentId,
    p_create_account: createAccount,
    p_account_number: createAccount ? accountNumber : null,
    p_initial_balance: initialBalance,
    p_initial_balance_date: initialBalanceDate
  });

  if (error) {
    console.error("[admin-usuarios] create_internal_user_profile", error);
    redirectWithError(error.message || "No fue posible crear el usuario.");
  }

  ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));

  const profileId = typeof data === "object" && data && "profile_id" in data ? String((data as { profile_id?: unknown }).profile_id ?? "") : "";
  const successQuery = profileId ? `success=user_created&profile_id=${encodeURIComponent(profileId)}` : "success=user_created";
  redirect(`/admin/usuarios?${successQuery}`);
}

export async function updateInternalUserAction(formData: FormData) {
  const supabase = createClientServer();
  await requireActiveAdminProfileWithSession(supabase, "editar usuarios");

  const profileId = textValue(formData, "profile_id");
  const fullName = textValue(formData, "full_name");
  const phone = nullableTextValue(formData, "phone");
  const documentId = nullableTextValue(formData, "document_id");
  const roleValue = textValue(formData, "role").toUpperCase();
  const status = textValue(formData, "status").toUpperCase();

  if (!profileId) {
    redirectWithError("Selecciona un usuario valido.");
  }

  if (!fullName) {
    redirectWithError("El nombre completo es obligatorio.");
  }

  if (!["ADMIN", "AHORRADOR"].includes(roleValue)) {
    redirectWithError("El rol debe ser ADMIN o AHORRADOR.");
  }

  if (!["ACTIVO", "INACTIVO", "BLOQUEADO"].includes(status)) {
    redirectWithError("El estado debe ser ACTIVO, INACTIVO o BLOQUEADO.");
  }

  const role = roleValue as "ADMIN" | "AHORRADOR";
  const { error } = await (supabase as any).rpc("update_internal_user_profile", {
    p_profile_id: profileId,
    p_full_name: fullName,
    p_phone: phone,
    p_document_id: documentId,
    p_role: role,
    p_status: status
  });

  if (error) {
    console.error("[admin-usuarios] update_internal_user_profile", error);
    redirectWithError(error.message || "No fue posible editar el usuario.");
  }

  ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
  redirectWithSuccess("user_updated", profileId);
}

export async function enableSavingsAccountAction(formData: FormData) {
  const supabase = createClientServer();
  await requireActiveAdminProfileWithSession(supabase, "habilitar cuentas de ahorro");

  const profileId = textValue(formData, "profile_id");
  const accountNumber = nullableTextValue(formData, "account_number");
  const initialBalance = parseAmount(formData.get("initial_balance"));
  const initialBalanceDate = nullableDateValue(formData, "initial_balance_date", "La fecha del saldo inicial");

  if (!profileId) {
    redirectWithError("Selecciona un usuario valido.");
  }

  if (initialBalance === null || initialBalance < 0) {
    redirectWithError("El saldo inicial debe ser cero o mayor.");
  }

  if (initialBalance > 0 && !initialBalanceDate) {
    redirectWithError("La fecha del saldo inicial es obligatoria cuando el saldo inicial es mayor a cero.");
  }

  const { error } = await (supabase as any).rpc("enable_savings_account", {
    p_profile_id: profileId,
    p_account_number: accountNumber,
    p_initial_balance: initialBalance,
    p_initial_balance_date: initialBalanceDate
  });

  if (error) {
    console.error("[admin-usuarios] enable_savings_account", error);
    redirectWithError(error.message || "No fue posible habilitar la cuenta de ahorro.");
  }

  ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
  redirectWithSuccess("savings_enabled", profileId);
}

export async function activateUserAccessAction(formData: FormData) {
  const adminSupabase = createAdminClientForAction();
  const currentUser = await getAuthenticatedUserForAction("activar accesos");
  const adminProfile = await requireActiveAdminProfile(adminSupabase, currentUser.id, "activar accesos");

  const profileId = textValue(formData, "profile_id");

  if (!profileId) {
    redirectWithError("Selecciona un usuario valido.");
  }

  const { data: targetProfile, error: targetError } = await adminSupabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle<ProfileRow>();

  if (targetError) {
    console.error("[admin-usuarios] activate target profile", targetError);
    redirectWithError(targetError.message || "No fue posible consultar el usuario.");
  }

  if (!targetProfile) {
    redirectWithError("El usuario interno no existe.");
  }

  if (targetProfile.auth_user_id) {
    redirectWithError("Este usuario ya tiene acceso activo.");
  }

  if (!targetProfile.email) {
    redirectWithError("El usuario no tiene correo electronico para activar acceso.");
  }

  const existingLinkedProfile = await adminSupabase
    .schema("public")
    .from("profiles")
    .select("id")
    .eq("email", targetProfile.email)
    .not("auth_user_id", "is", null)
    .neq("id", targetProfile.id)
    .maybeSingle<{ id: string }>();

  if (existingLinkedProfile.error) {
    console.error("[admin-usuarios] activate linked profile", existingLinkedProfile.error);
    redirectWithError(existingLinkedProfile.error.message || "No fue posible validar usuarios existentes.");
  }

  if (existingLinkedProfile.data) {
    redirectWithError("Ya existe otro perfil con acceso activo para ese correo.");
  }

  const temporaryPassword = generateTemporaryPassword();
  let authUserId = "";
  let createdAuthUser = false;

  const { data: createdAuthData, error: createAuthError } = await adminSupabase.auth.admin.createUser({
    email: targetProfile.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: targetProfile.full_name,
      profile_id: targetProfile.id,
      role: targetProfile.role
    }
  });

  if (createAuthError) {
    const existingAuthUser = await findAuthUserByEmail(adminSupabase, targetProfile.email);

    if (existingAuthUser.error) {
      console.error("[admin-usuarios] find existing auth user", existingAuthUser.error);
      redirectWithError(existingAuthUser.error.message || "No fue posible validar si ya existe un usuario Auth con ese correo.");
    }

    if (!existingAuthUser.user) {
      console.error("[admin-usuarios] create auth user", createAuthError);
      redirectWithError(createAuthError.message || "No fue posible crear el usuario en Auth.");
    }

    authUserId = existingAuthUser.user.id;

    const { error: updateAuthPasswordError } = await adminSupabase.auth.admin.updateUserById(authUserId, {
      password: temporaryPassword
    });

    if (updateAuthPasswordError) {
      console.error("[admin-usuarios] update existing auth password", updateAuthPasswordError);
      redirectWithError(updateAuthPasswordError.message || "El usuario Auth ya existe, pero no fue posible asignar una contraseña temporal.");
    }
  } else {
    authUserId = createdAuthData.user?.id ?? "";
    createdAuthUser = true;
  }

  if (!authUserId) {
    redirectWithError("No fue posible obtener el id del usuario Auth.");
  }

  const linkedAuthProfile = await adminSupabase
    .schema("public")
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .neq("id", targetProfile.id)
    .maybeSingle<{ id: string }>();

  if (linkedAuthProfile.error) {
    console.error("[admin-usuarios] activate auth link", linkedAuthProfile.error);
    redirectWithError(linkedAuthProfile.error.message || "No fue posible validar el enlace Auth.");
  }

  if (linkedAuthProfile.data) {
    redirectWithError("Ese usuario Auth ya esta vinculado a otro perfil.");
  }

  const { error: updateProfileError } = await adminSupabase
    .schema("public")
    .from("profiles")
    .update({
      auth_user_id: authUserId,
      must_change_password: true,
      password_changed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", targetProfile.id)
    .is("auth_user_id", null);

  if (updateProfileError) {
    console.error("[admin-usuarios] activate update profile", updateProfileError);

    if (createdAuthUser) {
      const { error: rollbackError } = await adminSupabase.auth.admin.deleteUser(authUserId);
      if (rollbackError) {
        console.error("[admin-usuarios] activate rollback auth user", rollbackError);
      }
    }

    redirectWithError(updateProfileError.message || "No fue posible vincular el usuario Auth al perfil.");
  }

  const { error: auditError } = await adminSupabase.schema("public").from("audit_logs").insert({
    actor_profile_id: adminProfile.id,
    module: "Usuarios",
    action: "Activar acceso",
    description: `${adminProfile.full_name} activo el acceso de ${targetProfile.full_name}.`,
    status: "Completado",
    metadata: {
      profile_id: targetProfile.id,
      email: targetProfile.email,
      auth_user_id: authUserId
    },
    created_at: new Date().toISOString()
  });

  if (auditError) {
    console.error("[admin-usuarios] activate audit", auditError);
    redirectWithError(auditError.message || "El acceso fue activado, pero no fue posible registrar la auditoria.");
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/auditoria");

  redirectWithAccessSuccess(targetProfile.id, temporaryPassword);
}

export async function revokeUserAccessAction(formData: FormData) {
  const adminSupabase = createAdminClientForAction();
  const currentUser = await getAuthenticatedUserForAction("revocar accesos");
  const adminProfile = await requireActiveAdminProfile(adminSupabase, currentUser.id, "revocar accesos");

  const profileId = textValue(formData, "profile_id");

  if (!profileId) {
    redirectWithError("Selecciona un usuario valido.");
  }

  const { data: targetProfile, error: targetError } = await adminSupabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle<ProfileRow>();

  if (targetError) {
    console.error("[admin-usuarios] revoke target profile", targetError);
    redirectWithError(targetError.message || "No fue posible consultar el usuario.");
  }

  if (!targetProfile) {
    redirectWithError("El usuario interno no existe.");
  }

  if (!targetProfile.auth_user_id) {
    redirectWithError("Este usuario ya esta como acceso pendiente.");
  }

  if (targetProfile.id === adminProfile.id || targetProfile.auth_user_id === currentUser.id) {
    redirectWithError("No puedes revocar tu propio acceso desde esta pantalla.");
  }

  const authDeleteError = await deleteAuthUser(adminSupabase, targetProfile.auth_user_id, "revoke");

  if (authDeleteError) {
    redirectWithError(authDeleteError);
  }

  const { error: updateProfileError } = await adminSupabase
    .schema("public")
    .from("profiles")
    .update({
      auth_user_id: null,
      must_change_password: false,
      password_changed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", targetProfile.id);

  if (updateProfileError) {
    console.error("[admin-usuarios] revoke update profile", updateProfileError);
    redirectWithError(updateProfileError.message || "El acceso fue revocado en Auth, pero no fue posible actualizar el perfil.");
  }

  const { error: auditError } = await adminSupabase.schema("public").from("audit_logs").insert({
    actor_profile_id: adminProfile.id,
    module: "Usuarios",
    action: "Revocar acceso",
    description: `${adminProfile.full_name} revoco el acceso de ${targetProfile.full_name}.`,
    status: "Completado",
    metadata: {
      profile_id: targetProfile.id,
      email: targetProfile.email,
      auth_user_id: targetProfile.auth_user_id
    },
    created_at: new Date().toISOString()
  });

  if (auditError) {
    console.error("[admin-usuarios] revoke audit", auditError);
    redirectWithError(auditError.message || "El acceso fue revocado, pero no fue posible registrar la auditoria.");
  }

  ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
  redirectWithSuccess("access_revoked", targetProfile.id);
}

export async function deleteTestUserAction(formData: FormData) {
  const adminSupabase = createAdminClientForAction();
  const currentUser = await getAuthenticatedUserForAction("eliminar usuarios de prueba");
  const adminProfile = await requireActiveAdminProfile(adminSupabase, currentUser.id, "eliminar usuarios de prueba");

  const profileId = textValue(formData, "profile_id");

  if (!profileId) {
    redirectWithError("Selecciona un usuario valido.");
  }

  const { data: targetProfile, error: targetError } = await adminSupabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle<ProfileRow>();

  if (targetError) {
    console.error("[admin-usuarios] delete target profile", targetError);
    redirectWithError(targetError.message || "No fue posible consultar el usuario.");
  }

  if (!targetProfile) {
    redirectWithError("El usuario interno no existe.");
  }

  if (targetProfile.id === adminProfile.id || targetProfile.auth_user_id === currentUser.id) {
    redirectWithError("No puedes eliminar tu propio perfil desde esta pantalla.");
  }

  if (isProtectedBaseUser(targetProfile.email)) {
    redirectWithError("No se pueden eliminar usuarios base de FONFAMPER.");
  }

  const [accountResponse, movementsResponse] = await Promise.all([
    adminSupabase.schema("public").from("accounts").select("*").eq("profile_id", targetProfile.id).maybeSingle<AccountRow>(),
    adminSupabase
      .schema("public")
      .from("movements")
      .select("*")
      .eq("profile_id", targetProfile.id)
      .order("movement_date", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (accountResponse.error) {
    console.error("[admin-usuarios] delete account validation", accountResponse.error);
    redirectWithError(accountResponse.error.message || "No fue posible validar la cuenta de ahorro del usuario.");
  }

  if (movementsResponse.error) {
    console.error("[admin-usuarios] delete movements validation", movementsResponse.error);
    redirectWithError(movementsResponse.error.message || "No fue posible validar los movimientos del usuario.");
  }

  const account = accountResponse.data ?? null;
  const movements = (movementsResponse.data ?? []) as MovementRow[];
  const blockReason = getTestUserDeletionBlockReason(account, movements);

  if (blockReason) {
    redirectWithError(blockReason);
  }

  if (targetProfile.auth_user_id) {
    const authDeleteError = await deleteAuthUser(adminSupabase, targetProfile.auth_user_id, "delete test user");

    if (authDeleteError) {
      redirectWithError(authDeleteError);
    }
  }

  const { error: notificationsError } = await adminSupabase.schema("public").from("notifications").delete().eq("profile_id", targetProfile.id);

  if (notificationsError) {
    console.error("[admin-usuarios] delete notifications", notificationsError);
    redirectWithError(notificationsError.message || "No fue posible eliminar las notificaciones del usuario de prueba.");
  }

  const { error: movementsDeleteError } = await adminSupabase.schema("public").from("movements").delete().eq("profile_id", targetProfile.id);

  if (movementsDeleteError) {
    console.error("[admin-usuarios] delete movements", movementsDeleteError);
    redirectWithError(movementsDeleteError.message || "No fue posible eliminar los movimientos permitidos del usuario de prueba.");
  }

  const { error: accountsDeleteError } = await adminSupabase.schema("public").from("accounts").delete().eq("profile_id", targetProfile.id);

  if (accountsDeleteError) {
    console.error("[admin-usuarios] delete accounts", accountsDeleteError);
    redirectWithError(accountsDeleteError.message || "No fue posible eliminar la cuenta de ahorro del usuario de prueba.");
  }

  const { error: auditLogsDeleteError } = await adminSupabase.schema("public").from("audit_logs").delete().eq("actor_profile_id", targetProfile.id);

  if (auditLogsDeleteError) {
    console.error("[admin-usuarios] delete actor audit logs", auditLogsDeleteError);
    redirectWithError(auditLogsDeleteError.message || "No fue posible limpiar la auditoria propia del usuario de prueba.");
  }

  const { error: profileDeleteError } = await adminSupabase.schema("public").from("profiles").delete().eq("id", targetProfile.id);

  if (profileDeleteError) {
    console.error("[admin-usuarios] delete profile", profileDeleteError);
    redirectWithError(profileDeleteError.message || "No fue posible eliminar el perfil del usuario de prueba.");
  }

  const { error: auditError } = await adminSupabase.schema("public").from("audit_logs").insert({
    actor_profile_id: adminProfile.id,
    module: "Usuarios",
    action: "Eliminar usuario de prueba",
    description: `${adminProfile.full_name} elimino el usuario de prueba ${targetProfile.full_name}.`,
    status: "Completado",
    metadata: {
      deleted_profile_id: targetProfile.id,
      deleted_full_name: targetProfile.full_name,
      deleted_email: targetProfile.email,
      deleted_role: targetProfile.role,
      deleted_status: targetProfile.status,
      account_id: account?.id ?? null,
      account_number: account?.account_number ?? null,
      deleted_movements: movements.length,
      auth_user_deleted: Boolean(targetProfile.auth_user_id)
    },
    created_at: new Date().toISOString()
  });

  if (auditError) {
    console.error("[admin-usuarios] delete test user audit", auditError);
    redirectWithError(auditError.message || "El usuario fue eliminado, pero no fue posible registrar la auditoria.");
  }

  ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
  redirectWithSuccess("test_user_deleted", targetProfile.id);
}

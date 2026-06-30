"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClientServer } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;
type ServerSupabaseClient = ReturnType<typeof createClientServer>;
type AuthUserSummary = {
  id: string;
  email?: string | null;
};

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

function parseAmount(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return 0;
  }

  const amount = Number(rawValue.replace(/[^\d]/g, ""));
  return Number.isFinite(amount) ? amount : null;
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

  const supabase = createClientServer();
  const { data, error } = await (supabase as any).rpc("create_internal_user_profile", {
    p_full_name: fullName,
    p_email: email,
    p_role: role,
    p_phone: phone,
    p_document_id: documentId,
    p_create_account: createAccount,
    p_account_number: createAccount ? accountNumber : null,
    p_initial_balance: initialBalance
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

  if (!profileId) {
    redirectWithError("Selecciona un usuario valido.");
  }

  if (initialBalance === null || initialBalance < 0) {
    redirectWithError("El saldo inicial debe ser cero o mayor.");
  }

  const { error } = await (supabase as any).rpc("enable_savings_account", {
    p_profile_id: profileId,
    p_account_number: accountNumber,
    p_initial_balance: initialBalance
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

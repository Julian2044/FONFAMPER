"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/fonfamper/auth";
import { createClientServer } from "@/lib/supabase/server";

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

function redirectWithError(message: string) {
  redirect(`/admin/usuarios?error=${encodeURIComponent(message)}`);
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

export async function createInternalUserProfileAction(formData: FormData) {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile) {
    redirectWithError("Debes iniciar sesion para crear usuarios.");
  }

  const adminProfile = currentProfile as NonNullable<typeof currentProfile>;

  if (adminProfile.role !== "ADMIN" || String(adminProfile.status ?? "").toUpperCase() !== "ACTIVO") {
    redirectWithError("Solo un administrador activo puede crear usuarios.");
  }

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

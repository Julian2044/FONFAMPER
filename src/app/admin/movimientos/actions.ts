"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/fonfamper/auth";
import { createClientServer } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type MovementType = Database["public"]["Tables"]["movements"]["Row"]["movement_type"];

const ADMIN_REVALIDATION_PATHS = [
  "/admin/dashboard",
  "/admin/movimientos",
  "/admin/usuarios",
  "/admin/estados-cuenta",
  "/admin/utilidades",
  "/admin/reportes",
  "/admin/auditoria"
];

const SAVER_REVALIDATION_PATHS = [
  "/ahorrador/inicio",
  "/ahorrador/movimientos",
  "/ahorrador/estado-cuenta",
  "/ahorrador/notificaciones",
  "/ahorrador/perfil",
  "/ahorrador/utilidades"
];

function redirectWithError(message: string) {
  redirect(`/admin/movimientos?error=${encodeURIComponent(message)}`);
}

function parseAmount(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return null;
  }

  const amount = Number(rawValue.replace(/[^\d]/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

function parseDate(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string" || !rawValue) {
    return null;
  }

  const date = new Date(rawValue);
  return Number.isFinite(date.getTime()) ? rawValue : null;
}

export async function registerMovementAction(formData: FormData) {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile) {
    redirectWithError("Debes iniciar sesión para registrar movimientos.");
  }

  const adminProfile = currentProfile as NonNullable<typeof currentProfile>;

  if (adminProfile.role !== "ADMIN" || String(adminProfile.status ?? "").toUpperCase() !== "ACTIVO") {
    redirectWithError("Solo un administrador activo puede registrar movimientos.");
  }

  const targetProfileId = formData.get("target_profile_id");
  const movementTypeRaw = formData.get("movement_type");
  const conceptRaw = formData.get("concept");
  const descriptionRaw = formData.get("description");
  const observationsRaw = formData.get("observations");
  const amountRaw = formData.get("amount");
  const movementDateRaw = formData.get("movement_date");

  if (typeof targetProfileId !== "string" || !targetProfileId) {
    redirectWithError("Selecciona un usuario válido.");
  }

  if (typeof movementTypeRaw !== "string" || !["APORTE", "RETIRO", "AJUSTE"].includes(movementTypeRaw)) {
    redirectWithError("Selecciona un tipo de movimiento válido.");
  }

  const concept = typeof conceptRaw === "string" ? conceptRaw.trim() : "";
  if (!concept) {
    redirectWithError("El concepto es obligatorio.");
  }

  const description = typeof descriptionRaw === "string" ? descriptionRaw.trim() : "";
  if (!description) {
    redirectWithError("La descripción es obligatoria.");
  }

  const amount = parseAmount(amountRaw);
  if (!amount || amount <= 0) {
    redirectWithError("El valor debe ser mayor a cero.");
  }

  const movementDate = parseDate(movementDateRaw);
  if (!movementDate) {
    redirectWithError("Selecciona una fecha válida.");
  }

  const observations = typeof observationsRaw === "string" ? observationsRaw.trim() : "";
  const fullDescription = observations ? `${description} | Observaciones: ${observations}` : description;

  const supabase = createClientServer();
  const { data, error } = await (supabase as any).rpc("register_movement", {
    target_profile_id: targetProfileId,
    p_movement_type: movementTypeRaw as MovementType,
    p_concept: concept,
    p_description: fullDescription,
    p_amount: amount,
    p_movement_date: movementDate
  });

  if (error) {
    console.error("[admin-movimientos] register_movement", error);
    redirectWithError(error.message || "No fue posible registrar el movimiento.");
  }

  ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
  SAVER_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));

  const movementId = typeof data === "object" && data && "movement_id" in data ? String((data as { movement_id?: unknown }).movement_id ?? "") : "";
  const successQuery = movementId ? `success=movement_registered&movement_id=${encodeURIComponent(movementId)}` : "success=movement_registered";
  redirect(`/admin/movimientos?${successQuery}`);
}

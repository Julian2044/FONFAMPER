"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClientServer } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MovementType = Database["public"]["Tables"]["movements"]["Row"]["movement_type"];

const SUPPORT_BUCKET = "movement-supports";
const MAX_SUPPORT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_SUPPORT_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

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

function redirectWithError(message: string): never {
  redirect(`/admin/movimientos?error=${encodeURIComponent(message)}`);
}

function redirectWithSupportWarning(movementId: string): never {
  const query = new URLSearchParams({
    success: "movement_registered_support_failed",
    movement_id: movementId
  });

  redirect(`/admin/movimientos?${query.toString()}`);
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

function getOptionalSupportFile(formData: FormData) {
  const value = formData.get("support_file");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!ALLOWED_SUPPORT_MIME_TYPES.has(value.type)) {
    redirectWithError("El soporte debe ser PDF, JPG o PNG.");
  }

  if (value.size > MAX_SUPPORT_SIZE_BYTES) {
    redirectWithError("El soporte no puede pesar más de 10 MB.");
  }

  return value;
}

function sanitizeFilename(filename: string) {
  const cleaned = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120);

  return cleaned || "soporte";
}

async function getAuthenticatedActiveAdminProfile() {
  const supabase = createClientServer();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[admin-movimientos] get user", authError.message);
  }

  if (!user) {
    redirectWithError("Debes iniciar sesión para registrar movimientos.");
  }

  const userId = user.id;

  const { data: profile, error: profileError } = await supabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle<ProfileRow>();

  if (profileError) {
    console.error("[admin-movimientos] current profile", profileError.message);
    redirectWithError("No fue posible validar el perfil administrador.");
  }

  if (!profile || profile.role !== "ADMIN" || String(profile.status ?? "").toUpperCase() !== "ACTIVO") {
    redirectWithError("Solo un administrador activo puede registrar movimientos.");
  }

  return { supabase, adminProfile: profile };
}

async function saveMovementSupport(params: {
  file: File;
  movementId: string;
  profileId: string;
  uploadedBy: string;
}) {
  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible inicializar el cliente admin de Supabase.";
    console.error("[admin-movimientos] support admin client", message);
    return false;
  }

  const safeFilename = sanitizeFilename(params.file.name);
  const storagePath = `${params.profileId}/${params.movementId}/${randomUUID()}-${safeFilename}`;
  const fileBytes = new Uint8Array(await params.file.arrayBuffer());

  const { error: uploadError } = await adminSupabase.storage.from(SUPPORT_BUCKET).upload(storagePath, fileBytes, {
    contentType: params.file.type,
    upsert: false
  });

  if (uploadError) {
    console.error("[admin-movimientos] support upload", uploadError.message);
    return false;
  }

  const { error: attachmentError } = await adminSupabase.schema("public").from("movement_attachments").insert({
    movement_id: params.movementId,
    profile_id: params.profileId,
    uploaded_by: params.uploadedBy,
    bucket: SUPPORT_BUCKET,
    storage_path: storagePath,
    original_filename: params.file.name,
    mime_type: params.file.type,
    size_bytes: params.file.size
  });

  if (attachmentError) {
    console.error("[admin-movimientos] support metadata", attachmentError.message);
    await adminSupabase.storage.from(SUPPORT_BUCKET).remove([storagePath]);
    return false;
  }

  return true;
}

export async function registerMovementAction(formData: FormData) {
  const { supabase, adminProfile } = await getAuthenticatedActiveAdminProfile();

  const targetProfileId = formData.get("target_profile_id");
  const movementTypeRaw = formData.get("movement_type");
  const conceptRaw = formData.get("concept");
  const descriptionRaw = formData.get("description");
  const observationsRaw = formData.get("observations");
  const amountRaw = formData.get("amount");
  const movementDateRaw = formData.get("movement_date");
  const supportFile = getOptionalSupportFile(formData);

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

  if (supportFile) {
    if (!movementId) {
      redirectWithSupportWarning("");
    }

    const savedSupport = await saveMovementSupport({
      file: supportFile,
      movementId,
      profileId: targetProfileId,
      uploadedBy: adminProfile.id
    });

    if (!savedSupport) {
      ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
      SAVER_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
      redirectWithSupportWarning(movementId);
    }

    ADMIN_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
    SAVER_REVALIDATION_PATHS.forEach((path) => revalidatePath(path));
  }

  const successQuery = movementId ? `success=movement_registered&movement_id=${encodeURIComponent(movementId)}` : "success=movement_registered";
  redirect(`/admin/movimientos?${successQuery}`);
}

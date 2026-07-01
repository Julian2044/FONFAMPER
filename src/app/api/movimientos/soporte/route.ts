import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClientServer } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MovementAttachmentRow = Database["public"]["Tables"]["movement_attachments"]["Row"];

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get("attachmentId");
  const format = searchParams.get("format");

  if (!attachmentId) {
    return jsonError("Falta attachmentId.", 400);
  }

  const supabase = createClientServer();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[movimientos-soporte] get user", authError.message);
  }

  if (!user) {
    return jsonError("No autenticado.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError) {
    console.error("[movimientos-soporte] profile", profileError.message);
    return jsonError("No fue posible validar el perfil.", 500);
  }

  if (!profile || String(profile.status ?? "").toUpperCase() !== "ACTIVO") {
    return jsonError("Acceso no autorizado.", 403);
  }

  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible inicializar el cliente admin.";
    console.error("[movimientos-soporte] admin client", message);
    return jsonError("No fue posible generar el enlace del soporte.", 500);
  }

  const { data: attachment, error: attachmentError } = await adminSupabase
    .schema("public")
    .from("movement_attachments")
    .select("*")
    .eq("id", attachmentId)
    .maybeSingle<MovementAttachmentRow>();

  if (attachmentError) {
    console.error("[movimientos-soporte] attachment", attachmentError.message);
    return jsonError("No fue posible consultar el soporte.", 500);
  }

  if (!attachment) {
    return jsonError("Soporte no encontrado.", 404);
  }

  const isActiveAdmin = profile.role === "ADMIN" && String(profile.status ?? "").toUpperCase() === "ACTIVO";
  const isOwner = attachment.profile_id === profile.id;

  if (!isActiveAdmin && !isOwner) {
    return jsonError("No tienes permisos para ver este soporte.", 403);
  }

  const { data: signedUrlData, error: signedUrlError } = await adminSupabase.storage
    .from(attachment.bucket)
    .createSignedUrl(attachment.storage_path, 60 * 5);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error("[movimientos-soporte] signed url", signedUrlError?.message ?? "Sin URL firmada");
    return jsonError("No fue posible generar el enlace del soporte.", 500);
  }

  if (format === "json") {
    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      mimeType: attachment.mime_type,
      originalFilename: attachment.original_filename
    });
  }

  return NextResponse.redirect(signedUrlData.signedUrl);
}

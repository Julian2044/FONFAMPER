import { redirect } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { createClientServer } from "@/lib/supabase/server";
import { getRoleHomePath, toDemoUser } from "./auth-utils";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthProfile = ProfileRow;

export async function getCurrentProfile() {
  const supabase = createClientServer();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[auth] getUser", authError);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .schema("public")
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    console.error("[auth] profiles", error);
  }

  return data ?? null;
}

export { getRoleHomePath, toDemoUser };

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?error=auth");
  }

  return profile;
}

export async function requireRole(role: ProfileRow["role"]) {
  const profile = await requireProfile();

  if (profile.status?.toUpperCase() !== "ACTIVO") {
    redirect("/login?error=inactive");
  }

  if (profile.role !== role) {
    redirect(getRoleHomePath(profile.role));
  }

  return profile;
}

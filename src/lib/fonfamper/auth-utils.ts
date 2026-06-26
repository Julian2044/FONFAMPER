import type { Database } from "@/lib/supabase/types";
import type { DemoUser } from "@/types/user";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export function getRoleHomePath(role: ProfileRow["role"]) {
  return role === "ADMIN" ? "/admin/dashboard" : "/ahorrador/inicio";
}

export function toDemoUser(profile: ProfileRow): DemoUser {
  return {
    name: profile.full_name,
    role: profile.role === "ADMIN" ? "Administradora" : "Ahorrador",
    fund: "FONFAMPER",
    description: "Fondo de Ahorro Familiar",
    email: profile.email,
    phone: profile.phone ?? undefined
  };
}

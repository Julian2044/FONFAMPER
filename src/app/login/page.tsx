import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentProfile, getRoleHomePath } from "@/lib/fonfamper/auth";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export const metadata: Metadata = {
  title: "FONFAMPER - Login"
};

function resolveSearchMessage(error?: string) {
  switch (error) {
    case "auth":
      return "Debes iniciar sesión para continuar.";
    case "inactive":
      return "Tu acceso no está activo.";
    case "profile":
      return "Tu usuario no está vinculado a un perfil FONFAMPER.";
    default:
      return null;
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const profile = await getCurrentProfile();

  if (profile && String(profile.status ?? "").toUpperCase() === "ACTIVO") {
    redirect(getRoleHomePath(profile.role));
  }

  return <LoginForm initialMessage={resolveSearchMessage(searchParams?.error) ?? (profile ? "Tu acceso no está activo." : null)} />;
}

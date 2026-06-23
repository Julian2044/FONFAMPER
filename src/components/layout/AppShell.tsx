import type { ReactNode } from "react";
import type { DemoUser } from "@/types/user";
import type { NavItem } from "@/lib/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

type AppShellProps = {
  children: ReactNode;
  user: DemoUser;
  title: string;
  navigation: NavItem[];
  variant?: "saver" | "admin";
};

export function AppShell({ children, user, title, navigation, variant = "saver" }: AppShellProps) {
  const topbarDemoLinks =
    variant === "admin"
      ? {
          tipoPortal: "admin" as const,
          perfilHref: "/admin/dashboard",
          notificacionesHref: "/admin/auditoria",
          cambiarUsuarioHref: "/ahorrador/inicio",
          cerrarSesionHref: "/login"
        }
      : {
          tipoPortal: "ahorrador" as const,
          perfilHref: "/ahorrador/perfil",
          notificacionesHref: "/ahorrador/notificaciones",
          cambiarUsuarioHref: "/admin/dashboard",
          cerrarSesionHref: "/login"
        };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar items={navigation} variant={variant} />
      <div className="lg:pl-[280px]">
        <Topbar user={user} title={title} variant={variant} {...topbarDemoLinks} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">{children}</main>
      </div>
      <MobileNav items={navigation} />
    </div>
  );
}

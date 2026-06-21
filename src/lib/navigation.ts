export type NavItem = {
  label: string;
  href: string;
  iconKey: string;
  disabled?: boolean;
};

export const saverNavigation: NavItem[] = [
  { label: "Inicio", href: "/ahorrador/inicio", iconKey: "home" },
  { label: "Movimientos", href: "/ahorrador/movimientos", iconKey: "movements" },
  { label: "Utilidades", href: "/ahorrador/utilidades", iconKey: "chart" },
  { label: "Estado de cuenta", href: "/ahorrador/estado-cuenta", iconKey: "file" },
  { label: "Notificaciones", href: "/ahorrador/inicio", iconKey: "bell", disabled: true },
  { label: "Mi perfil", href: "/ahorrador/perfil", iconKey: "user" }
];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", iconKey: "chart" },
  { label: "Usuarios", href: "/admin/usuarios", iconKey: "users" },
  { label: "Movimientos", href: "/admin/movimientos", iconKey: "movements" },
  { label: "Utilidades", href: "/admin/utilidades", iconKey: "wallet" },
  { label: "Importar Excel", href: "/admin/importaciones", iconKey: "upload" },
  { label: "Estados de cuenta", href: "/admin/dashboard", iconKey: "file", disabled: true },
  { label: "Reportes", href: "/admin/dashboard", iconKey: "report", disabled: true },
  { label: "Auditoría", href: "/admin/auditoria", iconKey: "audit" },
  { label: "Configuración", href: "/admin/dashboard", iconKey: "settings", disabled: true }
];

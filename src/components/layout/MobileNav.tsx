"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/AppIcon";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  items: NavItem[];
  variant?: "saver" | "admin";
};

const adminDockOrder = [
  "/admin/dashboard",
  "/admin/usuarios",
  "/admin/movimientos",
  "/admin/utilidades",
  "/admin/importaciones",
  "/admin/estados-cuenta",
  "/admin/reportes",
  "/admin/auditoria",
  "/admin/configuracion"
] as const;

const saverDockOrder = [
  "/ahorrador/inicio",
  "/ahorrador/movimientos",
  "/ahorrador/utilidades",
  "/ahorrador/estado-cuenta",
  "/ahorrador/notificaciones",
  "/ahorrador/perfil"
] as const;

const dockLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/usuarios": "Usuarios",
  "/admin/movimientos": "Movs.",
  "/admin/utilidades": "Utilidades",
  "/admin/importaciones": "Importar",
  "/admin/estados-cuenta": "Estados",
  "/admin/reportes": "Reportes",
  "/admin/auditoria": "Auditoría",
  "/admin/configuracion": "Config.",
  "/ahorrador/inicio": "Inicio",
  "/ahorrador/movimientos": "Movs.",
  "/ahorrador/utilidades": "Utilidades",
  "/ahorrador/estado-cuenta": "Estado",
  "/ahorrador/notificaciones": "Notif.",
  "/ahorrador/perfil": "Perfil"
};

export function MobileNav({ items, variant = "saver" }: MobileNavProps) {
  const pathname = usePathname();
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const dockHrefs = variant === "admin" ? adminDockOrder : saverDockOrder;
  const dockItems = useMemo(
    () =>
      dockHrefs
        .map((href) => items.find((item) => item.href === href && !item.disabled))
        .filter(Boolean) as NavItem[],
    [dockHrefs, items]
  );

  useEffect(() => {
    const activeItem = dockItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    const activeNode = activeItem ? itemRefs.current[activeItem.href] : null;

    if (!activeNode) {
      return;
    }

    activeNode.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [dockItems, pathname]);

  const dockClassName = cn(
    "mx-auto flex w-full max-w-[calc(100vw-1.25rem)] snap-x snap-mandatory items-stretch gap-2 overflow-x-auto overscroll-x-contain rounded-[30px] border border-white/70 bg-white/90 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.22)] backdrop-blur-2xl ring-1 ring-slate-200/70",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] lg:hidden"
      aria-label="Navegación principal móvil"
    >
      <div className="relative mx-auto w-full max-w-[calc(100vw-1rem)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 rounded-l-[30px] bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 rounded-r-[30px] bg-gradient-to-l from-white via-white/80 to-transparent" />
        <div className={dockClassName}>
          {dockItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const label = dockLabels[item.href] ?? item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(node) => {
                  itemRefs.current[item.href] = node;
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group inline-flex min-h-[4.4rem] min-w-[4.9rem] flex-none snap-center flex-col items-center justify-center gap-1 rounded-[22px] px-3 py-2 text-[10px] font-extrabold transition-all duration-200",
                  active ? "bg-[#0057d9] text-white shadow-lg shadow-blue-900/25" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full transition", active ? "bg-white/20 text-white" : "bg-transparent text-current")}>
                  <AppIcon iconKey={item.iconKey} className="h-4 w-4 shrink-0" />
                </span>
                <span className="max-w-full truncate leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

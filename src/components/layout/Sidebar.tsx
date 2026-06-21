"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/AppIcon";
import { SecurityCard } from "@/components/ui/SecurityCard";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: NavItem[];
  variant?: "saver" | "admin";
};

export function Sidebar({ items, variant = "saver" }: SidebarProps) {
  const pathname = usePathname();
  const security =
    variant === "admin"
      ? {
          title: "Tu sistema está protegido",
          description: "Acceso seguro con altos estándares de seguridad y auditoría.",
          linkLabel: "Ver detalles"
        }
      : {
          title: "Tu ahorro está seguro",
          description: "Fonfamper protege tu dinero con altos estándares de seguridad y transparencia.",
          linkLabel: "Conoce más"
        };

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[280px] bg-gradient-to-b from-[#062b5f] via-[#073b82] to-[#041b3f] text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-7">
        <p className="text-2xl font-extrabold tracking-normal">FONFAMPER</p>
        <p className="mt-1 text-sm text-blue-100">Fondo de Ahorro Familiar</p>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {items.map((item) => {
          const active = pathname === item.href;
          if (item.disabled) {
            return (
              <div key={item.label} className="flex cursor-default items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/35">
                <AppIcon iconKey={item.iconKey} className="h-5 w-5" />
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                active ? "bg-[#0057d9] text-white shadow-lg shadow-blue-950/20" : "text-blue-100/85 hover:bg-white/10 hover:text-white"
              )}
            >
              <AppIcon iconKey={item.iconKey} className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-5">
        <SecurityCard {...security} />
      </div>
    </aside>
  );
}

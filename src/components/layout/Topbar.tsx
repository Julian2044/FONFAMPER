import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import type { DemoUser } from "@/types/user";
import { AvatarPlaceholder } from "@/components/ui/AvatarPlaceholder";
import { Button } from "@/components/ui/Button";

type TopbarProps = {
  user: DemoUser;
  title: string;
  variant?: "saver" | "admin";
};

export function Topbar({ user, title, variant = "saver" }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 h-auto border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:h-[88px] lg:px-8">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Button variant="ghost" className="h-11 w-11 px-0 lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
            <Search className="mr-3 h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">{variant === "admin" ? "Buscar en FONFAMPER..." : "Buscar en Fonfamper..."}</span>
          </div>
          <div className="min-w-0 md:hidden">
            <p className="truncate text-sm font-bold text-slate-950">{title}</p>
            <p className="text-xs text-slate-500">{user.fund}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-11 w-11 px-0" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <AvatarPlaceholder name={user.name} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-bold text-slate-950">{user.name}</p>
              {variant === "admin" ? <p className="text-xs text-slate-500">{user.role}</p> : null}
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
          <div className="sm:hidden">
            <AvatarPlaceholder name={user.name} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}

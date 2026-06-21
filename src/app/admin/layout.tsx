import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { sonia } from "@/data/demo/sonia";
import { adminNavigation } from "@/lib/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell user={sonia} title="Administracion" navigation={adminNavigation} variant="admin">
      {children}
    </AppShell>
  );
}

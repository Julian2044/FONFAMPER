import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { requireRole, toDemoUser } from "@/lib/fonfamper/auth";
import { adminNavigation } from "@/lib/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("ADMIN");

  return (
    <AppShell user={toDemoUser(profile)} title="Administración" navigation={adminNavigation} variant="admin">
      {children}
    </AppShell>
  );
}

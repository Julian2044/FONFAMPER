import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { requireRole, toDemoUser } from "@/lib/fonfamper/auth";
import { saverNavigation } from "@/lib/navigation";

export default async function SaverLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("AHORRADOR");

  return (
    <AppShell user={toDemoUser(profile)} title="Portal del ahorrador" navigation={saverNavigation}>
      {children}
    </AppShell>
  );
}

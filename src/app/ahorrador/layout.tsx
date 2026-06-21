import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { camilo } from "@/data/demo/camilo";
import { saverNavigation } from "@/lib/navigation";

export default function SaverLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell user={camilo} title="Portal del ahorrador" navigation={saverNavigation}>
      {children}
    </AppShell>
  );
}

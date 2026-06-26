import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";
import { AdminMovementForm } from "@/components/admin/AdminMovementForm";

export const dynamic = "force-dynamic";

type AdminMovementsPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
    movement_id?: string;
  };
};

function resolveFlashMessage(searchParams?: AdminMovementsPageProps["searchParams"]) {
  if (searchParams?.success === "movement_registered") {
    return {
      tone: "success" as const,
      message: "Movimiento registrado correctamente."
    };
  }

  if (searchParams?.error) {
    return {
      tone: "error" as const,
      message: searchParams.error
    };
  }

  return null;
}

export default async function AdminMovementsPage({ searchParams }: AdminMovementsPageProps) {
  const adminData = await getDemoAdminData();
  const flash = resolveFlashMessage(searchParams);

  return (
    <div className="space-y-8 min-w-0">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">Registrar movimiento</h2>
        <p className="mt-2 text-base text-slate-500">Agrega aportes, retiros o ajustes a una cuenta</p>
      </div>

      {adminData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos administrativos.</p>
        </Card>
      ) : null}

      {flash ? (
        <Card className={flash.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{flash.message}</p>
          </div>
        </Card>
      ) : null}

      <AdminMovementForm users={adminData.users} />
    </div>
  );
}

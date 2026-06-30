import { CheckCircle2 } from "lucide-react";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { Card } from "@/components/ui/Card";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
    profile_id?: string;
    temporary_password?: string;
  };
};

function resolveFlashMessage(searchParams?: AdminUsersPageProps["searchParams"]) {
  if (searchParams?.success === "user_created") {
    return {
      tone: "success" as const,
      message: "Usuario interno creado correctamente. El acceso queda pendiente.",
      temporaryPassword: null
    };
  }

  if (searchParams?.success === "access_activated") {
    return {
      tone: "success" as const,
      message: "Acceso activado correctamente.",
      temporaryPassword: searchParams.temporary_password ?? null
    };
  }

  if (searchParams?.error) {
    return {
      tone: "error" as const,
      message: searchParams.error,
      temporaryPassword: null
    };
  }

  return null;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const adminData = await getDemoAdminData();
  const flash = resolveFlashMessage(searchParams);

  return (
    <div className="space-y-8 min-w-0">
      {adminData.error ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-semibold">No se pudieron cargar algunos datos administrativos.</p>
        </Card>
      ) : null}

      {flash ? (
        <Card className={flash.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{flash.message}</p>
              {flash.temporaryPassword ? (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm ring-1 ring-emerald-200">
                  <p className="font-bold text-emerald-950">Contraseña temporal: {flash.temporaryPassword}</p>
                  <p className="mt-1 text-emerald-800">Comparte esta contraseña temporal con el usuario. Debe cambiarla después de iniciar sesión.</p>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      <AdminUsersClient users={adminData.users} />
    </div>
  );
}

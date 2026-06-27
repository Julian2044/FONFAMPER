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
  };
};

function resolveFlashMessage(searchParams?: AdminUsersPageProps["searchParams"]) {
  if (searchParams?.success === "user_created") {
    return {
      tone: "success" as const,
      message: "Usuario interno creado correctamente. El acceso queda pendiente."
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
            <p className="text-sm font-semibold">{flash.message}</p>
          </div>
        </Card>
      ) : null}

      <AdminUsersClient users={adminData.users} />
    </div>
  );
}

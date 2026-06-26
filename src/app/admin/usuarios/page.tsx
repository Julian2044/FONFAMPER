import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { getDemoAdminData } from "@/lib/fonfamper/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const adminData = await getDemoAdminData();

  return <AdminUsersClient users={adminData.users} />;
}

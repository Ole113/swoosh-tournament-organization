import { AdminDashboard } from "@/components/AdminDashboard/AdminDashboard";
import { AdminLayout } from "@/components/AdminLayout/AdminLayout";

export function AdminDashboardPage() {
  return (
    <>
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
    </>
  );
}

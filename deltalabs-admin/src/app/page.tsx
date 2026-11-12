import { AuthGuard } from "@/modules/Admin/components/AuthGuard";
import { AdminShell } from "@/modules/Admin/views/AdminShell";

export default function AdminHomePage() {
  return (
    <AuthGuard>
      <AdminShell />
    </AuthGuard>
  );
}

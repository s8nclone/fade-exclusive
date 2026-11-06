import { AdminDashboardContainer } from "@/containers/admin/AdminCoreContainers";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  return <AdminDashboardContainer adminSlug={adminSlug} />;
}

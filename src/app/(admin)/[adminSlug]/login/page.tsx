import { AdminLoginContainer } from "@/containers/admin/AdminCoreContainers";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  return <AdminLoginContainer adminSlug={adminSlug} />;
}

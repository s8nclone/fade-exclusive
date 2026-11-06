import { AdminProtectedWrapper } from "@/containers/admin/AdminCoreContainers";

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  return (
    <AdminProtectedWrapper adminSlug={adminSlug}>
      {children}
    </AdminProtectedWrapper>
  );
}

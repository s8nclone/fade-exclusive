import { StorefrontShellContainer } from "@/containers/storefront/StorefrontShellContainer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontShellContainer>{children}</StorefrontShellContainer>;
}

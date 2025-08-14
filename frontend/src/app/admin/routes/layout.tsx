import AdminRoutesLayoutClient from './layout-client';

export default function AdminRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRoutesLayoutClient>{children}</AdminRoutesLayoutClient>;
}
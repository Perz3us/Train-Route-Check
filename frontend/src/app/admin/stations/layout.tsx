import AdminStationsLayoutClient from './layout-client';

export default function AdminStationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminStationsLayoutClient>{children}</AdminStationsLayoutClient>;
}
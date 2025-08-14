import TrackLayoutClient from './layout-client';

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TrackLayoutClient>{children}</TrackLayoutClient>;
}
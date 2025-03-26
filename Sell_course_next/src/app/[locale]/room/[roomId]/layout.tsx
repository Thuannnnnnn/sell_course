export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container-fluid p-0">{children}</div>;
}

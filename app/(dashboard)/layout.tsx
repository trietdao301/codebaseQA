export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main>
        <div>{children}</div>
      </main>
    </div>
  );
}

import Sidebar from "@/components/dashboard/Sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="container max-w-5xl py-8">{children}</div>
          </main>
        </div>
      );

}
import { RiderSidebar } from "@/components/layout/rider-sidebar";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <RiderSidebar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}

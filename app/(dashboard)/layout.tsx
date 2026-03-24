import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF8F0" }}>
      <Navbar />
      <main className="pt-16 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}

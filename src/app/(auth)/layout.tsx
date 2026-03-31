import { AuthNavbar } from "@/components/layout/AuthNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 pt-20 pb-12 items-center justify-center">
      {/* Navbar at top */}
      <AuthNavbar />

      {/* Decorative background element */}
      <div className="absolute top-0 end-0 -me-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl transition-colors pointer-events-none" />
      <div className="absolute bottom-0 start-0 -ms-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-3xl transition-colors pointer-events-none" />
      
      {children}
    </div>
  );
}

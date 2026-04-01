import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
          The page you are looking for does not exist or was moved.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

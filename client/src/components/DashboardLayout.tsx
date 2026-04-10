import { ReactNode } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { LogOut } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

type DashboardLayoutProps = {
  children: ReactNode;
  navItems?: NavItem[];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-screen-xl grid-cols-3 items-center px-4 py-3 sm:px-6 sm:py-4">

          <div />

          <div className="flex h-16 w-16 items-center justify-center justify-self-center rounded-xl bg-blue-600 p-1">
            <img src="/favicoin.png" alt="Âncora" className="h-full w-full object-contain" />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={logout}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Sair</span>
            </button>
          </div>

        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
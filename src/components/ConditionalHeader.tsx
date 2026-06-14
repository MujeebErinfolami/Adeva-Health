"use client";

import { usePathname } from "next/navigation";
import { NavMenu } from "./NavMenu";
import type { Session } from "next-auth";

export function ConditionalHeader({
  session,
  signOutAction,
}: {
  session: Session | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") return null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-md bg-teal-600" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Adeva Health
          </span>
        </a>
        <div className="flex items-center gap-2 text-sm">
          <NavMenu />
          {session?.user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-slate-500">{session.user.email}</span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <a
              href="/login"
              className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

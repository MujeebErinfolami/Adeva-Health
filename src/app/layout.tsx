import type { Metadata } from "next";
import { auth, signOut } from "@/auth";
import { NavMenu } from "@/components/NavMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adeva Health",
  description: "Laboratory information system",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className="min-h-screen bg-slate-50 text-slate-900"
        suppressHydrationWarning
      >
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
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                  >
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
        {children}
      </body>
    </html>
  );
}

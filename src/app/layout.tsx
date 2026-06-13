import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { auth, signOut } from "@/auth";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <html lang="en" className={montserrat.variable}>
      <body
        className="min-h-screen bg-slate-50 text-slate-900"
        suppressHydrationWarning
      >
        <ConditionalHeader session={session} signOutAction={signOutAction} />
        {children}
      </body>
    </html>
  );
}

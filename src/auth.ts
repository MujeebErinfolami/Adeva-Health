import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

// DEV-GRADE AUTH. A credentials provider that checks the email against your
// seeded users and a single shared dev password. No password hashing, no
// per-tenant scoping by subdomain yet. Replace with real credentials (hashed
// passwords) or OAuth before production. The point here is to get real
// session-based tenant + role resolution working, replacing devTenantId.

const DEV_PASSWORD = process.env.AUTH_DEV_PASSWORD ?? "adeva-dev";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || password !== DEV_PASSWORD) return null;

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid ?? "";
        session.user.tenantId = token.tenantId ?? "";
        session.user.role = token.role ?? "";
      }
      return session;
    },
  },
});

import { signIn } from "@/auth";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/specimens",
    });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Adeva Health</p>

      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-slate-600">Email</span>
          <input
            type="email"
            name="email"
            required
            defaultValue="admin@adeva.test"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Password</span>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-xs text-slate-400">
        Dev accounts: admin@adeva.test, accession@adeva.test, tech@adeva.test.
        Password: adeva-dev
      </p>
    </main>
  );
}

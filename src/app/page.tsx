export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-slate-900">Adeva Health</h1>
      <p className="mt-1 text-slate-500">Laboratory information system</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="/specimens"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
        >
          <h2 className="font-medium text-slate-900">Specimens</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create specimens, track the lifecycle, and enter results.
          </p>
        </a>

        <a
          href="/patients"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
        >
          <h2 className="font-medium text-slate-900">Patients</h2>
          <p className="mt-1 text-sm text-slate-500">
            Register patients and manage demographic records.
          </p>
        </a>

        <a
          href="/orders"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
        >
          <h2 className="font-medium text-slate-900">Orders</h2>
          <p className="mt-1 text-sm text-slate-500">
            Pre-register test orders and track their progress.
          </p>
        </a>

        <div className="rounded-xl border border-dashed border-slate-200 p-5">
          <h2 className="font-medium text-slate-400">More coming</h2>
          <p className="mt-1 text-sm text-slate-400">
            Quality control and billing.
          </p>
        </div>
      </div>
    </main>
  );
}

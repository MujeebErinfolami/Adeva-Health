import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { currentTenantId } from "@/lib/tenant";
import { listInstruments, listQCRuns } from "@/lib/qc";
import { recordQCAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function QCPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const [instruments, runs] = await Promise.all([
    listInstruments(tenantId),
    listQCRuns(tenantId),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Quality control</h1>
      <p className="mt-1 text-sm text-slate-500">
        Record control runs per instrument. Each run is checked against its
        target and logged for accreditation.
      </p>

      {/* Record a run */}
      <section className="mt-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800">Record a control run</h2>
        {instruments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No instruments registered yet.
          </p>
        ) : (
          <form action={recordQCAction} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-slate-600">Instrument</span>
                <select
                  name="instrumentId"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {instruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.make} {i.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Test code</span>
                <input
                  type="text"
                  name="testCode"
                  required
                  placeholder="e.g. FBS"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Control level</span>
                <input
                  type="text"
                  name="level"
                  required
                  placeholder="e.g. Level 1"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-slate-600">Target</span>
                  <input
                    type="number"
                    step="any"
                    name="expected"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-600">Observed</span>
                  <input
                    type="number"
                    step="any"
                    name="observed"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Record run
            </button>
          </form>
        )}
        <p className="mt-3 text-xs text-slate-400">
          A run passes if observed is within 10% of target. Levey-Jennings and
          Westgard rules are a later enhancement.
        </p>
      </section>

      {/* QC log */}
      <section className="mt-8">
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {runs.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">
              No control runs recorded yet.
            </li>
          )}
          {runs.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {r.testCode}
                  <span className="text-slate-400"> · {r.level}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {r.instrument.make} {r.instrument.model}
                  {r.expected != null && r.observed != null
                    ? ` · target ${r.expected}, observed ${r.observed}`
                    : ""}
                  {" · "}
                  {new Date(r.runAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  r.pass
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {r.pass ? "PASS" : "FAIL"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

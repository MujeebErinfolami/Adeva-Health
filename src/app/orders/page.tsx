import { listOrders, getOrderFormOptions } from "@/lib/orders";
import { currentTenantId } from "@/lib/tenant";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createOrderAction, cancelOrderAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-700",
  COLLECTED: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

function badge(status: string) {
  return STATUS_STYLE[status] ?? "bg-slate-100 text-slate-700";
}

const TERMINAL = new Set(["COMPLETED", "CANCELLED"]);

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const [orders, options] = await Promise.all([
    listOrders(tenantId),
    getOrderFormOptions(tenantId),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pre-register test orders. Collect a specimen from the Specimens page to advance an order.
      </p>

      {/* New order form */}
      <section className="mt-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800">New order</h2>

        {options.patients.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No patients registered yet.{" "}
            <a href="/patients" className="text-slate-900 underline">
              Register a patient
            </a>{" "}
            first.
          </p>
        ) : (
          <form action={createOrderAction} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-slate-600">Patient *</span>
                <select
                  name="patientId"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">— select —</option>
                  {options.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="text-slate-600">Collection site</span>
                <select
                  name="siteId"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">— select —</option>
                  {options.sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </label>

              {options.providers.length > 0 && (
                <label className="block text-sm">
                  <span className="text-slate-600">Referring provider</span>
                  <select
                    name="providerId"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">— none —</option>
                    {options.providers.map((pv) => (
                      <option key={pv.id} value={pv.id}>
                        {pv.name}{pv.clinic ? ` · ${pv.clinic}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <fieldset>
              <legend className="text-sm text-slate-600">Tests *</legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {options.tests.map((t) => (
                  <label
                    key={t.id}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    <input type="checkbox" name="testIds" value={t.id} />
                    <span>
                      {t.code}{" "}
                      <span className="text-slate-400">/ {t.name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Place order
            </button>
          </form>
        )}
      </section>

      {/* Order list */}
      <section className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No orders yet. Place one above.
          </p>
        ) : (
          orders.map((o) => (
            <article key={o.id} className="rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {o.patient.lastName}, {o.patient.firstName}
                    <span className="ml-2 font-mono text-xs text-slate-400">
                      {o.patient.mrn}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {o.items.map((i) => `${i.test.code} / ${i.test.name}`).join(" · ")}
                  </p>
                  {o.site && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Site: {o.site.name}
                    </p>
                  )}
                  {o.provider && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Referring: {o.provider.name}
                      {o.provider.clinic ? ` · ${o.provider.clinic}` : ""}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(o.status)}`}
                  >
                    {o.status.replace("_", " ")}
                  </span>
                  {!TERMINAL.has(o.status) && (
                    <form action={cancelOrderAction}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <button
                        type="submit"
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Linked specimens */}
              {o.specimens.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Specimens
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {o.specimens.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-md border border-slate-200 px-2.5 py-1 font-mono text-xs text-slate-600"
                      >
                        {s.barcode}{" "}
                        <span className="text-slate-400">· {s.status.replace("_", " ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Results summary */}
              {o.items.some((i) => i.result) && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Results
                  </p>
                  <ul className="space-y-1">
                    {o.items
                      .filter((i) => i.result)
                      .map((i) => (
                        <li key={i.id} className="flex items-center gap-3 text-xs">
                          <span className="font-medium text-slate-700">{i.test.code}</span>
                          <span className="text-slate-600">
                            {i.result!.value} {i.test.unit}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-medium ${
                              i.result!.flag.startsWith("CRITICAL")
                                ? "bg-rose-100 text-rose-800"
                                : i.result!.flag === "NORMAL"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {i.result!.flag.replace("_", " ")}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}

import {
  listSpecimens,
  listCollectableOrders,
  SPECIMEN_FLOW,
} from "@/lib/specimens";
import { currentTenantId } from "@/lib/tenant";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { collectSpecimenAction, advanceSpecimenAction, enterResultAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  COLLECTED: "bg-slate-100 text-slate-700",
  IN_TRANSIT: "bg-amber-100 text-amber-800",
  RECEIVED: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  RESULTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

function badge(status: string) {
  return STATUS_STYLE[status] ?? "bg-slate-100 text-slate-700";
}

const FLAG_STYLE: Record<string, string> = {
  NORMAL: "bg-emerald-100 text-emerald-800",
  LOW: "bg-amber-100 text-amber-800",
  HIGH: "bg-amber-100 text-amber-800",
  CRITICAL_LOW: "bg-rose-100 text-rose-800",
  CRITICAL_HIGH: "bg-rose-100 text-rose-800",
  ABNORMAL: "bg-amber-100 text-amber-800",
};

function flagBadge(flag: string) {
  return FLAG_STYLE[flag] ?? "bg-slate-100 text-slate-700";
}

function isFinal(status: string) {
  return status === "RESULTED" || status === "REJECTED";
}

export default async function SpecimensPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const [specimens, collectable] = await Promise.all([
    listSpecimens(tenantId),
    listCollectableOrders(tenantId),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Specimens</h1>
      <p className="mt-1 text-sm text-slate-500">
        Collect a specimen against an order placed on the Orders page, then
        advance it through its journey. Each step writes a chain-of-custody event.
      </p>

      {/* Awaiting collection */}
      <section className="mt-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800">Awaiting collection</h2>
        {collectable.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No orders awaiting collection.{" "}
            <a href="/orders" className="text-slate-900 underline">
              Place an order
            </a>{" "}
            first.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {collectable.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {o.patient.lastName}, {o.patient.firstName}
                    <span className="ml-2 font-mono text-xs text-slate-400">
                      {o.patient.mrn}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {o.items.map((i) => i.test.code).join(", ")}
                    {o.site ? ` · ${o.site.name}` : ""}
                  </p>
                </div>
                <form action={collectSpecimenAction}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Collect specimen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Specimen list */}
      <section className="mt-8 space-y-4">
        {specimens.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No specimens yet. Create one above.
          </p>
        )}

        {specimens.map((s) => (
          <article key={s.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {s.barcode}
                </p>
                <p className="text-sm text-slate-500">
                  {s.order.patient.lastName}, {s.order.patient.firstName}
                  {s.currentSite ? ` · at ${s.currentSite.name}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {s.order.items.map((i) => i.test.code).join(", ")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(
                    s.status
                  )}`}
                >
                  {s.status.replace("_", " ")}
                </span>
                {!isFinal(s.status) && (
                  <form action={advanceSpecimenAction}>
                    <input type="hidden" name="specimenId" value={s.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Advance &rarr;
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Results
              </p>
              <ul className="space-y-2">
                {s.order.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="w-24 font-medium text-slate-700">
                      {item.test.code}
                      <span className="text-slate-400">
                        {item.test.unit ? ` ${item.test.unit}` : ""}
                      </span>
                    </span>
                    <form action={enterResultAction} className="flex items-center gap-2">
                      <input type="hidden" name="orderItemId" value={item.id} />
                      <input
                        type="text"
                        name="value"
                        defaultValue={item.result?.value ?? ""}
                        placeholder="value"
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Save
                      </button>
                    </form>
                    {item.result && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${flagBadge(
                          item.result.flag
                        )}`}
                      >
                        {item.result.flag.replace("_", " ")}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      ref {item.test.refLow ?? "-"} to {item.test.refHigh ?? "-"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chain of custody */}
            <ol className="mt-4 border-t border-slate-100 pt-3 text-sm">
              {s.events.map((e) => (
                <li key={e.id} className="flex items-baseline gap-3 py-1">
                  <span className="font-mono text-xs text-slate-400">
                    {new Date(e.createdAt).toLocaleString()}
                  </span>
                  <span className="font-medium text-slate-700">
                    {e.status.replace("_", " ")}
                  </span>
                  <span className="text-slate-500">{e.note}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>

      <p className="mt-8 text-center text-xs text-slate-400">
        Flow: {SPECIMEN_FLOW.join(" -> ")}
      </p>
    </main>
  );
}

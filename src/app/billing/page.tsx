import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { currentTenantId } from "@/lib/tenant";
import { listOrderCharges } from "@/lib/billing";

export const dynamic = "force-dynamic";

function ngn(n: number) {
  return `\u20A6${n.toLocaleString()}`;
}

export default async function BillingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const orders = await listOrderCharges(tenantId);
  const grand = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Charges per order, derived from test prices.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total billed</p>
          <p className="text-lg font-semibold text-slate-900">{ngn(grand)}</p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        {orders.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No orders yet.
          </p>
        )}

        {orders.map((o) => (
          <article key={o.id} className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {o.patient.lastName}, {o.patient.firstName}
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {o.patient.mrn}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {ngn(o.total)}
              </p>
            </div>

            <ul className="mt-3 border-t border-slate-100 pt-2 text-sm">
              {o.lines.map((l, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between py-1 text-slate-600"
                >
                  <span>
                    {l.code} <span className="text-slate-400">{l.name}</span>
                  </span>
                  <span>{ngn(l.price)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <p className="mt-6 text-center text-xs text-slate-400">
        Payment tracking (invoices, payments, balances) is a later enhancement
        that needs new models.
      </p>
    </main>
  );
}

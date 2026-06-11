import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { currentTenantId } from "@/lib/tenant";
import { getOrderReport, canRelease } from "@/lib/results";
import { releaseResultsAction } from "../actions";
import { PrintButton } from "../PrintButton";

export const dynamic = "force-dynamic";

const FLAG_STYLE: Record<string, string> = {
  NORMAL: "text-emerald-700",
  LOW: "text-amber-700",
  HIGH: "text-amber-700",
  CRITICAL_LOW: "text-rose-700 font-semibold",
  CRITICAL_HIGH: "text-rose-700 font-semibold",
  ABNORMAL: "text-amber-700",
};

function fmt(d: Date | null | undefined) {
  return d ? new Date(d).toLocaleString() : "—";
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const order = await getOrderReport(tenantId, orderId);
  if (!order) notFound();

  const releasable = order.items.filter(
    (i) => i.result?.status === "VALIDATED"
  ).length;
  const allowRelease = canRelease(session.user.role) && releasable > 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@media print { header, .no-print { display: none !important; } body { background: #fff !important; } } @page { margin: 16mm; }",
        }}
      />

      <div className="mb-4 flex items-center justify-between no-print">
        <a href="/reports" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; All reports
        </a>
        <div className="flex items-center gap-2">
          {allowRelease && (
            <form action={releaseResultsAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Release {releasable} result{releasable === 1 ? "" : "s"}
              </button>
            </form>
          )}
          <PrintButton />
        </div>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-8">
        {/* Lab header */}
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-lg font-semibold text-slate-900">
            {order.tenant.legalName ?? order.tenant.name}
          </h1>
          <p className="text-xs text-slate-500">
            {order.tenant.address ?? ""}
            {order.tenant.mlscnNumber ? ` · MLSCN ${order.tenant.mlscnNumber}` : ""}
          </p>
          {order.tenant.labDirector && (
            <p className="text-xs text-slate-500">
              Laboratory director: {order.tenant.labDirector}
            </p>
          )}
        </header>

        {/* Patient and order meta */}
        <section className="grid grid-cols-2 gap-4 py-4 text-sm">
          <div>
            <p className="text-slate-400">Patient</p>
            <p className="font-medium text-slate-900">
              {order.patient.lastName}, {order.patient.firstName}
            </p>
            <p className="text-slate-500">
              {order.patient.mrn}
              {order.patient.sex ? ` · ${order.patient.sex}` : ""}
              {order.patient.dob
                ? ` · DOB ${new Date(order.patient.dob).toLocaleDateString()}`
                : ""}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Order</p>
            <p className="text-slate-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            {order.provider && (
              <p className="text-slate-500">
                Referred by {order.provider.name}
                {order.provider.clinic ? `, ${order.provider.clinic}` : ""}
              </p>
            )}
            {order.site && <p className="text-slate-500">{order.site.name}</p>}
          </div>
        </section>

        {/* Results table */}
        <table className="w-full border-t border-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2">Test</th>
              <th className="py-2">Result</th>
              <th className="py-2">Reference</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => {
              const r = item.result;
              const flag = r?.flag ?? "NORMAL";
              return (
                <tr key={item.id}>
                  <td className="py-2 pr-3">
                    <span className="font-medium text-slate-800">
                      {item.test.code}
                    </span>
                    <span className="text-slate-400"> {item.test.name}</span>
                  </td>
                  <td className={`py-2 pr-3 ${FLAG_STYLE[flag] ?? ""}`}>
                    {r?.value ?? "—"}
                    {r?.unit ? ` ${r.unit}` : ""}
                    {r && flag !== "NORMAL" ? ` (${flag.replace("_", " ")})` : ""}
                  </td>
                  <td className="py-2 pr-3 text-slate-500">
                    {item.test.refLow ?? "-"} to {item.test.refHigh ?? "-"}
                    {item.test.unit ? ` ${item.test.unit}` : ""}
                  </td>
                  <td className="py-2 text-slate-500">
                    {r ? r.status : "PENDING"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <footer className="mt-6 border-t border-slate-200 pt-3 text-xs text-slate-400">
          <p>
            Report generated {new Date().toLocaleString()}. Results shown as
            PENDING or VALIDATED are provisional and not yet released.
          </p>
        </footer>
      </article>
    </main>
  );
}

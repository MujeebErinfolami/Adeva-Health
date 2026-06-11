import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { currentTenantId } from "@/lib/tenant";
import { listOrdersForReports } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const orders = await listOrdersForReports(tenantId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Open an order to view its report and release results.
      </p>

      <ul className="mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {orders.length === 0 && (
          <li className="p-6 text-center text-sm text-slate-500">
            No orders yet.
          </li>
        )}
        {orders.map((o) => {
          const total = o.items.length;
          const released = o.items.filter(
            (i) => i.result?.status === "RELEASED"
          ).length;
          return (
            <li key={o.id}>
              <a
                href={`/reports/${o.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {o.patient.lastName}, {o.patient.firstName}
                    <span className="text-slate-400"> · {o.patient.mrn}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                    {o.items.map((i) => i.test.code).join(", ")}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {released}/{total} released
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

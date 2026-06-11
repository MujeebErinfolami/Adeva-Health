import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { currentTenantId } from "@/lib/tenant";
import { listInventory } from "@/lib/inventory";
import { addInventoryAction, adjustInventoryAction } from "./actions";

export const dynamic = "force-dynamic";

const LOW_STOCK = 5;
const DAY = 24 * 60 * 60 * 1000;

function expiryFlag(
  expiresAt: Date | null
): { label: string; cls: string } | null {
  if (!expiresAt) return null;
  const t = new Date(expiresAt).getTime();
  const now = Date.now();
  if (t < now) return { label: "Expired", cls: "bg-rose-100 text-rose-800" };
  if (t < now + 30 * DAY)
    return { label: "Expiring soon", cls: "bg-amber-100 text-amber-800" };
  return null;
}

export default async function InventoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const items = await listInventory(tenantId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track reagents and consumables by lot and expiry. Low stock and expiring
        lots are flagged.
      </p>

      {/* Add item */}
      <section className="mt-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800">Add item</h2>
        <form action={addInventoryAction} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-600">Item name *</span>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Glucose reagent"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Lot number</span>
              <input
                type="text"
                name="lotNumber"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Quantity</span>
              <input
                type="number"
                name="quantity"
                min="0"
                defaultValue={0}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Expiry date</span>
              <input
                type="date"
                name="expiresAt"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add item
          </button>
        </form>
      </section>

      {/* Stock list */}
      <section className="mt-8">
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {items.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">
              No inventory yet. Add an item above.
            </li>
          )}
          {items.map((item) => {
            const flag = expiryFlag(item.expiresAt);
            const low = item.quantity <= LOW_STOCK;
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.name}
                    {item.lotNumber ? (
                      <span className="ml-2 font-mono text-xs text-slate-400">
                        lot {item.lotNumber}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    {item.expiresAt
                      ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}`
                      : "No expiry set"}
                    {flag && (
                      <span className={`rounded-full px-2 py-0.5 ${flag.cls}`}>
                        {flag.label}
                      </span>
                    )}
                    {low && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                        Low stock
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={adjustInventoryAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="delta" value="-1" />
                    <button
                      type="submit"
                      className="h-7 w-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      &minus;
                    </button>
                  </form>
                  <span className="w-8 text-center font-medium text-slate-900">
                    {item.quantity}
                  </span>
                  <form action={adjustInventoryAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="delta" value="1" />
                    <button
                      type="submit"
                      className="h-7 w-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

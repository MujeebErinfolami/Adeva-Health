import { listPatients } from "@/lib/patients";
import { currentTenantId } from "@/lib/tenant";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createPatientAction, deletePatientAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantId = await currentTenantId();
  const patients = await listPatients(tenantId);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
      <p className="mt-1 text-sm text-slate-500">
        Register patients and manage their demographic records.
      </p>

      {/* New patient form */}
      <section className="mt-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800">New patient</h2>
        <form action={createPatientAction} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-600">First name *</span>
              <input
                type="text"
                name="firstName"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Last name *</span>
              <input
                type="text"
                name="lastName"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Date of birth</span>
              <input
                type="date"
                name="dob"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Sex</span>
              <select
                name="sex"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— select —</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Phone</span>
              <input
                type="tel"
                name="phone"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Email</span>
              <input
                type="email"
                name="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Register patient
          </button>
        </form>
      </section>

      {/* Patient list */}
      <section className="mt-8">
        {patients.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No patients yet. Register one above.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">MRN</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">DOB</th>
                  <th className="px-4 py-3 text-left">Sex</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Orders</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.mrn}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.lastName}, {p.firstName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.dob ? new Date(p.dob).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.sex ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{p.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{p._count.orders}</td>
                    <td className="px-4 py-3 text-right">
                      {p._count.orders === 0 && (
                        <form action={deletePatientAction}>
                          <input type="hidden" name="patientId" value={p.id} />
                          <button
                            type="submit"
                            className="text-xs text-rose-500 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

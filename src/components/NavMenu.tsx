"use client";

import { useState } from "react";

const PRIMARY = [
  { href: "/patients", label: "Patients" },
  { href: "/orders", label: "Orders" },
  { href: "/specimens", label: "Specimens" },
  { href: "/reports", label: "Reports" },
];

const MORE = [
  { href: "/qc", label: "QC" },
  { href: "/inventory", label: "Inventory" },
  { href: "/billing", label: "Billing" },
];

const linkCls =
  "rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100";

export function NavMenu() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="flex items-center gap-1 text-sm">
      {PRIMARY.map((l) => (
        <a key={l.href} href={l.href} className={linkCls}>
          {l.label}
        </a>
      ))}
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className={linkCls}>
          More
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-md">
            {MORE.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block px-3 py-1.5 text-slate-600 hover:bg-slate-100"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

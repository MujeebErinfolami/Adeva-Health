"use client";

import Link from "next/link";

const C = {
  graphite: "#202020",
  white:    "#ffffff",
  mist:     "#efefef",
  pearl:    "#e8e8e8",
  shale:    "#4d4d4d",
  silver:   "#828282",
  orange:   "#ff682c",
} as const;

const GROTESK = "'Space Grotesk', system-ui, sans-serif";
const INTER   = "'Inter', system-ui, -apple-system, sans-serif";
const MONTSERRAT = "var(--font-montserrat, 'Montserrat'), system-ui, -apple-system, sans-serif";

const FEATURES = [
  {
    title: "Specimen barcode tracking with chain of custody",
    desc:  "Every scan is timestamped and tied to a named user. Full chain of custody from collection through to result release.",
  },
  {
    title: "Result entry with automatic reference range flagging",
    desc:  "Normal ranges are applied automatically. Out-of-range values are highlighted before a technician can proceed.",
  },
  {
    title: "Delta checks and Westgard QC before every sign-off",
    desc:  "Previous patient values and QC rules run in the background, catching anomalies before they reach the report.",
  },
  {
    title: "Role-gated result release with electronic signature",
    desc:  "Only authorised staff can validate and release results. Every sign-off is recorded with a user and timestamp.",
  },
];

const eyebrow: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.orange,
  marginBottom: "20px",
};

export default function LIS247Page() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: C.mist, minHeight: "100vh", fontFamily: INTER }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "4px", background: C.orange, display: "block", flexShrink: 0 }} />
            <span style={{ fontFamily: GROTESK, fontWeight: 600, fontSize: "14px", color: C.graphite }}>Adeva Health</span>
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: "13px", fontWeight: 500, color: C.graphite, textDecoration: "none",
              padding: "8px 20px", borderRadius: "20px", border: `1.5px solid ${C.graphite}`,
              fontFamily: MONTSERRAT, lineHeight: 1,
            }}
          >
            Log in
          </Link>
        </nav>

        {/* Hero */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
            <p style={eyebrow}>Product</p>
            <h1
              style={{
                fontFamily: GROTESK,
                fontSize: "clamp(48px, 7vw, 72px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 0.91,
                color: C.graphite,
                marginBottom: "28px",
              }}
            >
              LIS 24/7
            </h1>
            <p style={{ fontSize: "20px", fontWeight: 500, color: C.shale, lineHeight: 1.3, marginBottom: "16px" }}>
              The complete specimen-to-report workflow for lab staff
            </p>
            <p style={{ fontSize: "16px", color: C.silver, maxWidth: "520px", lineHeight: 1.6, marginBottom: "40px" }}>
              From patient registration to result release, LIS 24/7 gives your bench team the tools to work faster, flag errors earlier, and sign off with confidence.
            </p>
            <a
              href="mailto:hello@adevahealth.com"
              style={{
                display: "inline-block", padding: "12px 26px", borderRadius: "20px",
                background: C.graphite, color: C.white, fontSize: "14px", fontWeight: 500,
                textDecoration: "none", fontFamily: MONTSERRAT, lineHeight: 1,
              }}
            >
              Book a Demo →
            </a>
          </div>
        </section>

        {/* Features */}
        <section style={{ background: C.white, padding: "80px 24px" }}>
          <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.silver, marginBottom: "40px" }}>
              What&apos;s included
            </p>
            <div className="product-grid">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{ background: C.white, border: `1px solid ${C.pearl}`, borderRadius: "8px", padding: "32px" }}
                >
                  <span style={{ display: "block", width: "8px", height: "8px", borderRadius: "50%", background: C.orange, marginBottom: "16px" }} />
                  <p style={{ fontSize: "15px", fontWeight: 600, color: C.graphite, lineHeight: 1.4, marginBottom: "8px" }}>{f.title}</p>
                  <p style={{ fontSize: "14px", color: C.silver, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: C.white, borderTop: `1px solid ${C.pearl}`, padding: "32px 24px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: C.silver }}>© 2026 Adeva Health. Built by Intasect Studio.</p>
        </footer>

      </div>
    </>
  );
}

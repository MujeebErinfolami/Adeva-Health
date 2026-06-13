"use client";

import React, { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   VENTRILOC DESIGN TOKENS
═══════════════════════════════════════════════════════════════════════════ */
const C = {
  graphite: "#202020",
  white:    "#ffffff",
  mist:     "#efefef",
  whisper:  "#f5f5f5",
  ivory:    "#ebe6dd",
  shale:    "#4d4d4d",
  silver:   "#828282",
  pearl:    "#e8e8e8",
  orange:   "#ff682c",
  gold:     "#816729",
} as const;

const FONT = "var(--font-montserrat, 'Montserrat'), system-ui, -apple-system, sans-serif";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY STYLE OBJECTS
═══════════════════════════════════════════════════════════════════════════ */
const Ty = {
  display: {
    fontFamily: FONT,
    fontSize: "clamp(42px, 5.5vw, 66px)",
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    fontWeight: 700,
    color: C.graphite,
  } as React.CSSProperties,

  heading: {
    fontFamily: FONT,
    fontSize: "40px",
    lineHeight: 1.13,
    letterSpacing: "-0.8px",
    fontWeight: 700,
    color: C.graphite,
  } as React.CSSProperties,

  headingSm: {
    fontFamily: FONT,
    fontSize: "32px",
    lineHeight: 1.19,
    letterSpacing: "-0.64px",
    fontWeight: 700,
    color: C.graphite,
  } as React.CSSProperties,

  body: {
    fontSize: "15px",
    lineHeight: 1.5,
    color: C.shale,
  } as React.CSSProperties,

  caption: {
    fontSize: "12px",
    lineHeight: 1.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: C.silver,
  } as React.CSSProperties,
};

/* ═══════════════════════════════════════════════════════════════════════════
   FADE-IN HOOK + COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.07 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return {
    ref,
    fadeStyle: {
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    } as React.CSSProperties,
  };
}

function Fade({
  children,
  delay = 0,
  className = "",
  style: xStyle = {},
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, fadeStyle } = useFade(delay);
  return (
    <div ref={ref} style={{ ...fadeStyle, ...xStyle }} className={className}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════════════════ */
const DROPDOWN_ITEMS = [
  { label: "For Lab Staff",  href: "#features" },
  { label: "For Lab Admins", href: "#features" },
  { label: "For Patients",   href: "#features" },
  { label: "Platform",       href: "#features" },
];

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        fontSize: "13px",
        color: C.shale,
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: "20px",
        transition: "background 0.15s, color 0.15s",
        whiteSpace: "nowrap" as const,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = C.whisper;
        (e.currentTarget as HTMLAnchorElement).style.color = C.graphite;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        (e.currentTarget as HTMLAnchorElement).style.color = C.shale;
      }}
    >
      {children}
    </a>
  );
}

function Nav() {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav style={{ padding: "20px 16px" }}>
      <div
        style={{
          maxWidth: "940px",
          margin: "0 auto",
          background: C.white,
          border: `1px solid ${C.pearl}`,
          borderRadius: "40px",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Wordmark */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "5px",
              background: C.orange,
              display: "block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "14px",
              color: C.graphite,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Adeva Health
          </span>
        </a>

        {/* Center links — desktop only */}
        <div
          className="hidden md:flex"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: "2px" }}
        >
          {/* Features dropdown */}
          <div ref={dropRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropOpen((p) => !p)}
              style={{
                fontSize: "13px",
                color: dropOpen ? C.graphite : C.shale,
                background: dropOpen ? C.whisper : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "inherit",
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = C.whisper;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = dropOpen
                  ? C.whisper
                  : "transparent";
              }}
            >
              Features
              <span
                style={{
                  fontSize: "9px",
                  display: "inline-block",
                  transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  marginTop: "1px",
                }}
              >
                ▾
              </span>
            </button>

            {dropOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: C.white,
                  border: `1px solid ${C.pearl}`,
                  borderRadius: "12px",
                  padding: "6px",
                  minWidth: "196px",
                  boxShadow: "0 8px 24px rgba(32,32,32,0.08)",
                  zIndex: 100,
                  animation: "adDropIn 0.18s ease forwards",
                }}
              >
                {DROPDOWN_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setDropOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 12px",
                      fontSize: "13px",
                      color: C.shale,
                      textDecoration: "none",
                      borderRadius: "8px",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = C.whisper;
                      (e.currentTarget as HTMLAnchorElement).style.color = C.graphite;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = C.shale;
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#accreditation">Accreditation</NavLink>
        </div>

        {/* Right CTAs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "auto",
          }}
        >
          <a
            href="/login"
            className="hidden md:block"
            style={{
              fontSize: "13px",
              color: C.graphite,
              textDecoration: "none",
              padding: "7px 18px",
              borderRadius: "20px",
              border: `1.5px solid ${C.graphite}`,
              transition: "background 0.15s",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = C.whisper;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            Log in
          </a>
          <a
            href="mailto:hello@adevahealth.com"
            style={{
              fontSize: "13px",
              color: C.white,
              textDecoration: "none",
              padding: "7px 18px",
              borderRadius: "20px",
              background: C.graphite,
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
              lineHeight: 1,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
            }}
          >
            Book a Demo
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPECIMEN LIFECYCLE CARD (Hero right column)
═══════════════════════════════════════════════════════════════════════════ */
const STEPS = [
  { key: "collected",    label: "COLLECTED" },
  { key: "transit",     label: "IN TRANSIT" },
  { key: "received",    label: "RECEIVED" },
  { key: "progress",    label: "IN PROGRESS" },
  { key: "resulted",    label: "RESULTED" },
] as const;

type StepKey = typeof STEPS[number]["key"];
const ACTIVE: StepKey = "progress";

function SpecimenCard() {
  const activeIdx = STEPS.findIndex((s) => s.key === ACTIVE);

  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.pearl}`,
        borderRadius: "12px",
        padding: "28px 24px",
        boxShadow: "0 4px 32px rgba(32,32,32,0.07)",
      }}
    >
      {/* Card header */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: C.orange,
              display: "inline-block",
              animation: "adPulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ ...Ty.caption, color: C.orange }}>Live tracking</span>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: "15px",
            fontWeight: 600,
            color: C.graphite,
            letterSpacing: "-0.01em",
          }}
        >
          Specimen #ADV-20241813
        </div>
        <div style={{ ...Ty.caption, marginTop: "3px" }}>
          Malaria RDT · FBC panel
        </div>
      </div>

      {/* Lifecycle steps */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {STEPS.map((step, i) => {
          const isActive = step.key === ACTIVE;
          const isPast   = i < activeIdx;

          return (
            <React.Fragment key={step.key}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "56px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: isActive ? C.orange : isPast ? C.graphite : C.pearl,
                    boxShadow: isActive ? `0 0 0 4px rgba(255,104,44,0.18)` : "none",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: isActive ? C.orange : isPast ? C.graphite : C.silver,
                    textAlign: "center",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: i < activeIdx ? C.graphite : C.pearl,
                    marginTop: "4px",
                    minWidth: "10px",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: C.pearl, marginBottom: "16px" }} />

      {/* Result row */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 72px 72px",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          {["Patient", "Test", "Value", "Flag"].map((col) => (
            <span key={col} style={{ ...Ty.caption }}>{col}</span>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 72px 72px",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: C.graphite,
            }}
          >
            Fatima Bello
          </span>
          <span style={{ fontSize: "13px", color: C.shale }}>HbA1c</span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: C.graphite,
              fontFamily: FONT,
            }}
          >
            6.1%
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#1a6b1a",
              background: "#f0faf0",
              borderRadius: "20px",
              padding: "3px 8px",
              textAlign: "center",
              display: "inline-block",
            }}
          >
            Normal
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════════════════ */
function PillBtn({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "filled" | "outlined";
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 26px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "opacity 0.15s, background 0.15s",
    lineHeight: 1,
    cursor: "pointer",
  };

  if (variant === "filled") {
    return (
      <a
        href={href}
        style={{ ...base, background: C.graphite, color: C.white }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.82"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      style={{ ...base, background: "transparent", color: C.graphite, border: `1.5px solid ${C.graphite}` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = C.whisper; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section style={{ padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left */}
          <Fade>
            <div>
              <p
                style={{
                  ...Ty.caption,
                  color: C.orange,
                  marginBottom: "18px",
                }}
              >
                Laboratory Information System · Lagos
              </p>
              <h1
                style={{
                  ...Ty.display,
                  marginBottom: "24px",
                }}
              >
                Accelerating<br />
                lab efficiency<br />
                through analytics.
              </h1>
              <p
                style={{
                  ...Ty.body,
                  fontSize: "16px",
                  maxWidth: "430px",
                  marginBottom: "36px",
                }}
              >
                Adeva Health gives Lagos mid-tier independent labs
                enterprise-grade tools — specimen tracking, result workflows,
                accreditation readiness — on a simple monthly lease.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <PillBtn href="mailto:hello@adevahealth.com" variant="filled">
                  Book a Demo →
                </PillBtn>
                <PillBtn href="#how-it-works" variant="outlined">
                  See how it works ↓
                </PillBtn>
              </div>
            </div>
          </Fade>

          {/* Right */}
          <Fade delay={160}>
            <SpecimenCard />
          </Fade>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROBLEM BAND
═══════════════════════════════════════════════════════════════════════════ */
const PROBLEMS = [
  {
    title: "Paper-based chaos",
    body: "Manual logbooks, lost samples, and untrackable results. When something goes wrong there is no audit trail — only confusion and blame.",
  },
  {
    title: "Accreditation out of reach",
    body: "MLSCN mandates digital records, QC documentation, and audit trails. Most labs lack the systems — and the budget — to comply.",
  },
  {
    title: "Built for the wrong market",
    body: "Foreign LIS platforms assume reliable power, stable internet, and in-house IT teams. Lagos labs need software built for their reality.",
  },
];

function ProblemBand() {
  return (
    <section style={{ background: C.mist, padding: "80px 24px" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <Fade>
          <p style={{ ...Ty.caption, marginBottom: "12px" }}>The Problem</p>
          <h2 style={{ ...Ty.headingSm, marginBottom: "40px", maxWidth: "460px" }}>
            The reality of running a lab in Lagos
          </h2>
        </Fade>
        <div className="grid md:grid-cols-3 gap-5">
          {PROBLEMS.map((p, i) => (
            <Fade key={p.title} delay={i * 80}>
              <div
                style={{
                  background: C.white,
                  borderRadius: "8px",
                  padding: "32px",
                  height: "100%",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.graphite,
                    letterSpacing: "-0.02em",
                    marginBottom: "12px",
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ ...Ty.body }}>{p.body}</p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════ */
const HOW_STEPS = [
  {
    num: "01",
    title: "Register patients & orders",
    body: "Capture patient demographics once. Pre-register test orders from a referring doctor or walk-in. Barcode labels print immediately.",
  },
  {
    num: "02",
    title: "Track specimens in real time",
    body: "Every scan advances the specimen lifecycle — collected, in transit, received, in progress, resulted. Your whole team always knows where it is.",
  },
  {
    num: "03",
    title: "Report results with confidence",
    body: "Delta checks, Westgard QC rules, and auto-verification flag anomalies before sign-off. Structured printable reports are ready in seconds.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{ background: C.white, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <Fade>
          <p style={{ ...Ty.caption, marginBottom: "12px" }}>Process</p>
          <h2 style={{ ...Ty.headingSm, marginBottom: "48px", maxWidth: "400px" }}>
            Three steps to a smarter lab
          </h2>
        </Fade>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {HOW_STEPS.map((step, i) => (
            <Fade key={step.num} delay={i * 100}>
              <div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: "40px",
                    fontWeight: 700,
                    color: C.orange,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    marginBottom: "20px",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: FONT,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: C.graphite,
                    letterSpacing: "-0.02em",
                    marginBottom: "12px",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ ...Ty.body }}>{step.body}</p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES BY ROLE
═══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    role: "Lab Staff",
    sub: "Technicians · Phlebotomists",
    items: [
      "Quick order entry from patient record",
      "Specimen barcode scanning & lifecycle tracking",
      "Result entry with auto reference-range flagging",
      "Delta-check alerts before sign-off",
    ],
  },
  {
    role: "Lab Admin",
    sub: "Owners · Managers",
    items: [
      "Real-time turnaround-time dashboard",
      "Staff performance & workload analytics",
      "Revenue, billing, and payer reports",
      "Inventory and reagent consumption tracking",
    ],
  },
  {
    role: "Patients",
    sub: "Patients · Referring Doctors",
    items: [
      "Secure online access to results",
      "SMS and email result notifications",
      "Historical result trend view",
      "Direct booking via referring doctor",
    ],
  },
  {
    role: "Platform",
    sub: "Infrastructure · Compliance",
    items: [
      "Leased SaaS — no hardware to buy or manage",
      "Multi-tenant, built for Nigerian labs",
      "MLSCN-aligned tamper-evident audit log",
      "Designed for variable connectivity environments",
    ],
  },
];

function FeaturesGrid() {
  return (
    <section
      id="features"
      style={{ background: C.whisper, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <Fade>
          <p style={{ ...Ty.caption, marginBottom: "12px" }}>Features</p>
          <h2 style={{ ...Ty.headingSm, marginBottom: "48px", maxWidth: "420px" }}>
            Built for every person in the lab
          </h2>
        </Fade>
        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <Fade key={f.role} delay={i * 80}>
              <div
                style={{
                  background: C.white,
                  borderRadius: "8px",
                  padding: "32px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontFamily: FONT,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: C.graphite,
                      letterSpacing: "-0.02em",
                      marginBottom: "4px",
                    }}
                  >
                    {f.role}
                  </h3>
                  <p style={{ ...Ty.caption }}>{f.sub}</p>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {f.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: C.orange,
                          fontSize: "14px",
                          marginTop: "1px",
                          flexShrink: 0,
                          fontWeight: 700,
                        }}
                      >
                        —
                      </span>
                      <span style={{ ...Ty.body, fontSize: "14px" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCREDITATION HOOK
═══════════════════════════════════════════════════════════════════════════ */
const ACC_POINTS = [
  "Structured audit logs with tamper-evident hash-chain integrity — every action is verifiable.",
  "Automated delta-check and Westgard QC rules active on every result before sign-off.",
  "Pre-formatted reports aligned to MLSCN documentation standards, printable in one click.",
];

function AccreditationHook() {
  return (
    <section
      id="accreditation"
      style={{ background: C.white, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <Fade>
          <div
            style={{
              border: `1px solid ${C.pearl}`,
              borderRadius: "8px",
              padding: "clamp(32px, 5vw, 56px)",
            }}
          >
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Left */}
              <div>
                <p
                  style={{
                    ...Ty.caption,
                    color: C.orange,
                    marginBottom: "12px",
                  }}
                >
                  MLSCN Readiness
                </p>
                <h2
                  style={{
                    ...Ty.headingSm,
                    marginBottom: "16px",
                  }}
                >
                  Accreditation compliance,<br />
                  built in from day one.
                </h2>
                <p style={{ ...Ty.body }}>
                  Most Lagos labs fail accreditation audits not because their
                  science is wrong — but because they lack the digital
                  infrastructure to prove it. Adeva Health gives you that
                  infrastructure.
                </p>
              </div>

              {/* Right */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {ACC_POINTS.map((pt) => (
                  <li
                    key={pt}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(255,104,44,0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      <span
                        style={{
                          color: C.orange,
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    </span>
                    <span style={{ ...Ty.body, fontSize: "14px" }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CTA BAND
═══════════════════════════════════════════════════════════════════════════ */
function CTABand() {
  return (
    <section
      style={{ background: C.graphite, padding: "80px 24px" }}
    >
      <div
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <Fade>
          <h2
            style={{
              fontFamily: FONT,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              color: C.white,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Ready to modernise your lab?
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: C.silver,
              maxWidth: "480px",
              margin: "0 auto 36px",
            }}
          >
            Join labs across Lagos on a platform built for the realities of
            Nigerian healthcare.
          </p>
          <a
            href="mailto:hello@adevahealth.com"
            style={{
              display: "inline-block",
              padding: "13px 28px",
              borderRadius: "20px",
              border: "1.5px solid rgba(255,255,255,0.28)",
              color: C.white,
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              background: "rgba(255,255,255,0.07)",
              transition: "background 0.15s, border-color 0.15s",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(255,255,255,0.14)";
              el.style.borderColor = "rgba(255,255,255,0.55)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = "rgba(255,255,255,0.07)";
              el.style.borderColor = "rgba(255,255,255,0.28)";
            }}
          >
            Book a Demo →
          </a>
        </Fade>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════ */
const FOOTER_LINKS = [
  { label: "Features",       href: "#features" },
  { label: "How It Works",   href: "#how-it-works" },
  { label: "Accreditation",  href: "#accreditation" },
  { label: "Log in",         href: "/login" },
  { label: "Book a Demo",    href: "mailto:hello@adevahealth.com" },
];

function Footer() {
  return (
    <footer
      style={{
        background: C.white,
        borderTop: `1px solid ${C.pearl}`,
        padding: "36px 24px",
      }}
    >
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Logo */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                background: C.orange,
                display: "block",
              }}
            />
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "13px",
                color: C.graphite,
                letterSpacing: "-0.02em",
              }}
            >
              Adeva Health
            </span>
          </a>

          {/* Links */}
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 20px",
            }}
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "13px",
                  color: C.silver,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = C.graphite;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = C.silver;
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p
            style={{
              ...Ty.caption,
              color: C.silver,
              letterSpacing: "0.04em",
              textTransform: "none",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            © {new Date().getFullYear()} Adeva Health
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div style={{ background: C.white, minHeight: "100vh" }}>
      <style>{`
        @keyframes adDropIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes adPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
      <Nav />
      <Hero />
      <ProblemBand />
      <HowItWorks />
      <FeaturesGrid />
      <AccreditationHook />
      <CTABand />
      <Footer />
    </div>
  );
}

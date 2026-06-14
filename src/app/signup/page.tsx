"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

const C = {
  graphite: "#202020",
  white: "#ffffff",
  mist: "#efefef",
  whisper: "#f5f5f5",
  pearl: "#e8e8e8",
  shale: "#4d4d4d",
  silver: "#828282",
  orange: "#ff682c",
};

const FONT = "var(--font-montserrat, 'Montserrat'), system-ui, -apple-system, sans-serif";

const PRODUCTS = [
  { key: "lis247", label: "LIS 247", sub: "Full laboratory workflow" },
  { key: "console", label: "Console", sub: "Admin & configuration" },
  { key: "patient-alley", label: "Patient Alley", sub: "Patient-facing portal" },
  { key: "adeva-hub", label: "AdevaHub", sub: "Multi-site command centre" },
];

type Step = 1 | 2 | 3 | 4 | 5 | "done";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function BackArrow({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: C.shale,
        fontFamily: FONT,
        fontSize: 13,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8l4-4" stroke={C.shale} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i + 1 === current ? C.graphite : i + 1 < current ? C.shale : C.pearl,
            transition: "all 0.2s",
          }}
        />
      ))}
    </div>
  );
}

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [labName, setLabName] = useState("");
  const [product, setProduct] = useState("");
  const [pwError, setPwError] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${C.pearl}`,
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
    fontFamily: FONT,
    color: C.graphite,
    outline: "none",
    boxSizing: "border-box",
    background: C.white,
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: C.shale,
    marginBottom: 6,
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 40,
    border: "none",
    background: C.graphite,
    color: C.white,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: FONT,
    cursor: "pointer",
    transition: "opacity 0.15s",
    marginTop: 8,
  };

  function validateStep1() {
    return email.includes("@");
  }

  function validateStep2() {
    if (password.length < 8) { setPwError("Password must be at least 8 characters."); return false; }
    if (password !== confirm) { setPwError("Passwords don't match."); return false; }
    setPwError("");
    return true;
  }

  function next() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 5) { setStep("done"); return; }
    setStep((s) => (typeof s === "number" ? (s + 1) as Step : s));
  }

  function back() {
    if (typeof step === "number" && step > 1) {
      setStep((s) => (typeof s === "number" ? (s - 1) as Step : s));
    }
  }

  function handleGoogle() {
    signIn("google", { callbackUrl: "/specimens" });
  }

  const totalSteps = 5;

  // Done screen
  if (step === "done") {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
          body { margin: 0; }
          .signup-right { display: flex; }
          @media (max-width: 768px) { .signup-right { display: none !important; } }
        `}</style>
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT }}>
          <div style={{ flex: 1, background: C.white, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px" }}>
            <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.graphite, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                  <path d="M2 10l7 7L22 2" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: C.graphite, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                You&apos;re on the list.
              </h1>
              <p style={{ fontSize: 15, color: C.silver, lineHeight: 1.6, margin: "0 0 36px" }}>
                We&apos;ll be in touch shortly.
              </p>
              <Link
                href="/login"
                style={{ fontSize: 13, color: C.graphite, fontWeight: 600, textDecoration: "none" }}
              >
                Back to sign in
              </Link>
            </div>
          </div>
          <div className="signup-right" style={{ width: "50%", background: C.mist, alignItems: "center", justifyContent: "center", padding: 40 }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: C.pearl, textAlign: "center" }}>
              Adeva Health
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        body { margin: 0; }
        .signup-input:focus { border-color: ${C.graphite} !important; }
        .signup-btn-primary:hover { opacity: 0.88; }
        .signup-btn-google:hover { background: ${C.whisper} !important; }
        .signup-right { display: flex; }
        .product-pill:hover { border-color: ${C.shale} !important; }
        @media (max-width: 768px) { .signup-right { display: none !important; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT }}>
        {/* Left panel */}
        <div style={{ flex: 1, background: C.white, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", minWidth: 0 }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            {/* Logo */}
            <div style={{ marginBottom: 40 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.graphite, letterSpacing: "-0.02em" }}>
                Adeva Health
              </span>
            </div>

            {/* Progress dots */}
            <ProgressDots current={step as number} total={totalSteps} />

            {/* Back arrow (steps 2+) */}
            {(step as number) > 1 && <BackArrow onClick={back} />}

            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: C.graphite, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Create your account
                </h1>
                <p style={{ fontSize: 14, color: C.silver, margin: "0 0 32px" }}>
                  Start with your work email.
                </p>

                <button
                  onClick={handleGoogle}
                  className="signup-btn-google"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 16px", border: `1px solid ${C.pearl}`, borderRadius: 40, background: C.white, fontSize: 14, fontWeight: 500, color: C.graphite, fontFamily: FONT, cursor: "pointer", marginBottom: 24, transition: "background 0.15s" }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: C.pearl }} />
                  <span style={{ fontSize: 12, color: C.silver }}>or</span>
                  <div style={{ flex: 1, height: 1, background: C.pearl }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Work email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    placeholder="you@lab.com"
                    className="signup-input"
                    style={inputStyle}
                  />
                </div>

                <button onClick={next} className="signup-btn-primary" style={primaryBtn}>
                  Continue
                </button>

                <p style={{ fontSize: 13, color: C.silver, marginTop: 28, textAlign: "center" }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{ color: C.graphite, fontWeight: 600, textDecoration: "none" }}>
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: C.graphite, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Create a password
                </h1>
                <p style={{ fontSize: 14, color: C.silver, margin: "0 0 32px" }}>
                  At least 8 characters.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="signup-input"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Confirm password</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    placeholder="••••••••"
                    className="signup-input"
                    style={inputStyle}
                  />
                </div>

                {pwError && <p style={{ fontSize: 13, color: "#c0392b", margin: "0 0 8px" }}>{pwError}</p>}

                <button onClick={next} className="signup-btn-primary" style={primaryBtn}>
                  Continue
                </button>
              </>
            )}

            {/* Step 3: Full name */}
            {step === 3 && (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: C.graphite, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  What&apos;s your name?
                </h1>
                <p style={{ fontSize: 14, color: C.silver, margin: "0 0 32px" }}>
                  This appears on reports and communications.
                </p>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Full name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    placeholder="Dr. Amaka Obi"
                    className="signup-input"
                    style={inputStyle}
                  />
                </div>

                <button onClick={next} className="signup-btn-primary" style={{ ...primaryBtn, opacity: fullName.trim() ? 1 : 0.5 }} disabled={!fullName.trim()}>
                  Continue
                </button>
              </>
            )}

            {/* Step 4: Lab name */}
            {step === 4 && (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: C.graphite, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Your lab
                </h1>
                <p style={{ fontSize: 14, color: C.silver, margin: "0 0 32px" }}>
                  Name of the laboratory or diagnostic centre.
                </p>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Lab name</label>
                  <input
                    type="text"
                    required
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    placeholder="Obi Diagnostics Ltd"
                    className="signup-input"
                    style={inputStyle}
                  />
                </div>

                <button onClick={next} className="signup-btn-primary" style={{ ...primaryBtn, opacity: labName.trim() ? 1 : 0.5 }} disabled={!labName.trim()}>
                  Continue
                </button>
              </>
            )}

            {/* Step 5: Product */}
            {step === 5 && (
              <>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: C.graphite, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                  Which product interests you?
                </h1>
                <p style={{ fontSize: 14, color: C.silver, margin: "0 0 32px" }}>
                  Pick one to start — you can always add more later.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setProduct(p.key)}
                      className="product-pill"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: `1.5px solid ${product === p.key ? C.graphite : C.pearl}`,
                        background: product === p.key ? C.whisper : C.white,
                        cursor: "pointer",
                        fontFamily: FONT,
                        textAlign: "left",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.graphite }}>{p.label}</div>
                        <div style={{ fontSize: 12, color: C.silver, marginTop: 2 }}>{p.sub}</div>
                      </div>
                      {product === p.key && (
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.graphite, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={next}
                  className="signup-btn-primary"
                  style={{ ...primaryBtn, opacity: product ? 1 : 0.5 }}
                  disabled={!product}
                >
                  Request access
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right panel — hidden on mobile */}
        <div
          className="signup-right"
          style={{ width: "50%", background: C.mist, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, padding: 40 }}
        >
          <div style={{ maxWidth: 320 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.silver, letterSpacing: "0.08em", marginBottom: 20 }}>
              JOINING LABS GET
            </p>
            {[
              ["Co-build access", "Shape the product directly with our team."],
              ["Free founding plan", "No monthly fees during the co-build period."],
              ["Priority support", "Direct line to the engineers building your LIS."],
              ["Early feature access", "Try new modules before general release."],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.graphite, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.graphite, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

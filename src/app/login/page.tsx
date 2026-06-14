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

// Minimal SpecimenCard for the right panel (decorative, read-only)
function SpecimenCard() {
  const steps = [
    { label: "Registration", sub: "CHI-004 · Chidi Okonkwo", done: true },
    { label: "Accession", sub: "Barcode scanned · Yaba Hub", done: true },
    { label: "Analysis", sub: "Running · Mindray BS-240", active: true },
    { label: "Result", sub: "Pending sign-off", done: false },
  ];
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 20,
        padding: "28px 24px",
        width: 300,
        boxShadow: "0 4px 32px rgba(32,32,32,0.08)",
        fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: C.silver, marginBottom: 20 }}>
        SPECIMEN TRACKER
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < steps.length - 1 ? 4 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: s.done ? C.graphite : s.active ? C.orange : C.pearl,
                border: s.active ? `2px solid ${C.orange}` : "none",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s.done && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {s.active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange }} />}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 1, height: 28, background: s.done ? C.graphite : C.pearl, marginTop: 3 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < steps.length - 1 ? 24 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: s.active ? C.orange : s.done ? C.graphite : C.silver }}>
              {s.label}
            </div>
            <div style={{ fontSize: 11, color: C.silver, marginTop: 2 }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      window.location.href = "/specimens";
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/specimens" });
  }

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        body { margin: 0; }
        .login-input:focus { border-color: ${C.graphite} !important; }
        .login-btn-primary:hover { opacity: 0.88; }
        .login-btn-google:hover { background: ${C.whisper} !important; }
        .login-right { display: flex; }
        @media (max-width: 768px) { .login-right { display: none !important; } }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: FONT,
        }}
      >
        {/* Left panel */}
        <div
          style={{
            flex: 1,
            background: C.white,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px 40px",
            minWidth: 0,
          }}
        >
          <div style={{ width: "100%", maxWidth: 380 }}>
            {/* Logo */}
            <div style={{ marginBottom: 48 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.graphite,
                  letterSpacing: "-0.02em",
                  fontFamily: FONT,
                }}
              >
                Adeva Health
              </span>
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: C.graphite,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: C.silver, margin: "0 0 32px" }}>
              Sign in to your Adeva Health account.
            </p>

            {/* Google button */}
            <button
              onClick={handleGoogle}
              className="login-btn-google"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "12px 16px",
                border: `1px solid ${C.pearl}`,
                borderRadius: 40,
                background: C.white,
                fontSize: 14,
                fontWeight: 500,
                color: C.graphite,
                fontFamily: FONT,
                cursor: "pointer",
                marginBottom: 24,
                transition: "background 0.15s",
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div style={{ flex: 1, height: 1, background: C.pearl }} />
              <span style={{ fontSize: 12, color: C.silver }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.pearl }} />
            </div>

            {/* Credentials form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.shale,
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lab.com"
                  className="login-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.shale,
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  style={inputStyle}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-btn-primary"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 40,
                  border: "none",
                  background: C.graphite,
                  color: C.white,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "opacity 0.15s",
                  marginTop: 4,
                }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p style={{ fontSize: 13, color: C.silver, marginTop: 28, textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                style={{ color: C.graphite, fontWeight: 600, textDecoration: "none" }}
              >
                Request access
              </Link>
            </p>

            <p style={{ fontSize: 11, color: C.pearl, marginTop: 32, textAlign: "center" }}>
              Dev: admin@adeva.test · accession@adeva.test · tech@adeva.test · pw: adeva-dev
            </p>
          </div>
        </div>

        {/* Right panel — hidden on mobile */}
        <div
          className="login-right"
          style={{
            width: "50%",
            background: C.mist,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 24,
            padding: 40,
          }}
        >
          <SpecimenCard />
          <p
            style={{
              fontSize: 13,
              color: C.silver,
              textAlign: "center",
              maxWidth: 280,
              lineHeight: 1.6,
            }}
          >
            Track every specimen from collection to result release, in real time.
          </p>
        </div>
      </div>
    </>
  );
}

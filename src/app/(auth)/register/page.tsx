"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password, role, storeName: role === "seller" ? storeName : undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Account created but auto-login failed. Please sign in.");
    } else {
      router.push(role === "seller" ? "/seller" : "/");
      router.refresh();
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create account</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Join Hara Bazaar — Faisalabad&apos;s grocery marketplace
      </p>

      {/* Role toggle */}
      <div style={{
        display: 'flex', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)',
        padding: 3, marginBottom: 24,
      }}>
        <button
          type="button"
          onClick={() => setRole("customer")}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600,
            transition: '0.15s',
            background: role === "customer" ? 'var(--primary)' : 'transparent',
            color: role === "customer" ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("seller")}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600,
            transition: '0.15s',
            background: role === "seller" ? 'var(--primary)' : 'transparent',
            color: role === "seller" ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Seller
        </button>
      </div>

      {error && (
        <div style={{
          marginBottom: 16, borderRadius: 'var(--radius-sm)', padding: 12,
          fontSize: 13, background: 'var(--danger-bg)', color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{role === "seller" ? "Your Name" : "Full Name"}</label>
          <input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {role === "seller" && (
          <div className="form-group">
            <label htmlFor="storeName">Store Name</label>
            <input
              id="storeName"
              placeholder="e.g. Khan General Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="03XX-XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="03\d{2}-?\d{7}"
            maxLength={12}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account..." : role === "seller" ? "Register as Seller" : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        Already have an account?{" "}
        <Link href="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}

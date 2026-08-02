"use client";

import { useEffect, useState } from "react";

interface Settings {
  storeName: string;
  storeDescription: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountTitle: string | null;
}

export default function SellerSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountTitle, setAccountTitle] = useState("");

  useEffect(() => {
    fetch("/api/seller/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setDescription(data.storeDescription || "");
        setCity(data.city || "Faisalabad");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setBankName(data.bankName || "");
        setAccountNumber(data.accountNumber || "");
        setAccountTitle(data.accountTitle || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/seller/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeDescription: description,
        city,
        address,
        phone,
        bankName,
        accountNumber,
        accountTitle,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setMessage("Settings saved");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to save");
    }
  }

  if (loading) return <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading settings...</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Store Settings</h1>

      {message && (
        <div
          className="mb-4 rounded-lg p-3 text-sm"
          style={{
            background: message === "Settings saved" ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: message === "Settings saved" ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6">
          <h2 className="mb-4 font-bold">Store Information</h2>
          <div className="space-y-4">
            <div className="form-group">
              <label>Store Name</label>
              <input value={settings?.storeName || ""} disabled style={{ opacity: 0.6 }} />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Contact support to change store name</p>
            </div>
            <div className="form-group">
              <label htmlFor="description">Store Description</label>
              <textarea
                id="description"
                placeholder="Tell customers about your store..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Store Address</label>
              <input
                id="address"
                placeholder="Shop number, street, area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-bold">Bank Details</h2>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>For receiving payments from orders</p>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <input
                id="bankName"
                placeholder="e.g. HBL, Meezan, JazzCash"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountTitle">Account Title</label>
                <input
                  id="accountTitle"
                  placeholder="Account holder name"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number</label>
                <input
                  id="accountNumber"
                  placeholder="IBAN or account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

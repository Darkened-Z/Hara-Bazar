"use client";

import { useEffect, useState } from "react";

export default function RiderSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [vehicleType, setVehicleType] = useState("bike");
  const [zone, setZone] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/rider/settings")
      .then((r) => r.json())
      .then((data) => {
        setVehicleType(data.vehicleType || "bike");
        setZone(data.zone || "");
        setPhone(data.phone || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/rider/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleType, zone, phone }),
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
      <h1 className="mb-6 text-2xl font-bold">Rider Settings</h1>

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
          <h2 className="mb-4 font-bold">Profile</h2>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="vehicleType">Vehicle Type</label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="zone">Zone</label>
              <input
                id="zone"
                placeholder="e.g. Faisalabad"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
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

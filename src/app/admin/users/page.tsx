"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  city: string | null;
  createdAt: string;
}

const roleBadge: Record<string, string> = {
  admin: "badge badge-danger",
  seller: "badge badge-info",
  rider: "badge badge-warning",
  customer: "badge badge-default",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Loading users...</div>;

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Users style={{ width: 64, height: 64, color: "var(--text-muted)", opacity: 0.5 }} /></div>
        <h3>No users found</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="badge badge-default">{users.length} total</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>City</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.name}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={roleBadge[user.role] || "badge badge-default"}>{user.role}</span>
                </td>
                <td style={{ color: "var(--text-muted)" }}>{user.city || "-"}</td>
                <td style={{ color: "var(--text-muted)" }}>
                  {new Date(user.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

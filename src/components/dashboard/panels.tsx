import { formatPrice } from "@/lib/utils";

export type DayPoint = { day: string; total: number; orders: number };
export type RecentOrder = {
  id: number;
  orderNumber: string;
  customer: string;
  store: string;
  total: number;
  status: string;
  createdAt: string;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--warning)",
  confirmed: "var(--info)",
  processing: "#7C3AED",
  shipped: "#0EA5E9",
  delivered: "var(--success)",
  cancelled: "var(--danger)",
};

export function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DailyChart({ data, metric = "total", title = "Revenue · last 14 days" }: { data: DayPoint[]; metric?: "total" | "orders"; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d[metric]));
  const sum = data.reduce((s, d) => s + d[metric], 0);
  return (
    <Panel title={title} action={<span className="text-sm font-semibold">{metric === "total" ? formatPrice(sum) : sum}</span>}>
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="rounded-t-md transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(2, (d[metric] / max) * 100)}%`, background: "var(--primary)" }}
              title={`${d.day}: ${formatPrice(d.total)} · ${d.orders} orders`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>{new Date(data[0].day).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
        <span>Today</span>
      </div>
    </Panel>
  );
}

export function StatusBreakdown({ counts }: { counts: Record<string, number> }) {
  const order = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
  return (
    <Panel title="Orders by status">
      <div className="mb-4 flex h-3 overflow-hidden rounded-full" style={{ background: "var(--surface-alt)" }}>
        {order.map((s) => (counts[s] ? <div key={s} style={{ width: `${(counts[s] / total) * 100}%`, background: STATUS_COLOR[s] }} /> : null))}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {order.map((s) => (
          <div key={s} className="flex items-center justify-between">
            <span className="flex items-center gap-2 capitalize">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />
              {s}
            </span>
            <span className="font-semibold">{counts[s] ?? 0}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ color: STATUS_COLOR[status], background: "var(--surface-alt)" }}
    >
      {status}
    </span>
  );
}

export function RecentOrders({ rows, showStore = true }: { rows: RecentOrder[]; showStore?: boolean }) {
  return (
    <Panel title="Recent orders">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-t" style={{ borderColor: "var(--border)" }}>
              <td className="py-2.5 font-medium">{o.orderNumber}</td>
              <td className="py-2.5">{o.customer}</td>
              {showStore && <td className="py-2.5" style={{ color: "var(--text-muted)" }}>{o.store}</td>}
              <td className="py-2.5"><StatusPill status={o.status} /></td>
              <td className="py-2.5 text-right font-semibold">{formatPrice(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function RankedList({ title, rows }: { title: string; rows: { label: string; sub: string; value: string }[] }) {
  return (
    <Panel title={title}>
      <ol className="space-y-3 text-sm">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--surface-alt)" }}>
              {i + 1}
            </span>
            <span className="flex-1">
              <span className="block font-medium">{r.label}</span>
              <span className="block text-xs" style={{ color: "var(--text-muted)" }}>{r.sub}</span>
            </span>
            <span className="font-semibold">{r.value}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

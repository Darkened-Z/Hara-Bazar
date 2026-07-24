type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

function getStyle(variant: BadgeVariant): React.CSSProperties {
  switch (variant) {
    case "success": return { background: 'var(--success-bg)', color: 'var(--success)' };
    case "warning": return { background: 'var(--warning-bg)', color: '#9A7B00' };
    case "danger": return { background: 'var(--danger-bg)', color: 'var(--danger)' };
    case "info": return { background: 'var(--info-bg)', color: 'var(--info)' };
    default: return { background: 'var(--surface-alt)', color: 'var(--text-secondary)' };
  }
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${className || ""}`}
      style={getStyle(variant)}
    >
      {children}
    </span>
  );
}

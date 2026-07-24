import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn("overflow-hidden", className)}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-light)',
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("px-4 py-3", className)} style={{ borderBottom: '1px solid var(--border)' }}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-4 py-4", className)}>{children}</div>;
}

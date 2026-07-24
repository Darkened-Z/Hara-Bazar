import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div style={{ marginBottom: label ? '0' : undefined }}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[13px] font-semibold mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={className}
        style={{
          border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          background: 'var(--surface)',
          color: 'var(--text)',
          fontSize: '14px',
          width: '100%',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        {...props}
      />
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";

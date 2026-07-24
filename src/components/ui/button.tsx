import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "default" | "outline" | "ghost" | "destructive" | "success";
type Size = "sm" | "md" | "lg";

function getClassName(variant: Variant, size: Size): string {
  const base = "btn";
  const v = variant === "default" ? "btn-primary"
    : variant === "outline" ? "btn-outline"
    : variant === "destructive" ? "btn-danger"
    : variant === "success" ? "btn-success"
    : "";
  const s = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return [base, v, s].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", block, style, ...props }, ref) => (
    <button
      ref={ref}
      className={[getClassName(variant, size), block ? "btn-block" : "", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    />
  ),
);
Button.displayName = "Button";

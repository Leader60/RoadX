import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "outline" | "ghost" | "gold" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-gold-deep",
  gold: "bg-gold text-gold-foreground hover:bg-gold-deep",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-secondary",
  ghost: "bg-transparent text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cx(
        "rx-press inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "rx-press inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-card text-card-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Pill({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cx(
        "flex items-center gap-2 text-lg font-bold text-foreground",
        className,
      )}
    >
      <span className="inline-block h-5 w-1.5 rounded-full bg-gold" />
      {children}
    </h2>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon ? <div className="text-muted-foreground opacity-60">{icon}</div> : null}
      <p className="text-base font-bold text-foreground">{title}</p>
      {hint ? <p className="text-sm text-muted-foreground text-pretty">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition";

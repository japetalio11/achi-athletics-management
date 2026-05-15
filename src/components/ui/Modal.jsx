import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

const toneStyles = {
  info: "bg-brand-blue-light text-brand-blue",
  success: "bg-green-50 text-green-700",
  warning: "bg-brand-gold-light text-brand-gold-hover",
  danger: "bg-red-50 text-red-700",
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass =
    size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-md" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${widthClass} max-h-[calc(100vh-2rem)] overflow-hidden rounded-[24px] border border-border-subtle/60 bg-surface-card shadow-float`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle/50 p-6">
          <div>
            <h2
              id="modal-title"
              className="text-[18px] font-bold tracking-tight text-slate-900"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle/50 p-5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border-subtle bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5";

export function TextInput({ className = "", ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      className={`${inputClass} min-h-28 resize-none ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ children, className = "", ...props }) {
  return (
    <select className={`${inputClass} appearance-none ${className}`} {...props}>
      {children}
    </select>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-2.5 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  tone = "brand",
  loading = false,
  className = "",
  ...props
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : tone === "gold"
        ? "bg-brand-gold-hover hover:bg-brand-gold"
        : "bg-brand-blue hover:bg-brand-blue-hover";

  return (
    <button
      type="button"
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${toneClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function FeedbackPanel({ tone = "info", title, children }) {
  const Icon = toneIcons[tone] ?? Info;

  return (
    <div className="flex gap-4 rounded-2xl border border-border-subtle/50 bg-slate-50/70 p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneStyles[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
        <div className="mt-1 text-[13px] leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft, Compass, Lock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <StatusPageShell
      eyebrow="Access control"
      title="You do not have permission to view this page."
      description="The route guard is working, but this account does not have the required access level for the requested page."
      icon={<ShieldAlert className="h-6 w-6" />}
      primaryAction={{ to: "/dashboard", label: "Back to dashboard" }}
      secondaryAction={{ to: "/login", label: "Sign in with another account" }}
    />
  );
}

export function NotFoundPage() {
  return (
    <StatusPageShell
      eyebrow="Route not found"
      title="We could not find the page you requested."
      description="The URL may be outdated, mistyped, or no longer mapped to an active module in the athletics management hub."
      icon={<Compass className="h-6 w-6" />}
      primaryAction={{ to: "/dashboard", label: "Go to dashboard" }}
      secondaryAction={{ to: "/", label: "Visit landing page" }}
    />
  );
}

function StatusPageShell({
  eyebrow,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="min-h-screen bg-surface-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-border-subtle/60 bg-surface-card p-8 text-center shadow-float sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-blue text-white shadow-soft">
            {icon}
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-7 text-slate-500">
            {description}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={primaryAction.to}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-[13px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              {primaryAction.label}
            </Link>
            <Link
              to={secondaryAction.to}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-5 py-3 text-[13px] font-bold tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Lock className="h-4 w-4" />
              {secondaryAction.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

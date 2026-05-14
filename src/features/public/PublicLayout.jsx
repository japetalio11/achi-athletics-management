import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "Public Events", to: "/public/events" },
  { label: "Facility Request", to: "/public/facility-request" },
  { label: "Item Request", to: "/public/item-request" },
];

const navLinkClass = (variant = "default") => ({ isActive }) =>
  `rounded-full px-3 py-2 text-[12px] font-bold tracking-wide transition-colors ${
    isActive
      ? variant === "institutional"
        ? "bg-brand-blue-light text-brand-blue ring-1 ring-brand-gold/30"
        : "bg-brand-blue-light text-brand-blue"
      : variant === "institutional"
        ? "text-slate-700 hover:bg-brand-gold-light/70 hover:text-brand-blue"
        : "text-slate-600 hover:bg-slate-50 hover:text-brand-blue"
  }`;

export function PublicPageShell({ children, compact = false }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,74,166,0.12),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(15,58,110,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,58,110,0.04)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="pointer-events-none absolute right-[-140px] top-[30%] h-[360px] w-[360px] rounded-full border border-brand-gold/20 bg-brand-gold/10 blur-3xl" />

      <div className={`mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 ${compact ? "gap-10" : ""}`}>
        <PublicNavbar />
        {children}
      </div>
    </div>
  );
}

export function PublicNavbar({ variant = "default" }) {
  const [open, setOpen] = useState(false);
  const institutional = variant === "institutional";

  return (
    <header
      className={`relative z-20 overflow-hidden rounded-[28px] border bg-white/85 px-4 py-3 shadow-soft backdrop-blur lg:rounded-full lg:px-5 ${
        institutional ? "border-brand-blue/15" : "border-white/70"
      }`}
    >
      {institutional ? (
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/ADNU_Logo.png" alt="ADNU logo" className="h-10 w-10 rounded-full object-cover shadow-soft" />
          <span>
            <span className="block text-[12px] font-black uppercase tracking-[0.24em] text-brand-blue">
              ADNU Athletics
            </span>
            <span className="block text-[11px] text-slate-500">
              {institutional ? "Ateneo de Naga University" : "Management Hub"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={navLinkClass(variant)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-4 py-2 text-[12px] font-bold tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
          >
            Request access
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white text-slate-600 shadow-soft lg:hidden"
          aria-label={open ? "Close public navigation" : "Open public navigation"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="mt-4 border-t border-border-subtle/70 pt-4 lg:hidden">
          <nav className="grid gap-2">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setOpen(false)}
                  className={navLinkClass(variant)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-4 py-2.5 text-[12px] font-bold tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold tracking-wide text-white shadow-soft transition-colors hover:bg-brand-blue-hover"
            >
              Request access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicHero({ eyebrow, title, description, icon: Icon, actions }) {
  return (
    <section className="pt-6 sm:pt-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/85 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-blue shadow-soft">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {eyebrow}
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-600">
          {description}
        </p>
        {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </section>
  );
}

export function PublicBadge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-brand-blue/20 bg-white/75 p-8 text-center shadow-soft">
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h2 className="mt-4 text-[18px] font-black text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-slate-500">{description}</p>
    </div>
  );
}

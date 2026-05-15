import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  SearchCheck,
  Send,
} from "lucide-react";

export function PublicSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`rounded-[28px] border border-white/75 bg-white/90 p-5 shadow-soft backdrop-blur sm:p-6 ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-col gap-4 border-b border-border-subtle/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && (
              <div className="flex items-center gap-3">
                {Icon ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
                    <Icon className="h-4 w-4" />
                  </span>
                ) : null}
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
                  {description ? <p className="mt-1 text-[13px] leading-6 text-slate-500">{description}</p> : null}
                </div>
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={title || description || action ? "pt-5" : ""}>{children}</div>
    </section>
  );
}

export function ViewSwitcher({ views, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/75 bg-white/90 p-2 shadow-soft backdrop-blur">
      {views.map((view) => {
        const Icon = view.icon;
        const active = value === view.id;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold transition-colors ${
              active ? "bg-brand-blue text-white shadow-soft" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {view.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="grid gap-3 md:grid-cols-6">
      {steps.map((step, index) => {
        const number = index + 1;
        const isActive = number === currentStep;
        const isDone = number < currentStep;
        return (
          <div
            key={step.id}
            className={`rounded-[22px] border px-4 py-3 transition-colors ${
              isActive
                ? "border-brand-blue/25 bg-brand-blue-light/60"
                : isDone
                  ? "border-green-100 bg-green-50/80"
                  : "border-border-subtle bg-slate-50/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : isDone
                      ? "bg-green-600 text-white"
                      : "bg-white text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : number}
              </span>
              <p className="text-[12px] font-bold text-slate-800">{step.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SummaryRail({ title, items, footer, icon: Icon }) {
  return (
    <aside className="rounded-[26px] border border-border-subtle/70 bg-slate-50/85 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-soft">
          {Icon ? <Icon className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
        </span>
        <div>
          <h3 className="text-[16px] font-black text-slate-950">{title}</h3>
          <p className="text-[12px] text-slate-500">Only the essentials stay visible here.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white px-4 py-3 shadow-soft">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-1 text-[13px] font-bold leading-5 text-slate-800">{item.value || "Pending"}</p>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </aside>
  );
}

export function StatusTimeline({ title = "Request Timeline", items = [] }) {
  return (
    <div className="rounded-[22px] border border-border-subtle/70 bg-slate-50/80 p-4">
      <h3 className="text-[14px] font-black text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-blue" />
                {index !== items.length - 1 ? <span className="mt-1 h-full w-px bg-slate-200" /> : null}
              </div>
              <div className="pb-2">
                <p className="text-[13px] font-bold text-slate-900">{item.title}</p>
                {item.meta ? <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{item.meta}</p> : null}
                {item.body ? <p className="mt-1 text-[12px] leading-6 text-slate-600">{item.body}</p> : null}
              </div>
            </div>
          ))
        ) : (
          <p className="text-[12px] leading-6 text-slate-500">Timeline updates will appear after submission.</p>
        )}
      </div>
    </div>
  );
}

export function ActionHint({ icon: Icon = ArrowRight, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue-light px-3 py-2 text-[12px] font-bold text-brand-blue">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

export function EmptyInline({ title, description, icon: Icon = Building2 }) {
  return (
    <div className="rounded-[24px] border border-dashed border-border-subtle bg-slate-50/80 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-soft">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-[16px] font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function TrackPrompt() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
      <SearchCheck className="h-3.5 w-3.5 text-brand-blue" />
      Tracking available below
    </div>
  );
}

export function SubmitHint() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-[12px] font-bold text-green-700">
      <Send className="h-3.5 w-3.5" />
      Review before final submission
    </div>
  );
}

export function MetaPill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-[12px] font-bold text-slate-600">
      {Icon ? <Icon className="h-3.5 w-3.5 text-brand-blue" /> : <Clock3 className="h-3.5 w-3.5 text-brand-blue" />}
      {children}
    </span>
  );
}

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  Field,
  FeedbackPanel,
  PrimaryButton,
  TextInput,
  inputClass,
} from "../../components/ui/Modal";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function PasswordInput({ value, onChange, placeholder = "Enter password" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-blue"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function AuthShell({ eyebrow, title, description, children, sideTitle, sideCopy }) {
  return (
    <div className="min-h-screen bg-surface-bg px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-border-subtle/70 bg-surface-card shadow-float lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between gap-10 bg-brand-blue p-8 text-white sm:p-10">
          <div>
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                ADNU Athletics
              </Link>
            </div>
            <div className="mt-16 max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
                {sideTitle}
              </h1>
              <p className="mt-4 text-[14px] leading-7 text-white/70">
                {sideCopy}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-[11px] font-semibold text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="block text-2xl font-extrabold text-white">842</span>
              Athletes
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="block text-2xl font-extrabold text-white">31</span>
              Bookings
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="block text-2xl font-extrabold text-white">24</span>
              Staff
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-5 inline-flex -translate-y-1 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-brand-blue"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to landing page
            </Link>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-blue">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              {description}
            </p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuthFooterLink({ prompt, label, view }) {
  return (
    <p className="mt-6 text-center text-[13px] text-slate-500">
      {prompt}{" "}
      <Link
        to={view}
        className="font-bold text-brand-blue hover:text-brand-blue-hover"
      >
        {label}
      </Link>
    </p>
  );
}

function usePlaceholderSubmit(nextPath, onSuccess) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = (event, validator) => {
    event.preventDefault();
    const validationMessage = validator?.();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (onSuccess) onSuccess();
      if (nextPath) navigate(nextPath);
    }, 500);
  };

  return { loading, message, submit };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nextPath = location.state?.from?.pathname ?? "/dashboard";
  const { loading, message, submit } = usePlaceholderSubmit(nextPath, () =>
    login({ email, role: "Administrator" }),
  );

  return (
    <AuthShell
      eyebrow="Secure sign in"
      title="Welcome back"
      description="Access rosters, facility bookings, equipment logs, and staff settings from one command center."
      sideTitle="Run athletics operations with confident oversight."
      sideCopy="The dashboard is ready for backend authentication. This form currently uses a placeholder submit flow so integration can be added cleanly."
    >
      <form
        className="space-y-5"
        onSubmit={(event) =>
          submit(event, () => {
            if (!email.includes("@")) return "Enter a valid institutional email.";
            if (password.length < 6) return "Password must be at least 6 characters.";
            return "";
          })
        }
      >
        {message && <FeedbackPanel tone="danger" title="Check your details">{message}</FeedbackPanel>}

        <Field label="Email address">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="director@adnu.edu.ph"
              className={`${inputClass} pl-11`}
            />
          </div>
        </Field>

        <Field label="Password">
          <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>

        <div className="flex items-center justify-between gap-4 text-[13px]">
          <label className="flex items-center gap-2 font-medium text-slate-500">
            <input type="checkbox" className="h-4 w-4 rounded border-border-subtle accent-brand-blue" />
            Keep me signed in
          </label>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="font-bold text-brand-blue hover:text-brand-blue-hover"
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton type="submit" loading={loading} className="w-full py-3">
          {loading ? "Signing in" : "Sign in"}
        </PrimaryButton>
      </form>

      <AuthFooterLink prompt="New to the athletics hub?" label="Create an account" view="/register" />
    </AuthShell>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Coach",
    password: "",
    confirmPassword: "",
  });
  const { loading, message, submit } = usePlaceholderSubmit("/verification-success");

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <AuthShell
      eyebrow="Account request"
      title="Create staff access"
      description="Request access for coaches, trainers, scouts, and athletics administrators."
      sideTitle="Bring new staff into the same operating rhythm."
      sideCopy="Account creation is staged for approval. The placeholder flow captures the fields expected by a later auth service."
    >
      <form
        className="space-y-5"
        onSubmit={(event) =>
          submit(event, () => {
            if (!form.name.trim()) return "Full name is required.";
            if (!form.email.includes("@")) return "Use a valid institutional email.";
            if (form.password.length < 8) return "Password must be at least 8 characters.";
            if (form.password !== form.confirmPassword) return "Passwords must match.";
            return "";
          })
        }
      >
        {message && <FeedbackPanel tone="danger" title="Registration needs attention">{message}</FeedbackPanel>}

        <Field label="Full name">
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput value={form.name} onChange={update("name")} placeholder="Maria Santos" className={`${inputClass} pl-11`} />
          </div>
        </Field>

        <Field label="Email address">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput type="email" value={form.email} onChange={update("email")} placeholder="msantos@adnu.edu.ph" className={`${inputClass} pl-11`} />
          </div>
        </Field>

        <Field label="Role">
          <select value={form.role} onChange={update("role")} className={inputClass}>
            <option>Coach</option>
            <option>Trainer</option>
            <option>Scout</option>
            <option>Administrator</option>
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password">
            <PasswordInput value={form.password} onChange={update("password")} placeholder="Create password" />
          </Field>
          <Field label="Confirm">
            <PasswordInput value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Repeat password" />
          </Field>
        </div>

        <PrimaryButton type="submit" loading={loading} className="w-full py-3">
          {loading ? "Submitting request" : "Create account"}
        </PrimaryButton>
      </form>

      <AuthFooterLink prompt="Already have an account?" label="Sign in" view="/login" />
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { loading, message, submit } = usePlaceholderSubmit("/reset-password");

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Recover access"
      description="Enter your staff email and we will stage the reset flow for backend integration."
      sideTitle="Keep operations moving, even when credentials need a reset."
      sideCopy="The reset request uses validation and a loading state now, with a clean integration point for email delivery later."
    >
      <form
        className="space-y-5"
        onSubmit={(event) =>
          submit(event, () => (!email.includes("@") ? "Enter a valid email address." : ""))
        }
      >
        {message && <FeedbackPanel tone="danger" title="Email required">{message}</FeedbackPanel>}

        <Field label="Email address">
          <TextInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="director@adnu.edu.ph"
          />
        </Field>

        <PrimaryButton type="submit" loading={loading} className="w-full py-3">
          {loading ? "Sending reset link" : "Send reset link"}
        </PrimaryButton>
      </form>

      <AuthFooterLink prompt="Remembered your password?" label="Back to sign in" view="/login" />
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { loading, message, submit } = usePlaceholderSubmit("/verification-success");

  return (
    <AuthShell
      eyebrow="New password"
      title="Reset password"
      description="Create a new password for your athletics staff account."
      sideTitle="A tighter reset flow for protected athletics data."
      sideCopy="Password visibility controls and validation are included so the page is ready for the auth service handoff."
    >
      <form
        className="space-y-5"
        onSubmit={(event) =>
          submit(event, () => {
            if (password.length < 8) return "Password must be at least 8 characters.";
            if (password !== confirmPassword) return "Passwords must match.";
            return "";
          })
        }
      >
        {message && <FeedbackPanel tone="danger" title="Reset blocked">{message}</FeedbackPanel>}

        <Field label="New password">
          <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" />
        </Field>

        <Field label="Confirm password">
          <PasswordInput value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" />
        </Field>

        <PrimaryButton type="submit" loading={loading} className="w-full py-3">
          {loading ? "Saving password" : "Reset password"}
        </PrimaryButton>
      </form>
    </AuthShell>
  );
}

export function VerificationSuccessPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const details = useMemo(
    () => [
      "Account request captured for director approval.",
      "Password reset flow completed in placeholder mode.",
      "Backend auth can now connect to this handoff point.",
    ],
    [],
  );

  return (
    <AuthShell
      eyebrow="Request received"
      title="You are all set"
      description="This success state keeps the authentication flow complete while backend services are pending."
      sideTitle="A clear finish line for every account flow."
      sideCopy="Users get immediate confirmation and a direct path back to the sign-in screen or dashboard."
    >
      <div className="space-y-6">
        <div className="rounded-[24px] border border-green-100 bg-green-50 p-6 text-green-800">
          <CheckCircle2 className="h-10 w-10" />
          <h3 className="mt-4 text-[18px] font-bold text-slate-900">
            Confirmation recorded
          </h3>
          <ul className="mt-4 space-y-2 text-[13px] leading-6 text-slate-600">
            {details.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-600" />
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton onClick={() => navigate("/login")} className="flex-1 py-3">
            Go to sign in
          </PrimaryButton>
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-3 text-[12px] font-bold tracking-wide text-slate-600 shadow-soft transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export function AuthView({ view }) {
  if (view === "register") return <RegisterPage />;
  if (view === "forgot-password") return <ForgotPasswordPage />;
  if (view === "reset-password") return <ResetPasswordPage />;
  if (view === "verification-success") return <VerificationSuccessPage />;
  return <LoginPage />;
}

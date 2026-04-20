import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FormField, TextInput } from "../../components/ui/form";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { defaultRoute } from "../../app/router/routes";
import { useAuth } from "../../auth/useAuth";
import { extractErrorMessage } from "../../lib/error-utils";
import {
  applyTheme,
  getInitialTheme,
  persistTheme,
  type Theme,
} from "../../lib/theme";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  const canSubmit = useMemo(
    () => Boolean(email.trim() && password.trim() && !isSubmitting),
    [email, password, isSubmitting],
  );

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate(defaultRoute, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      setErrorMessage(
        extractErrorMessage(error, "Invalid credentials. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f2f5f9_44%,#edf1f6_100%)] dark:bg-[radial-gradient(circle_at_top,#121720_0%,#0d1118_48%,#0a0e14_100%)]" />

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/88 p-6 shadow-xl backdrop-blur sm:p-7 dark:border-slate-800/80 dark:bg-slate-950/82">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            SIFIPRO Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Continue to the loyalty operations dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField label="Email" htmlFor="login-email">
            <TextInput
              id="login-email"
              type="email"
              value={email}
              autoComplete="email"
              disabled={isSubmitting}
              onChange={(event) => {
                clearError();
                setEmail(event.target.value);
              }}
              placeholder="you@company.com"
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="login-password">
            <TextInput
              id="login-password"
              type="password"
              value={password}
              autoComplete="current-password"
              disabled={isSubmitting}
              onChange={(event) => {
                clearError();
                setPassword(event.target.value);
              }}
              placeholder="Enter your password"
              required
            />
          </FormField>

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/35 dark:text-rose-300"
            >
              <p className="font-medium">Sign-in failed</p>
              <p className="mt-0.5 text-xs sm:text-sm">{errorMessage}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-900 dark:hover:border-slate-500 dark:hover:bg-white"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </section>
  );
}

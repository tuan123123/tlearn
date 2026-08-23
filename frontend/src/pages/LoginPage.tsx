import { useForm } from "react-hook-form"
import { Link, Navigate } from "react-router-dom"

import PublicPageHeader from "../components/PublicPageHeader"
import { useLogin } from "../hooks/useAuth"
import { useAuthStore } from "../store/authStore"

interface LoginForm {
  email: string
  password: string
}

function LoginPage() {
  const token = useAuthStore((state) => state.token)
  const login = useLogin()
  const { register, handleSubmit } = useForm<LoginForm>()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  function onSubmit(values: LoginForm) {
    login.mutate(values)
  }

  return (
    <div className="editorial-public-page min-h-screen">
      <PublicPageHeader />

      <main className="mx-auto grid max-w-7xl lg:grid-cols-12">
        <section className="flex flex-col justify-between border-b border-[var(--rule)] bg-[var(--surface)] px-6 py-12 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-12 lg:py-20">
          <div>
            <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
              Member access · Student edition
            </p>
            <p className="editorial-display mt-8 max-w-3xl text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              Return to the questions that matter most.
            </p>
          </div>
          <p className="mt-12 max-w-xl border-t border-[var(--rule)] pt-5 leading-7 text-[var(--muted)]">
            Your courses, readiness reports, study guides, and exam countdowns are waiting
            in one focused workspace.
          </p>
        </section>

        <section className="px-6 py-12 lg:col-span-5 lg:px-12 lg:py-20">
          <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Microeconomics AI Exam Coach
          </p>
          <h1 className="editorial-display mt-4 text-5xl font-medium tracking-[-0.04em]">
            Log in
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Continue to your course dashboard and exam countdowns.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="editorial-kicker text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Email
              </span>
              <input
                className="mt-2 w-full border px-4 py-3"
                type="email"
                {...register("email", { required: true })}
              />
            </label>
            <label className="block">
              <span className="editorial-kicker text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Password
              </span>
              <input
                className="mt-2 w-full border px-4 py-3"
                type="password"
                {...register("password", { required: true })}
              />
            </label>

            {login.isError ? (
              <p className="border border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
                Login failed. Check your email and password.
              </p>
            ) : null}

            <button
              className="editorial-kicker w-full bg-[var(--accent)] px-4 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={login.isPending}
              type="submit"
            >
              {login.isPending ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="editorial-kicker mt-8 space-y-3 border-t border-[var(--rule)] pt-6 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            <p>
              New here?{" "}
              <Link className="font-bold text-[var(--accent)]" to="/register">
                Create an account
              </Link>
            </p>
            <p>
              Want to look around first?{" "}
              <Link className="font-bold text-[var(--accent)]" to="/">
                Read the demo page
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LoginPage

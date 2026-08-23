import { useForm } from "react-hook-form"
import { Link, Navigate } from "react-router-dom"

import PublicPageHeader from "../components/PublicPageHeader"
import { useRegister } from "../hooks/useAuth"
import { useAuthStore } from "../store/authStore"

interface RegisterForm {
  display_name: string
  email: string
  location_country: string
  password: string
  confirm_password: string
}

function RegisterPage() {
  const token = useAuthStore((state) => state.token)
  const createAccount = useRegister()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      location_country: "United States",
    },
  })

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  function onSubmit(values: RegisterForm) {
    createAccount.mutate({
      display_name: values.display_name,
      email: values.email,
      location_country: values.location_country,
      password: values.password,
    })
  }

  return (
    <div className="editorial-public-page min-h-screen">
      <PublicPageHeader />

      <main className="mx-auto grid max-w-7xl lg:grid-cols-12">
        <section className="border-b border-[var(--rule)] bg-[var(--surface)] px-6 py-12 lg:col-span-5 lg:border-b-0 lg:border-r lg:px-10 lg:py-20">
          <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Begin your edition
          </p>
          <p className="editorial-display mt-8 text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">
            A study plan edited around you.
          </p>
          <div className="mt-12 border-y border-[var(--rule)] py-6">
            <p className="leading-7 text-[var(--muted)]">
              Your location selects the starting language for the interface and the AI
              quizzes. You can study in English or Vietnamese.
            </p>
          </div>
          <ol className="editorial-kicker mt-8 space-y-4 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            <li><span className="mr-3 text-[var(--accent)]">01</span>Create a course</li>
            <li><span className="mr-3 text-[var(--accent)]">02</span>Add your material</li>
            <li><span className="mr-3 text-[var(--accent)]">03</span>Begin the diagnostic</li>
          </ol>
        </section>

        <section className="px-6 py-12 lg:col-span-7 lg:px-12 lg:py-20">
          <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Start studying with intent
          </p>
          <h1 className="editorial-display mt-4 text-5xl font-medium tracking-[-0.04em]">
            Create your account
          </h1>

          <form className="mt-10 grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="editorial-kicker text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Display name
              </span>
              <input
                className="mt-2 w-full border px-4 py-3"
                {...register("display_name", { required: true })}
              />
            </label>
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
            <label className="block sm:col-span-2">
              <span className="editorial-kicker text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Location
              </span>
              <select
                className="mt-2 w-full border px-4 py-3"
                {...register("location_country", { required: true })}
              >
                <option value="United States">United States — English</option>
                <option value="Vietnam">Vietnam — Tiếng Việt</option>
              </select>
              <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
                This chooses the app language and the language used for AI quizzes.
              </span>
            </label>
            <label className="block">
              <span className="editorial-kicker text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Password
              </span>
              <input
                className="mt-2 w-full border px-4 py-3"
                type="password"
                {...register("password", { required: true, minLength: 8 })}
              />
              {errors.password ? (
                <span className="mt-2 block text-xs text-[var(--danger)]">
                  Password must be at least 8 characters.
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="editorial-kicker text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                Confirm password
              </span>
              <input
                className="mt-2 w-full border px-4 py-3"
                type="password"
                {...register("confirm_password", {
                  required: true,
                  validate: (value) => value === watch("password") || "Passwords do not match.",
                })}
              />
              {errors.confirm_password ? (
                <span className="mt-2 block text-xs text-[var(--danger)]">
                  {errors.confirm_password.message ?? "Please confirm your password."}
                </span>
              ) : null}
            </label>

            {createAccount.isError ? (
              <p className="border border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)] sm:col-span-2">
                Registration failed. The email may already be registered.
              </p>
            ) : null}

            <button
              className="editorial-kicker bg-[var(--accent)] px-4 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
              disabled={createAccount.isPending}
              type="submit"
            >
              {createAccount.isPending ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="editorial-kicker mt-8 border-t border-[var(--rule)] pt-6 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Already have an account?{" "}
            <Link className="font-bold text-[var(--accent)]" to="/login">
              Log in
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default RegisterPage

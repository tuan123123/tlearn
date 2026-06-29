import { useForm } from "react-hook-form"
import { Link, Navigate } from "react-router-dom"

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
    return <Navigate to="/" replace />
  }

  function onSubmit(values: LoginForm) {
    login.mutate(values)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Microeconomics AI Exam Coach
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Log in</h1>
      <p className="mt-3 text-slate-600">
        Continue to your course dashboard and exam countdowns.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="email"
            {...register("email", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="password"
            {...register("password", { required: true })}
          />
        </label>

        {login.isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Login failed. Check your email and password.
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
          disabled={login.isPending}
          type="submit"
        >
          {login.isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{" "}
        <Link className="font-semibold text-emerald-700" to="/register">
          Create an account
        </Link>
      </p>
    </main>
  )
}

export default LoginPage

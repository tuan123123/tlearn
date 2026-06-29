import { useForm } from "react-hook-form"
import { Link, Navigate } from "react-router-dom"

import { useRegister } from "../hooks/useAuth"
import { useAuthStore } from "../store/authStore"

interface RegisterForm {
  display_name: string
  email: string
  password: string
}

function RegisterPage() {
  const token = useAuthStore((state) => state.token)
  const createAccount = useRegister()
  const { register, handleSubmit } = useForm<RegisterForm>()

  if (token) {
    return <Navigate to="/" replace />
  }

  function onSubmit(values: RegisterForm) {
    createAccount.mutate(values)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Start studying smarter
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        Create your account
      </h1>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Display name</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("display_name", { required: true })}
          />
        </label>
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
            {...register("password", { required: true, minLength: 8 })}
          />
        </label>

        {createAccount.isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Registration failed. The email may already be registered.
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
          disabled={createAccount.isPending}
          type="submit"
        >
          {createAccount.isPending ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-emerald-700" to="/login">
          Log in
        </Link>
      </p>
    </main>
  )
}

export default RegisterPage

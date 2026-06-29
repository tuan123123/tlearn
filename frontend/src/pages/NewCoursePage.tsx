import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

import type { CreateCourseRequest } from "../api/types"
import { useCreateCourse } from "../hooks/useCourses"

function NewCoursePage() {
  const navigate = useNavigate()
  const createCourse = useCreateCourse()
  const { register, handleSubmit } = useForm<CreateCourseRequest>({
    defaultValues: {
      name: "Microeconomics",
      language: "en",
    },
  })

  function onSubmit(values: CreateCourseRequest) {
    createCourse.mutate(values, {
      onSuccess: () => navigate("/"),
    })
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <Link className="font-semibold text-emerald-700" to="/">
        Back to dashboard
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        Create a course
      </h1>
      <p className="mt-3 text-slate-600">
        Add your Microeconomics exam date so the coach can track the countdown.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Course name</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("name", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">University</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("university", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Language</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("language", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Exam date</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="date"
            {...register("exam_date", { required: true })}
          />
        </label>

        {createCourse.isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not create course. Check that the backend and MongoDB are running.
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
          disabled={createCourse.isPending}
          type="submit"
        >
          {createCourse.isPending ? "Creating..." : "Create course"}
        </button>
      </form>
    </main>
  )
}

export default NewCoursePage

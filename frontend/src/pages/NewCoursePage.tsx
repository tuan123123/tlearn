import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import type { CreateCourseRequest } from "../api/types"
import PageBackActions from "../components/PageBackActions"
import { useCreateCourse } from "../hooks/useCourses"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function NewCoursePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const createCourse = useCreateCourse()
  const { register, handleSubmit } = useForm<CreateCourseRequest>({
    defaultValues: {
      name: "Microeconomics",
      language,
    },
  })

  function onSubmit(values: CreateCourseRequest) {
    createCourse.mutate(values, {
      onSuccess: () => navigate("/dashboard"),
    })
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <PageBackActions />
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
        {text.createCourse}
      </h1>
      <p className="mt-3 text-slate-600">
        {text.createCourseHint}
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{text.courseName}</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("name", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{text.university}</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("university", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{text.courseLanguage}</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            {...register("language", { required: true })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{text.examDate}</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            type="date"
            {...register("exam_date", { required: true })}
          />
        </label>

        {createCourse.isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {text.createCourseError}
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
          disabled={createCourse.isPending}
          type="submit"
        >
          {createCourse.isPending ? text.creating : text.createCourse}
        </button>
      </form>
    </main>
  )
}

export default NewCoursePage

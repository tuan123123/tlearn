import { Link } from "react-router-dom"

import CourseCard from "../components/CourseCard"
import { useCourses } from "../hooks/useCourses"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const courses = useCourses()
  const text = uiText[languageFromUser(user?.language)]

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {text.dashboard}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            {text.welcome}{user ? `, ${user.display_name}` : ""}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
            to="/courses/new"
          >
            {text.newCourse}
          </Link>
          <button
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
            type="button"
            onClick={clearAuth}
          >
            {text.logOut}
          </button>
        </div>
      </header>

      <section className="mt-10">
        {courses.isLoading ? <p className="text-slate-600">{text.loadingCourses}</p> : null}

        {courses.isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {text.coursesError}
          </p>
        ) : null}

        {courses.data?.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-950">{text.noCourses}</h2>
            <p className="mt-2 text-slate-600">
              {text.noCoursesHint}
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {courses.data?.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage

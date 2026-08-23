import { Link } from "react-router-dom"

import CourseCard from "../components/CourseCard"
import { useCourses } from "../hooks/useCourses"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const courses = useCourses()
  const text = uiText[languageFromUser(user?.language)]

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="flex flex-col gap-6 border-b border-[var(--rule-strong)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="editorial-kicker text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {text.dashboard}
          </p>
          <h1 className="editorial-display mt-3 text-5xl font-medium tracking-[-0.04em] text-slate-950 sm:text-6xl">
            {text.welcome}{user ? `, ${user.display_name}` : ""}
          </h1>
        </div>
        <Link
          className="editorial-kicker inline-flex min-h-12 items-center justify-between gap-6 bg-[var(--accent)] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-ink)] transition hover:-translate-y-0.5"
          to="/courses/new"
        >
          {text.newCourse}
          <span aria-hidden="true">＋</span>
        </Link>
      </header>

      <section className="mt-10">
        {courses.isLoading ? <p className="text-slate-600">{text.loadingCourses}</p> : null}

        {courses.isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {text.coursesError}
          </p>
        ) : null}

        {courses.data?.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white p-10 text-center">
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

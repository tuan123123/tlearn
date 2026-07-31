import { Link, useParams } from "react-router-dom"

import ExamCountdown from "../components/ExamCountdown"
import PageBackActions from "../components/PageBackActions"
import { useCourse } from "../hooks/useCourses"
import { useCourseQuizzes } from "../hooks/useQuizzes"
import { useLatestStudyGuide } from "../hooks/useStudyGuides"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function CourseHomePage() {
  const { courseId } = useParams()
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const course = useCourse(courseId ?? "")
  const quizzes = useCourseQuizzes(courseId ?? "")
  const latestGuide = useLatestStudyGuide(courseId ?? "")

  if (!courseId) {
    return <main className="p-6 text-red-700">Missing course id.</main>
  }

  if (course.isLoading || quizzes.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingCourses}</main>
  }

  if (!course.data) {
    return <main className="p-6 text-red-700">Course not found.</main>
  }

  const latestSubmittedQuiz = quizzes.data?.find((quiz) => quiz.status === "submitted")

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <PageBackActions />

      <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.courseHub}
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              {course.data.name}
            </h1>
            <p className="mt-2 text-slate-600">{course.data.university}</p>
            <p className="mt-3 max-w-2xl text-slate-600">{text.courseHubSubtitle}</p>
          </div>
          <ExamCountdown daysUntilExam={course.data.days_until_exam} />
        </div>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{text.latestReport}</h2>
          {latestSubmittedQuiz ? (
            <>
              <p className="mt-2 text-sm text-slate-600">
                {text.diagnosticQuiz} ·{" "}
                {latestSubmittedQuiz.submitted_at
                  ? new Date(latestSubmittedQuiz.submitted_at).toLocaleString()
                  : ""}
              </p>
              <Link
                className="mt-5 inline-flex rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
                to={`/quizzes/${latestSubmittedQuiz.id}/results`}
              >
                {text.viewReport}
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-slate-600">{text.noReportYet}</p>
              <Link
                className="mt-5 inline-flex rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
                to={`/courses/${courseId}/diagnostic`}
              >
                {text.startDiagnostic}
              </Link>
            </>
          )}
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{text.latestStudyGuide}</h2>
          {latestGuide.data ? (
            <>
              <p className="mt-2 text-sm text-slate-600">
                {text.version} {latestGuide.data.version} · {latestGuide.data.days_until_exam}{" "}
                {text.daysUntilExam}
              </p>
              <Link
                className="mt-5 inline-flex rounded-xl bg-purple-700 px-4 py-3 font-bold text-white"
                to={`/courses/${courseId}/study-guide`}
              >
                {text.viewStudyGuide}
              </Link>
            </>
          ) : (
            <p className="mt-2 text-slate-600">{text.noStudyGuideYet}</p>
          )}
        </article>
      </section>

      <section className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">{text.continueSetup}</h2>
        <p className="mt-2 text-sm text-slate-600">{text.openSetupHint}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-blue-700 px-4 py-3 font-bold text-white"
            to={`/courses/${courseId}/mock-exams`}
          >
            {text.mockExams}
          </Link>
          <Link
            className="rounded-xl bg-purple-700 px-4 py-3 font-bold text-white"
            to={`/courses/${courseId}/progress`}
          >
            {text.viewProgress}
          </Link>
          <Link
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
            to={`/courses/${courseId}/setup`}
          >
            {text.continueSetup}
          </Link>
          <Link
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
            to={`/courses/${courseId}/diagnostic`}
          >
            {text.startDiagnostic}
          </Link>
        </div>
      </section>
    </main>
  )
}

export default CourseHomePage

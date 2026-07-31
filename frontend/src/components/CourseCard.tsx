import { Link } from "react-router-dom"

import type { Course, ScoreHistoryEvent } from "../api/types"
import { useMockExams } from "../hooks/useMockExams"
import { useReadiness, useScoreHistory } from "../hooks/useProgress"
import { useLatestStudyGuide } from "../hooks/useStudyGuides"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"
import ExamCountdown from "./ExamCountdown"
import ReadinessGauge from "./ReadinessGauge"
import ScoreTrendMiniChart from "./ScoreTrendMiniChart"

interface CourseCardProps {
  course: Course
}

function CourseCard({ course }: CourseCardProps) {
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const readiness = useReadiness(course.id)
  const scoreHistory = useScoreHistory(course.id)
  const latestGuide = useLatestStudyGuide(course.id)
  const mockExams = useMockExams(course.id)
  const nextAction = getNextAction(
    course.id,
    scoreHistory.data ?? [],
    Boolean(latestGuide.data),
    mockExams.data?.length ?? 0,
    text,
  )

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Link className="block" to={`/courses/${course.id}`}>
        <h2 className="text-xl font-bold text-slate-950">{course.name}</h2>
        <p className="mt-1 text-sm text-slate-600">{course.university}</p>
      </Link>

      <div className="mt-4">
        <ExamCountdown daysUntilExam={course.days_until_exam} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <ReadinessGauge language={language} readiness={readiness.data} />
        <ScoreTrendMiniChart history={scoreHistory.data} />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-600">
        {course.uploaded_file_count}{" "}
        {course.uploaded_file_count === 1 ? text.uploadedFile : text.uploadedFiles}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
          to={nextAction.to}
        >
          {nextAction.label}
        </Link>
        <Link
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
          to={`/courses/${course.id}/progress`}
        >
          {text.viewProgress}
        </Link>
      </div>
    </article>
  )
}

function getNextAction(
  courseId: string,
  history: ScoreHistoryEvent[],
  hasGuide: boolean,
  mockCount: number,
  text: typeof uiText.en,
) {
  const diagnostic = history.find((event) => event.event_type === "diagnostic")
  if (!diagnostic) {
    return { label: text.startDiagnosticQuiz, to: `/courses/${courseId}/diagnostic` }
  }
  if (!hasGuide) {
    return { label: text.generateGuideFromResults, to: `/quizzes/${diagnostic.event_id}/results` }
  }
  if (mockCount === 0) {
    return { label: text.takeMockExam, to: `/courses/${courseId}/mock-exams` }
  }
  return { label: text.viewProgress, to: `/courses/${courseId}/progress` }
}

export default CourseCard

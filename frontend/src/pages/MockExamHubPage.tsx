import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import MockExamCard from "../components/MockExamCard"
import PageBackActions from "../components/PageBackActions"
import TimeBandBanner from "../components/TimeBandBanner"
import { useCourse } from "../hooks/useCourses"
import { useGenerateMockExam, useMockExams } from "../hooks/useMockExams"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function MockExamHubPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const course = useCourse(courseId ?? "")
  const mockExams = useMockExams(courseId ?? "")
  const generateMock = useGenerateMockExam(courseId ?? "")
  const [checklist, setChecklist] = useState<string[]>([])
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, string>>({})

  if (!courseId) {
    return <main className="p-6 text-red-700">Missing course id.</main>
  }

  if (course.isLoading || mockExams.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingCourses}</main>
  }

  const band = timeBandFromDays(course.data?.days_until_exam ?? 0)
  const rule = ruleForBand(band)

  async function handleGenerate() {
    const confirmed = window.confirm(
      `${text.mockConfirm} ${rule.questionCount} ${text.questionsCount} based on ${
        course.data?.days_until_exam ?? 0
      } ${text.daysUntilExam}. ${text.readyForMock}`,
    )
    if (!confirmed) {
      return
    }
    const response = await generateMock.mutateAsync()
    if (response.mode === "exam_day") {
      setChecklist(response.checklist)
      return
    }
    if (response.mock_exam) {
      navigate(`/mock-exams/${response.mock_exam.id}`)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <PageBackActions />

      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.mockExamHub}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          {text.mockExams}
        </h1>
      </header>

      <div className="mt-6">
        <TimeBandBanner
          daysUntilExam={course.data?.days_until_exam ?? 0}
          durationMinutes={rule.durationMinutes}
          language={language}
          questionCount={rule.questionCount}
          timeBand={band}
        />
      </div>

      <button
        className="mt-5 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:bg-slate-300"
        disabled={generateMock.isPending}
        type="button"
        onClick={handleGenerate}
      >
        {generateMock.isPending ? text.generatingMockExam : text.generateMockExam}
      </button>

      {checklist.length > 0 ? (
        <section className="mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{text.examDayChecklist}</h2>
          <div className="mt-4 space-y-4">
            {checklist.map((item) => (
              <div className="rounded-2xl bg-slate-50 p-4" key={item}>
                <p className="font-bold text-slate-900">{item}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[text.confident, text.reviewQuickly, text.unsure].map((choice) => (
                    <button
                      className={`rounded-xl px-3 py-2 text-sm font-bold ${
                        checklistAnswers[item] === choice
                          ? "bg-purple-700 text-white"
                          : "bg-white text-slate-700 border border-slate-300"
                      }`}
                      key={choice}
                      type="button"
                      onClick={() =>
                        setChecklistAnswers((current) => ({ ...current, [item]: choice }))
                      }
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-lg font-bold text-purple-700">{text.goodLuck}</p>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {mockExams.data?.map((mockExam) => (
          <Link key={mockExam.id} to={`/mock-exams/${mockExam.id}/results`}>
            <MockExamCard language={language} mockExam={mockExam} />
          </Link>
        ))}
      </section>
    </main>
  )
}

function timeBandFromDays(days: number) {
  if (days >= 14) return "14+" as const
  if (days >= 7) return "7-13" as const
  if (days >= 3) return "3-6" as const
  if (days >= 1) return "1-2" as const
  return "exam_day" as const
}

function ruleForBand(band: ReturnType<typeof timeBandFromDays>) {
  if (band === "14+") return { questionCount: 40, durationMinutes: 80 }
  if (band === "7-13") return { questionCount: 25, durationMinutes: 50 }
  if (band === "3-6") return { questionCount: 15, durationMinutes: 30 }
  if (band === "1-2") return { questionCount: 10, durationMinutes: 20 }
  return { questionCount: 0, durationMinutes: null }
}

export default MockExamHubPage

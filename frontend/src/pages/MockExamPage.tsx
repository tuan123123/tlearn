import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import ExamTimer from "../components/ExamTimer"
import MockExamNavigator from "../components/MockExamNavigator"
import MockExamQuestionCard from "../components/MockExamQuestionCard"
import { useMockExam, useSubmitMockExam } from "../hooks/useMockExams"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function MockExamPage() {
  const { mockExamId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const mockExam = useMockExam(mockExamId ?? "")
  const submitMockExam = useSubmitMockExam(mockExamId ?? "")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({})
  const submittedRef = useRef(false)

  const questions = mockExam.data?.questions ?? []
  const currentQuestion = questions[currentIndex]
  const unansweredCount = useMemo(
    () => questions.filter((question) => !answers[question.id]?.trim()).length,
    [answers, questions],
  )

  useEffect(() => {
    setQuestionStartedAt(Date.now())
  }, [currentIndex])

  function saveCurrentQuestionTime() {
    if (!currentQuestion) {
      return
    }
    const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))
    setTimeSpent((current) => ({
      ...current,
      [currentQuestion.id]: (current[currentQuestion.id] ?? 0) + seconds,
    }))
  }

  function goToQuestion(nextIndex: number) {
    saveCurrentQuestionTime()
    setCurrentIndex(nextIndex)
  }

  const submitExam = useCallback(
    async (force = false) => {
      if (!mockExamId || submittedRef.current || !mockExam.data) {
        return
      }
      if (!force && unansweredCount > 0) {
        const confirmed = window.confirm(`${unansweredCount} ${text.unansweredSubmit}`)
        if (!confirmed) {
          return
        }
      }
      submittedRef.current = true
      const finalTimeSpent = { ...timeSpent }
      if (currentQuestion) {
        const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))
        finalTimeSpent[currentQuestion.id] = (finalTimeSpent[currentQuestion.id] ?? 0) + seconds
      }
      const payload = mockExam.data.questions.map((question) => ({
        question_id: question.id,
        student_answer: answers[question.id] ?? "",
        time_spent_seconds: finalTimeSpent[question.id] ?? 0,
      }))
      await submitMockExam.mutateAsync(payload)
      navigate(`/mock-exams/${mockExamId}/results`)
    },
    [
      answers,
      currentQuestion,
      mockExam.data,
      mockExamId,
      navigate,
      questionStartedAt,
      submitMockExam,
      text.unansweredSubmit,
      timeSpent,
      unansweredCount,
    ],
  )

  if (mockExam.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingQuiz}</main>
  }

  if (!mockExam.data || !currentQuestion) {
    return <main className="p-6 text-red-700">{text.quizNotFound}</main>
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              {text.mockExams} #{mockExam.data.mock_number}
            </p>
            <h1 className="text-3xl font-black text-slate-950">{text.fullMock}</h1>
          </div>
          {mockExam.data.duration_minutes ? (
            <ExamTimer
              durationMinutes={mockExam.data.duration_minutes}
              language={language}
              onExpire={() => submitExam(true)}
            />
          ) : null}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <MockExamNavigator
            answers={answers}
            currentIndex={currentIndex}
            flagged={flagged}
            questions={questions}
            onSelectQuestion={goToQuestion}
          />
          <MockExamQuestionCard
            answer={answers[currentQuestion.id] ?? ""}
            flagged={Boolean(flagged[currentQuestion.id])}
            language={language}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswerChange={(answer) =>
              setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }))
            }
            onToggleFlag={() =>
              setFlagged((current) => ({
                ...current,
                [currentQuestion.id]: !current[currentQuestion.id],
              }))
            }
          />
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 disabled:opacity-50"
            disabled={currentIndex === 0}
            type="button"
            onClick={() => goToQuestion(currentIndex - 1)}
          >
            {text.previous}
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              className="rounded-xl bg-blue-700 px-4 py-3 font-bold text-white"
              type="button"
              onClick={() => goToQuestion(currentIndex + 1)}
            >
              {text.next}
            </button>
          ) : (
            <button
              className="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:bg-slate-300"
              disabled={submitMockExam.isPending}
              type="button"
              onClick={() => submitExam(false)}
            >
              {submitMockExam.isPending ? text.submitting : text.submitExam}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default MockExamPage

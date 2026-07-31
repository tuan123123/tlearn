import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import PageBackActions from "../components/PageBackActions"
import ProgressBar from "../components/ProgressBar"
import QuestionCard from "../components/QuestionCard"
import QuestionNavigator from "../components/QuestionNavigator"
import { useQuiz, useSubmitQuiz } from "../hooks/useQuizzes"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const quiz = useQuiz(quizId ?? "")
  const submitQuiz = useSubmitQuiz(quizId ?? "")
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({})

  const questions = quiz.data?.questions ?? []
  const currentQuestion = questions[currentIndex]
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]?.trim()).length,
    [answers, questions],
  )
  const allAnswered = questions.length > 0 && answeredCount === questions.length

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

  async function handleSubmit() {
    if (!quizId || !window.confirm(text.submitConfirm)) {
      return
    }
    const finalTimeSpent = { ...timeSpent }
    if (currentQuestion) {
      const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))
      finalTimeSpent[currentQuestion.id] = (finalTimeSpent[currentQuestion.id] ?? 0) + seconds
    }
    const payload = questions.map((question) => ({
      question_id: question.id,
      student_answer: answers[question.id] ?? "",
      time_spent_seconds: finalTimeSpent[question.id] ?? 1,
    }))
    await submitQuiz.mutateAsync(payload)
    navigate(`/quizzes/${quizId}/results`)
  }

  if (quiz.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingQuiz}</main>
  }

  if (!currentQuestion) {
    return <main className="p-6 text-red-700">{text.quizNotFound}</main>
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <PageBackActions />

      <div className="mt-6">
        <ProgressBar answered={answeredCount} total={questions.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <QuestionNavigator
          answers={answers}
          currentIndex={currentIndex}
          questions={questions}
          onSelectQuestion={goToQuestion}
        />

        <QuestionCard
            answer={answers[currentQuestion.id] ?? ""}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswerChange={(answer) =>
              setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }))
            }
          />
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <button
          className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 disabled:opacity-50"
          disabled={currentIndex === 0}
          type="button"
          onClick={() => goToQuestion(currentIndex - 1)}
        >
          {text.previous}
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
            type="button"
          onClick={() => goToQuestion(currentIndex + 1)}
        >
            {text.next}
          </button>
        ) : (
          <button
            className="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:bg-slate-300"
            disabled={!allAnswered || submitQuiz.isPending}
            type="button"
            onClick={handleSubmit}
          >
            {submitQuiz.isPending ? text.submitting : text.submitQuiz}
          </button>
        )}
      </div>
    </main>
  )
}

export default QuizPage

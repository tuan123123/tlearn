import { useNavigate, useParams } from "react-router-dom"

import PageBackActions from "../components/PageBackActions"
import QuizGenerationAnimation from "../components/QuizGenerationAnimation"
import { useCreateDiagnosticQuiz, useGenerateQuestions } from "../hooks/useQuizzes"
import { useTopics } from "../hooks/useTopics"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function DiagnosticPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const topics = useTopics(courseId ?? "")
  const generateQuestions = useGenerateQuestions(courseId ?? "")
  const createQuiz = useCreateDiagnosticQuiz(courseId ?? "")
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]

  if (!courseId) {
    return <main className="p-6 text-red-700">Missing course id.</main>
  }

  const approvedTopics = topics.data?.filter((topic) => topic.is_approved) ?? []
  const isLoading = generateQuestions.isPending || createQuiz.isPending

  async function handleGenerateDiagnostic() {
    const topicIds = approvedTopics.map((topic) => topic.id)
    await generateQuestions.mutateAsync(topicIds)
    const quiz = await createQuiz.mutateAsync()
    navigate(`/quizzes/${quiz.id}`)
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <PageBackActions />

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.diagnosticQuiz}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {text.generateDiagnosticTitle}
        </h1>
        <p className="mt-4 text-slate-600">
          {text.generateDiagnosticDescription}
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <strong>{approvedTopics.length}</strong> {text.approvedTopicsSelected}
        </div>

        {isLoading ? <QuizGenerationAnimation /> : null}

        {(generateQuestions.isError || createQuiz.isError) ? (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {text.diagnosticError}
          </p>
        ) : null}

        <button
          className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:bg-slate-300"
          disabled={isLoading || approvedTopics.length === 0}
          type="button"
          onClick={handleGenerateDiagnostic}
        >
          {isLoading ? text.generatingDiagnostic : text.generateDiagnostic}
        </button>
      </section>
    </main>
  )
}

export default DiagnosticPage

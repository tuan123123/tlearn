import { useNavigate, useParams } from "react-router-dom"

import BloomRadarChart from "../components/BloomRadarChart"
import FormulaText from "../components/FormulaText"
import PageBackActions from "../components/PageBackActions"
import TopicSkillBloomGrid from "../components/TopicSkillBloomGrid"
import WeakTopicTable from "../components/WeakTopicTable"
import { useQuizResults } from "../hooks/useQuizzes"
import { useGenerateStudyGuide } from "../hooks/useStudyGuides"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function QuizResultsPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const results = useQuizResults(quizId ?? "")
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const generateStudyGuide = useGenerateStudyGuide(results.data?.quiz.course_id ?? "")

  if (results.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingResults}</main>
  }

  if (!results.data) {
    return <main className="p-6 text-red-700">{text.resultsNotFound}</main>
  }

  const attemptsByQuestion = new Map(
    results.data.attempts.map((attempt) => [attempt.question_id, attempt]),
  )
  const accuracy =
    results.data.total_questions === 0
      ? 0
      : Math.round((results.data.total_score / results.data.total_questions) * 100)

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <PageBackActions />

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.diagnosticResults}
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
          <div className="rounded-3xl bg-slate-950 p-6 text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              {text.score}
            </p>
            <h1 className="mt-2 text-5xl font-black">
              {results.data.total_score} / {results.data.total_questions}
            </h1>
            <p className="mt-2 text-lg font-bold text-emerald-300">
              {accuracy}% {text.accuracy}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{text.weaknessSummary}</h2>
            <p className="mt-3 text-slate-700">
              {results.data.weakness_report.weakness_summary}
            </p>
            <p className="mt-4 text-sm text-slate-500">
              {text.correct}: {results.data.correct_count} {text.of}{" "}
              {results.data.total_questions}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">{text.weaknessBreakdown}</h2>
        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          <WeakTopicTable
            language={language}
            topicScores={results.data.weakness_report.topic_scores}
          />
          <BloomRadarChart
            bloomScores={results.data.weakness_report.bloom_scores}
            language={language}
          />
        </div>
        <div className="mt-5">
          <TopicSkillBloomGrid attempts={results.data.attempts} language={language} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">{text.questions}</h2>
        <div className="mt-4 space-y-4">
          {results.data.questions.map((question, index) => {
            const attempt = attemptsByQuestion.get(question.id)
            return (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={question.id}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <h3 className="font-bold text-slate-950">
                    {index + 1}. <FormulaText text={question.question_text} />
                  </h3>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                      L{question.bloom_level} {question.bloom_label}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      {question.topic_name}
                    </span>
                  </div>
                </div>

                <p
                  className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                    attempt?.is_correct
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  <span className="font-bold">{text.yourAnswer}:</span>{" "}
                  <FormulaText text={attempt?.student_answer || text.noAnswer} />
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  <span className="font-bold">{text.correctAnswer}:</span>{" "}
                  <FormulaText text={question.correct_answer} />
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-bold">{text.explanation}:</span>{" "}
                  <FormulaText text={question.explanation} />
                </p>
                {attempt?.ai_feedback ? (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    <span className="font-bold">{text.aiFeedback}:</span>{" "}
                    <FormulaText text={attempt.ai_feedback} />
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <button
          className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
          disabled={generateStudyGuide.isPending}
          type="button"
          onClick={async () => {
            if (!quizId || !results.data?.quiz.course_id) {
              return
            }
            const guide = await generateStudyGuide.mutateAsync(quizId)
            navigate(`/courses/${results.data.quiz.course_id}/study-guide`, {
              state: { generatedVersion: guide.version },
            })
          }}
        >
          {generateStudyGuide.isPending ? text.generatingStudyGuide : text.generateStudyGuide}
        </button>
      </div>
    </main>
  )
}

export default QuizResultsPage

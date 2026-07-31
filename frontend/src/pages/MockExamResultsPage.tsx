import { Link, useParams } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import FormulaText from "../components/FormulaText"
import PageBackActions from "../components/PageBackActions"
import { useMockExamResults } from "../hooks/useMockExams"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function MockExamResultsPage() {
  const { mockExamId } = useParams()
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const results = useMockExamResults(mockExamId ?? "")

  if (results.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingResults}</main>
  }

  if (!results.data) {
    return <main className="p-6 text-red-700">{text.resultsNotFound}</main>
  }

  const attempt = results.data.attempt
  const answersByQuestion = new Map(
    attempt.answers.map((answer) => [answer.question_id, answer]),
  )
  const bloomData = [1, 2, 3, 4, 5, 6].map((level) => ({
    level: `L${level}`,
    diagnostic: Math.round((results.data.diagnostic_bloom_scores[String(level)] ?? 0) * 100),
    mock: Math.round((attempt.bloom_scores[String(level)] ?? 0) * 100),
  }))
  const topics = Array.from(
    new Set([
      ...Object.keys(attempt.topic_scores),
      ...Object.keys(results.data.diagnostic_topic_scores),
    ]),
  ).sort()

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <PageBackActions />

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          {text.mockResults}
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
          <div className="rounded-3xl bg-slate-950 p-6 text-center text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              {text.score}
            </p>
            <h1 className="mt-2 text-5xl font-black">
              {attempt.correct_count} / {results.data.mock_exam.question_count}
            </h1>
            <p className="mt-2 text-lg font-bold text-emerald-300">
              {Math.round(attempt.total_score * 100)}% {text.accuracy}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge value={attempt.vs_diagnostic} label={text.vsDiagnostic} />
            <Badge value={attempt.vs_previous_mock} label={text.vsPreviousMock} />
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
              {trendLabel(attempt.trend, text)}
            </span>
          </div>
        </div>
      </section>

      {attempt.study_guide_version ? (
        <section className="mt-5 rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-800">
          <p className="font-bold">
            {text.updatedStudyGuide}: {text.studyGuideReady} v{attempt.study_guide_version}
          </p>
          <Link
            className="mt-2 inline-flex font-bold text-emerald-700"
            to={`/courses/${results.data.mock_exam.course_id}/study-guide`}
          >
            {text.viewStudyGuide}
          </Link>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">{text.bloomRadar}</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={bloomData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="diagnostic" fill="#94a3b8" name={text.diagnostic} />
              <Bar dataKey="mock" fill="#2563eb" name={text.thisMock} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">{text.topicScores}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 pr-4">{text.topic}</th>
                <th className="py-2 pr-4">{text.thisMock}</th>
                <th className="py-2 pr-4">{text.diagnostic}</th>
                <th className="py-2">{text.change}</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => {
                const mock = attempt.topic_scores[topic]?.accuracy ?? 0
                const diagnostic = results.data?.diagnostic_topic_scores[topic]?.accuracy ?? 0
                return (
                  <tr className="border-t border-slate-100" key={topic}>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{topic}</td>
                    <td className="py-3 pr-4">{Math.round(mock * 100)}%</td>
                    <td className="py-3 pr-4">{Math.round(diagnostic * 100)}%</td>
                    <td className="py-3">{formatSignedPercent(mock - diagnostic)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">{text.questions}</h2>
        <div className="mt-4 space-y-4">
          {results.data.questions.map((question, index) => {
            const answer = answersByQuestion.get(question.id)
            return (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={question.id}>
                <h3 className="font-bold text-slate-950">
                  {index + 1}. <FormulaText text={question.question_text} />
                </h3>
                <p
                  className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                    answer?.is_correct ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <span className="font-bold">{text.yourAnswer}:</span>{" "}
                  <FormulaText text={answer?.student_answer || text.noAnswer} />
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  <span className="font-bold">{text.correctAnswer}:</span>{" "}
                  <FormulaText text={question.correct_answer} />
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="font-bold">{text.explanation}:</span>{" "}
                  <FormulaText text={question.explanation} />
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function Badge({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return null
  }
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${
        value >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {formatSignedPercent(value)} {label}
    </span>
  )
}

function formatSignedPercent(value: number) {
  const percent = Math.round(value * 100)
  return `${percent >= 0 ? "+" : ""}${percent}%`
}

function trendLabel(trend: string, text: typeof uiText.en) {
  if (trend === "improving") return `↑ ${text.improving}`
  if (trend === "declining") return `↓ ${text.declining}`
  if (trend === "stagnant") return `→ ${text.stagnant}`
  return text.firstMock
}

export default MockExamResultsPage

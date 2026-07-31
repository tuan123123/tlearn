import type { Attempt } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface TopicSkillBloomGridProps {
  attempts: Attempt[]
  language: Language
}

interface GridCell {
  accuracy: number
  questionCount: number
  skills: string[]
}

const BLOOM_LEVELS = [1, 2, 3, 4, 5, 6]

function TopicSkillBloomGrid({ attempts, language }: TopicSkillBloomGridProps) {
  const text = uiText[language]
  const topics = Array.from(new Set(attempts.map((attempt) => attempt.topic_name))).sort()

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{text.topicBloomGrid}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-2 text-sm">
          <thead>
            <tr>
              <th className="text-left text-slate-500">{text.topic}</th>
              {BLOOM_LEVELS.map((level) => (
                <th className="text-center text-slate-500" key={level}>
                  L{level}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic}>
                <td className="max-w-56 pr-3 font-semibold text-slate-900">{topic}</td>
                {BLOOM_LEVELS.map((level) => {
                  const cell = buildCell(attempts, topic, level)
                  return (
                    <td
                      className={`rounded-xl px-3 py-3 text-center font-bold ${cellClass(cell)}`}
                      key={level}
                      title={cellTitle(cell, text)}
                    >
                      {cell.questionCount === 0 ? "—" : `${Math.round(cell.accuracy * 100)}%`}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function buildCell(attempts: Attempt[], topic: string, bloomLevel: number): GridCell {
  const matchingAttempts = attempts.filter(
    (attempt) => attempt.topic_name === topic && attempt.bloom_level === bloomLevel,
  )
  const questionCount = matchingAttempts.length
  const accuracy = questionCount
    ? matchingAttempts.reduce((total, attempt) => total + attempt.score, 0) / questionCount
    : 0
  const skills = Array.from(new Set(matchingAttempts.map((attempt) => attempt.skill)))

  return { accuracy, questionCount, skills }
}

function cellClass(cell: GridCell) {
  if (cell.questionCount === 0) {
    return "bg-slate-100 text-slate-400"
  }
  if (cell.accuracy < 0.4) {
    return "bg-red-100 text-red-700"
  }
  if (cell.accuracy < 0.7) {
    return "bg-amber-100 text-amber-700"
  }
  return "bg-emerald-100 text-emerald-700"
}

function cellTitle(cell: GridCell, text: typeof uiText.en) {
  if (cell.questionCount === 0) {
    return text.noQuestions
  }

  return `${text.accuracy}: ${Math.round(cell.accuracy * 100)}% | ${text.questions}: ${
    cell.questionCount
  } | ${cell.skills.join(", ")}`
}

export default TopicSkillBloomGrid

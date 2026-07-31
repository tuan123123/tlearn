import type { Question } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"
import FormulaText from "./FormulaText"

interface MockExamQuestionCardProps {
  answer: string
  flagged: boolean
  language: Language
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswerChange: (answer: string) => void
  onToggleFlag: () => void
}

function MockExamQuestionCard({
  answer,
  flagged,
  language,
  question,
  questionNumber,
  totalQuestions,
  onAnswerChange,
  onToggleFlag,
}: MockExamQuestionCardProps) {
  const text = uiText[language]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex justify-between gap-3">
        <p className="font-semibold text-slate-600">
          {text.question} {questionNumber} {text.of} {totalQuestions}
        </p>
        <button
          className={`rounded-xl px-3 py-2 text-sm font-bold ${
            flagged ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700"
          }`}
          type="button"
          onClick={onToggleFlag}
        >
          {flagged ? text.flagged : text.flagForReview}
        </button>
      </div>

      <h1 className="mt-5 text-2xl font-bold leading-relaxed text-slate-950">
        <FormulaText text={question.question_text} />
      </h1>

      <div className="mt-6">
        {question.question_type === "mcq" ? (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const value = option.slice(0, 1)
              return (
                <label className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-4" key={option}>
                  <input
                    checked={answer === value}
                    name={question.id}
                    type="radio"
                    value={value}
                    onChange={() => onAnswerChange(value)}
                  />
                  <span><FormulaText text={option} /></span>
                </label>
              )
            })}
          </div>
        ) : null}

        {question.question_type === "numeric" ? (
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            type="number"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
          />
        ) : null}

        {question.question_type === "short_answer" ? (
          <textarea
            className="min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
          />
        ) : null}
      </div>
    </section>
  )
}

export default MockExamQuestionCard

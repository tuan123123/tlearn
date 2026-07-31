import type { Question } from "../api/types"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"
import FormulaText from "./FormulaText"

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  answer: string
  onAnswerChange: (answer: string) => void
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
}: QuestionCardProps) {
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-slate-600">
          {text.question} {questionNumber} {text.of} {totalQuestions}
        </p>
        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          {question.bloom_label}
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-bold leading-relaxed text-slate-950">
        <FormulaText text={question.question_text} />
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {question.topic_name} · {question.skill}
      </p>

      <div className="mt-6">
        {question.question_type === "mcq" ? (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const value = option.slice(0, 1)
              return (
                <label
                  className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-4"
                  key={option}
                >
                  <input
                    checked={answer === value}
                    name={question.id}
                    type="radio"
                    value={value}
                    onChange={() => onAnswerChange(value)}
                  />
                  <span>
                    <FormulaText text={option} />
                  </span>
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

export default QuestionCard

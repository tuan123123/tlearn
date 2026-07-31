import type { ReactNode } from "react"

interface FormulaTextProps {
  text: string
}

const FORMULA_PATTERN = /[A-Za-z]+(?:_[A-Za-z0-9]+)+(?:\/[A-Za-z0-9_]+)?|[A-Z][A-Za-z]*\/[A-Za-z]+/g

function FormulaText({ text }: FormulaTextProps) {
  const parts: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(FORMULA_PATTERN)) {
    const formula = match[0]
    const index = match.index ?? 0
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index))
    }
    parts.push(<FormulaToken formula={formula} key={`${formula}-${index}`} />)
    lastIndex = index + formula.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}

function FormulaToken({ formula }: { formula: string }) {
  const [numerator, denominator] = formula.split("/")

  return (
    <span className="mx-0.5 whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-0.5 font-serif text-[1.02em] italic text-slate-950">
      <FormulaPart value={numerator} />
      {denominator ? (
        <>
          <span className="px-0.5">/</span>
          <FormulaPart value={denominator} />
        </>
      ) : null}
    </span>
  )
}

function FormulaPart({ value }: { value: string }) {
  const [base, subscript] = value.split("_")

  return (
    <>
      {base}
      {subscript ? <sub className="text-[0.72em] not-italic">{subscript}</sub> : null}
    </>
  )
}

export default FormulaText

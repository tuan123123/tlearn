import { useEffect, useState } from "react"

import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface ExamTimerProps {
  durationMinutes: number
  language: Language
  onExpire: () => void
}

function ExamTimer({ durationMinutes, language, onExpire }: ExamTimerProps) {
  const totalSeconds = durationMinutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const text = uiText[language]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          onExpire()
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [onExpire])

  const ratio = secondsLeft / totalSeconds
  const colorClass = ratio <= 0.1 ? "text-red-700" : ratio <= 0.25 ? "text-amber-700" : "text-slate-950"

  return (
    <div className={`rounded-2xl bg-white px-4 py-3 text-right font-black shadow-sm ${colorClass}`}>
      {formatTime(secondsLeft)} {text.remaining}
    </div>
  )
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
}

export default ExamTimer

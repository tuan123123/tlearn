import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import FeedbackForm from "../components/FeedbackForm"
import type { Language } from "../i18n"

const pageText = {
  en: {
    demoPage: "Demo page",
    tryApp: "Try app",
    toggleLanguage: "Tiếng Việt",
    eyebrow: "Feedback",
    title: "Help shape the exam coach.",
    subtitle:
      "Report bugs, request features, flag content issues, or leave general thoughts. The smaller the friction, the better the product gets.",
    examplesTitle: "Good feedback examples",
    examples: [
      "A quiz answer is marked wrong even though my explanation is correct.",
      "I want mock exams to show estimated exam readiness before I submit.",
      "The Vietnamese wording for elasticity feels unnatural.",
    ],
  },
  vi: {
    demoPage: "Trang demo",
    tryApp: "Dùng thử",
    toggleLanguage: "English",
    eyebrow: "Góp ý",
    title: "Giúp mình hoàn thiện exam coach.",
    subtitle:
      "Bạn có thể báo lỗi, đề xuất tính năng, báo vấn đề nội dung, hoặc gửi góp ý chung. Càng dễ góp ý, sản phẩm càng tốt hơn.",
    examplesTitle: "Ví dụ góp ý hay",
    examples: [
      "Một câu quiz bị chấm sai dù phần giải thích của mình đúng.",
      "Mình muốn bài thi thử hiện độ sẵn sàng trước khi nộp.",
      "Cách diễn đạt tiếng Việt cho độ co giãn chưa tự nhiên.",
    ],
  },
}

function FeedbackPage() {
  const [language, setLanguage] = useState<Language>("en")
  const location = useLocation()
  const text = pageText[language]
  const fromRoute =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : location.pathname

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bbf7d0,transparent_34%),linear-gradient(135deg,#f8fafc,#ecfeff)] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link className="text-lg font-black tracking-tight text-slate-950" to="/landing">
            Tlearn
          </Link>
          <div className="flex flex-wrap justify-end gap-3 text-sm font-semibold">
            <button
              className="rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-emerald-800 shadow-sm"
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
              type="button"
            >
              {text.toggleLanguage}
            </button>
            <Link className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm" to="/landing">
              {text.demoPage}
            </Link>
            <Link className="rounded-full bg-slate-950 px-4 py-2 text-white" to="/register">
              {text.tryApp}
            </Link>
          </div>
        </nav>

        <section className="grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">
              {text.eyebrow}
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">
              {text.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{text.subtitle}</p>
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <p className="font-black text-slate-950">{text.examplesTitle}</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {text.examples.map((example) => (
                  <li key={example}>“{example}”</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl shadow-emerald-900/10 backdrop-blur sm:p-8">
            <FeedbackForm language={language} pageContext={`came from ${fromRoute}`} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default FeedbackPage

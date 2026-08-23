import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import FeedbackForm from "../components/FeedbackForm"
import PublicPageHeader from "../components/PublicPageHeader"
import type { Language } from "../i18n"

const pageText = {
  en: {
    tryApp: "Try app",
    toggleLanguage: "Tiếng Việt",
    eyebrow: "Letters to Tlearn · Feedback",
    title: "Help shape the exam coach.",
    subtitle:
      "Report bugs, request features, flag content issues, or leave general thoughts. The smaller the friction, the better the product gets.",
    examplesTitle: "Good feedback is specific",
    examples: [
      "A quiz answer is marked wrong even though my explanation is correct.",
      "I want mock exams to show estimated exam readiness before I submit.",
      "The Vietnamese wording for elasticity feels unnatural.",
    ],
  },
  vi: {
    tryApp: "Dùng thử",
    toggleLanguage: "English",
    eyebrow: "Thư gửi Tlearn · Góp ý",
    title: "Giúp mình hoàn thiện exam coach.",
    subtitle:
      "Bạn có thể báo lỗi, đề xuất tính năng, báo vấn đề nội dung, hoặc gửi góp ý chung. Càng dễ góp ý, sản phẩm càng tốt hơn.",
    examplesTitle: "Góp ý tốt thường rất cụ thể",
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
    <div className="editorial-public-page min-h-screen">
      <PublicPageHeader />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="editorial-kicker flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule-strong)] pb-5 text-xs uppercase tracking-[0.14em]">
          <span className="text-[var(--accent)]">{text.eyebrow}</span>
          <div className="flex items-center gap-3">
            <button
              className="min-h-11 border border-[var(--rule-strong)] px-4 text-[var(--ink)] transition hover:bg-[var(--surface)]"
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
              type="button"
            >
              {text.toggleLanguage}
            </button>
            <Link
              className="inline-flex min-h-11 items-center bg-[var(--accent)] px-4 font-bold text-[var(--accent-ink)]"
              to="/register"
            >
              {text.tryApp}
            </Link>
          </div>
        </div>

        <section className="grid lg:grid-cols-12">
          <div className="border-b border-[var(--rule)] py-10 lg:col-span-6 lg:border-b-0 lg:border-r lg:py-14 lg:pr-12">
            <h1 className="editorial-display max-w-3xl text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              {text.title}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">{text.subtitle}</p>

            <div className="mt-12 border-y border-[var(--rule)] py-7">
              <p className="editorial-kicker text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
                {text.examplesTitle}
              </p>
              <ol className="mt-6 space-y-5">
                {text.examples.map((example, index) => (
                  <li className="grid grid-cols-[2rem_1fr] gap-3 leading-7 text-[var(--muted)]" key={example}>
                    <span className="editorial-kicker text-xs text-[var(--warm)]">0{index + 1}</span>
                    <span>“{example}”</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-[var(--panel)] py-10 lg:col-span-6 lg:py-14 lg:pl-12">
            <div className="border border-[var(--rule-strong)] p-6 sm:p-8">
              <FeedbackForm language={language} pageContext={`came from ${fromRoute}`} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default FeedbackPage

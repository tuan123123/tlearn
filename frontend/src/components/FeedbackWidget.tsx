import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import FeedbackForm from "./FeedbackForm"
import type { Language } from "../i18n"

function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const location = useLocation()

  if (location.pathname === "/feedback") {
    return null
  }

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-40 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl shadow-slate-900/30"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Feedback
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/30 p-4 backdrop-blur-sm sm:p-6">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black text-slate-950">
                  {language === "en" ? "Send feedback" : "Gửi góp ý"}
                </p>
                <Link
                  className="mt-1 block text-xs font-semibold text-emerald-700"
                  onClick={() => setIsOpen(false)}
                  state={{ from: location.pathname }}
                  to="/feedback"
                >
                  {language === "en" ? "Open full page" : "Mở trang đầy đủ"}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"
                  onClick={() => setLanguage(language === "en" ? "vi" : "en")}
                  type="button"
                >
                  {language === "en" ? "Tiếng Việt" : "English"}
                </button>
                <button
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            </div>

            <FeedbackForm
              compact
              language={language}
              onSuccess={() => window.setTimeout(() => setIsOpen(false), 1400)}
              pageContext={`came from ${location.pathname}`}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default FeedbackWidget

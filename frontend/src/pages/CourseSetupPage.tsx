import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import type { UploadedFileListItem } from "../api/types"
import FileDropzone from "../components/FileDropzone"
import PageBackActions from "../components/PageBackActions"
import TopicList from "../components/TopicList"
import UploadedFilesList from "../components/UploadedFilesList"
import type { Language } from "../i18n"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function CourseSetupPage() {
  const { courseId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [language, setLanguage] = useState<Language>(languageFromUser(user?.language))
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileListItem[]>([])
  const text = uiText[language]
  const hasReadyFile = uploadedFiles.some(
    (file) => file.extraction_status === "done",
  )

  useEffect(() => {
    setLanguage(languageFromUser(user?.language))
  }, [user?.language])

  if (!courseId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-red-700">Missing course id.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <PageBackActions />
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
          type="button"
          onClick={() => setLanguage(language === "en" ? "vi" : "en")}
        >
          {text.language}
        </button>
      </div>

      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.courseSetup}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          {text.title}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {text.subtitle}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <FileDropzone courseId={courseId} />
        <UploadedFilesList courseId={courseId} onFilesChange={setUploadedFiles} />
      </div>

      <div className="mt-6">
        {hasReadyFile ? (
          <TopicList courseId={courseId} language={language} />
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            {text.noReadyFiles}
          </section>
        )}
      </div>
    </main>
  )
}

export default CourseSetupPage

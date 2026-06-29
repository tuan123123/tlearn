import { Link, useParams } from "react-router-dom"

import FileDropzone from "../components/FileDropzone"
import UploadedFilesList from "../components/UploadedFilesList"

function CourseSetupPage() {
  const { courseId } = useParams()

  if (!courseId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-red-700">Missing course id.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link className="font-semibold text-emerald-700" to="/">
        Back to dashboard
      </Link>

      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Course setup
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Upload study materials
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Phase 2 extracts text from PDFs and PowerPoints. Topic review will come in
          Phase 3.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <FileDropzone courseId={courseId} />
        <UploadedFilesList courseId={courseId} />
      </div>
    </main>
  )
}

export default CourseSetupPage

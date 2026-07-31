import { useEffect, useState } from "react"

import { getUpload } from "../api/uploads"
import type { UploadedFileListItem } from "../api/types"
import { useCourseUploads } from "../hooks/useUploads"
import ExtractionStatusBadge from "./ExtractionStatusBadge"

interface UploadedFilesListProps {
  courseId: string
  onFilesChange?: (files: UploadedFileListItem[]) => void
}

function UploadedFilesList({ courseId, onFilesChange }: UploadedFilesListProps) {
  const uploads = useCourseUploads(courseId)
  const [files, setFiles] = useState<UploadedFileListItem[]>([])

  useEffect(() => {
    if (uploads.data) {
      setFiles(uploads.data)
    }
  }, [uploads.data])

  useEffect(() => {
    onFilesChange?.(files)
  }, [files, onFilesChange])

  useEffect(() => {
    const activeFiles = files.filter((file) =>
      ["pending", "processing"].includes(file.extraction_status),
    )

    if (activeFiles.length === 0) {
      return
    }

    const intervalId = window.setInterval(async () => {
      const refreshedFiles = await Promise.all(
        activeFiles.map((file) => getUpload(file.id)),
      )

      setFiles((currentFiles) =>
        currentFiles.map((currentFile) => {
          const refreshedFile = refreshedFiles.find((file) => file.id === currentFile.id)
          return refreshedFile ?? currentFile
        }),
      )
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [files])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950">Uploaded files</h2>

      {uploads.isLoading ? (
        <p className="mt-4 text-sm text-slate-600">Loading uploaded files...</p>
      ) : null}

      {uploads.isError ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load uploaded files.
        </p>
      ) : null}

      {files.length === 0 && !uploads.isLoading ? (
        <p className="mt-4 text-sm text-slate-600">No materials uploaded yet.</p>
      ) : null}

      <div className="mt-5 space-y-3">
        {files.map((file) => (
          <article
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            key={file.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-950">{file.original_filename}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatFileSize(file.file_size_bytes)} · Uploaded{" "}
                  {new Date(file.uploaded_at).toLocaleString()}
                </p>
              </div>
              <ExtractionStatusBadge status={file.extraction_status} />
            </div>

            {file.extraction_error ? (
              <p className="mt-3 text-sm text-red-700">{file.extraction_error}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default UploadedFilesList

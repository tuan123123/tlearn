import { DragEvent, useRef, useState } from "react"

import { useUploadCourseFile } from "../hooks/useUploads"

interface FileDropzoneProps {
  courseId: string
}

const allowedExtensions = [".pdf", ".pptx"]
const maxFileSizeBytes = 20 * 1024 * 1024

function FileDropzone({ courseId }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const upload = useUploadCourseFile()

  function chooseFile(file: File | undefined) {
    if (!file) {
      return
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null)
      setError("Only PDF and PPTX uploads are supported in Phase 2.")
      return
    }

    if (file.size > maxFileSizeBytes) {
      setSelectedFile(null)
      setError("File is too large. Maximum upload size is 20MB.")
      return
    }

    setError(null)
    setUploadProgress(0)
    setSelectedFile(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    chooseFile(event.dataTransfer.files[0])
  }

  function handleUpload() {
    if (!selectedFile) {
      setError("Choose a PDF or PPTX file first.")
      return
    }

    upload.mutate(
      {
        courseId,
        file: selectedFile,
        onUploadProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          setSelectedFile(null)
          setUploadProgress(0)
        },
        onError: () => {
          setError("Upload failed. Check the file type, size, and backend server.")
        },
      },
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950">Upload materials</h2>
      <p className="mt-2 text-sm text-slate-600">
        Add a PDF or PPTX file. The backend will extract text in the background.
      </p>

      <div
        className="mt-5 cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="font-semibold text-slate-800">Drag and drop a file here</p>
        <p className="mt-1 text-sm text-slate-500">or click to browse</p>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".pdf,.pptx"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
      </div>

      {selectedFile ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">{selectedFile.name}</p>
          <p>{formatFileSize(selectedFile.size)}</p>
        </div>
      ) : null}

      {upload.isPending ? (
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">{uploadProgress}% uploaded</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!selectedFile || upload.isPending}
        type="button"
        onClick={handleUpload}
      >
        {upload.isPending ? "Uploading..." : "Upload file"}
      </button>
    </section>
  )
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default FileDropzone

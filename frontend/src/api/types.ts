export interface User {
  id: string
  email: string
  display_name: string
  language: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: "bearer"
  user: User
}

export interface Course {
  id: string
  user_id: string
  name: string
  university: string
  language: string
  exam_date: string
  days_until_exam: number
  uploaded_file_count: number
  created_at: string
}

export interface CreateCourseRequest {
  name: string
  university: string
  language: string
  exam_date: string
}

export type ExtractionStatus = "pending" | "processing" | "done" | "failed"

export interface PageRef {
  page: number
  text: string
}

export interface UploadCreateResponse {
  file_id: string
  original_filename: string
  extraction_status: ExtractionStatus
}

export interface UploadedFileListItem {
  id: string
  course_id: string
  original_filename: string
  file_type: "pdf" | "pptx"
  file_size_bytes: number
  extraction_status: ExtractionStatus
  extraction_error: string | null
  uploaded_at: string
  extracted_at: string | null
}

export interface UploadedFile extends UploadedFileListItem {
  user_id: string
  storage_path: string
  extracted_text: string | null
  page_refs: PageRef[]
}

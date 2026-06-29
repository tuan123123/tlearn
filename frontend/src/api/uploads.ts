import { apiClient } from "./client"
import type {
  UploadCreateResponse,
  UploadedFile,
  UploadedFileListItem,
} from "./types"

export async function uploadCourseFile(
  courseId: string,
  file: File,
  onUploadProgress: (progress: number) => void,
): Promise<UploadCreateResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiClient.post<UploadCreateResponse>(
    `/courses/${courseId}/uploads`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) {
          onUploadProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    },
  )

  return response.data
}

export async function listCourseUploads(
  courseId: string,
): Promise<UploadedFileListItem[]> {
  const response = await apiClient.get<UploadedFileListItem[]>(
    `/courses/${courseId}/uploads`,
  )
  return response.data
}

export async function getUpload(uploadId: string): Promise<UploadedFile> {
  const response = await apiClient.get<UploadedFile>(`/uploads/${uploadId}`)
  return response.data
}

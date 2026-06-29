import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { listCourseUploads, uploadCourseFile } from "../api/uploads"

interface UploadCourseFileVariables {
  courseId: string
  file: File
  onUploadProgress: (progress: number) => void
}

export function useCourseUploads(courseId: string) {
  return useQuery({
    queryKey: ["course-uploads", courseId],
    queryFn: () => listCourseUploads(courseId),
    enabled: Boolean(courseId),
  })
}

export function useUploadCourseFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, file, onUploadProgress }: UploadCourseFileVariables) =>
      uploadCourseFile(courseId, file, onUploadProgress),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course-uploads", variables.courseId],
      })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createCourse, getCourse, listCourses } from "../api/courses"

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  })
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
    enabled: Boolean(courseId),
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })
}

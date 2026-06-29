import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createCourse, listCourses } from "../api/courses"

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
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

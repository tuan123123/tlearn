import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  generateStudyGuide,
  getLatestStudyGuide,
  getStudyGuide,
  listStudyGuides,
} from "../api/studyGuides"

export function useGenerateStudyGuide(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quizId: string) => generateStudyGuide(courseId, quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-guides", courseId] })
      queryClient.invalidateQueries({ queryKey: ["study-guide-latest", courseId] })
    },
  })
}

export function useLatestStudyGuide(courseId: string) {
  return useQuery({
    queryKey: ["study-guide-latest", courseId],
    queryFn: () => getLatestStudyGuide(courseId),
    enabled: Boolean(courseId),
    retry: false,
  })
}

export function useStudyGuideVersions(courseId: string) {
  return useQuery({
    queryKey: ["study-guides", courseId],
    queryFn: () => listStudyGuides(courseId),
    enabled: Boolean(courseId),
  })
}

export function useStudyGuide(guideId: string) {
  return useQuery({
    queryKey: ["study-guide", guideId],
    queryFn: () => getStudyGuide(guideId),
    enabled: Boolean(guideId),
  })
}

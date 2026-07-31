import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  generateMockExam,
  getMockExam,
  getMockExamResults,
  listMockExams,
  submitMockExam,
} from "../api/mockExams"

export function useMockExams(courseId: string) {
  return useQuery({
    queryKey: ["mock-exams", courseId],
    queryFn: () => listMockExams(courseId),
    enabled: Boolean(courseId),
  })
}

export function useGenerateMockExam(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => generateMockExam(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-exams", courseId] })
    },
  })
}

export function useMockExam(mockExamId: string) {
  return useQuery({
    queryKey: ["mock-exam", mockExamId],
    queryFn: () => getMockExam(mockExamId),
    enabled: Boolean(mockExamId),
  })
}

export function useSubmitMockExam(mockExamId: string) {
  return useMutation({
    mutationFn: (
      answers: Array<{
        question_id: string
        student_answer: string
        time_spent_seconds: number
      }>,
    ) => submitMockExam(mockExamId, answers),
  })
}

export function useMockExamResults(mockExamId: string) {
  return useQuery({
    queryKey: ["mock-exam-results", mockExamId],
    queryFn: () => getMockExamResults(mockExamId),
    enabled: Boolean(mockExamId),
  })
}

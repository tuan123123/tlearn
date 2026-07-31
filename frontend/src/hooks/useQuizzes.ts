import { useMutation, useQuery } from "@tanstack/react-query"

import {
  createDiagnosticQuiz,
  generateQuestions,
  getQuiz,
  getQuizResults,
  listCourseQuizzes,
  submitQuiz,
} from "../api/quizzes"

export function useGenerateQuestions(courseId: string) {
  return useMutation({
    mutationFn: (topicIds: string[]) => generateQuestions(courseId, topicIds),
  })
}

export function useCreateDiagnosticQuiz(courseId: string) {
  return useMutation({
    mutationFn: () => createDiagnosticQuiz(courseId),
  })
}

export function useCourseQuizzes(courseId: string) {
  return useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: () => listCourseQuizzes(courseId),
    enabled: Boolean(courseId),
  })
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuiz(quizId),
    enabled: Boolean(quizId),
  })
}

export function useSubmitQuiz(quizId: string) {
  return useMutation({
    mutationFn: (
      answers: Array<{
        question_id: string
        student_answer: string
        time_spent_seconds: number
      }>,
    ) => submitQuiz(quizId, answers),
  })
}

export function useQuizResults(quizId: string) {
  return useQuery({
    queryKey: ["quiz-results", quizId],
    queryFn: () => getQuizResults(quizId),
    enabled: Boolean(quizId),
  })
}

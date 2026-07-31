import { useQuery } from "@tanstack/react-query"

import { getBloomTrend, getReadiness, getScoreHistory, getTopicProgress } from "../api/progress"

export function useScoreHistory(courseId: string) {
  return useQuery({
    queryKey: ["score-history", courseId],
    queryFn: () => getScoreHistory(courseId),
    enabled: Boolean(courseId),
  })
}

export function useReadiness(courseId: string) {
  return useQuery({
    queryKey: ["readiness", courseId],
    queryFn: () => getReadiness(courseId),
    enabled: Boolean(courseId),
  })
}

export function useTopicProgress(courseId: string) {
  return useQuery({
    queryKey: ["topic-progress", courseId],
    queryFn: () => getTopicProgress(courseId),
    enabled: Boolean(courseId),
  })
}

export function useBloomTrend(courseId: string) {
  return useQuery({
    queryKey: ["bloom-trend", courseId],
    queryFn: () => getBloomTrend(courseId),
    enabled: Boolean(courseId),
  })
}

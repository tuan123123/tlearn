import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createTopic,
  deleteTopic,
  extractTopics,
  listTopics,
  updateTopic,
} from "../api/topics"
import type { TopicCreateRequest, TopicUpdateRequest } from "../api/types"

export function useTopics(courseId: string) {
  return useQuery({
    queryKey: ["topics", courseId],
    queryFn: () => listTopics(courseId),
    enabled: Boolean(courseId),
  })
}

export function useExtractTopics(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => extractTopics(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", courseId] })
    },
  })
}

export function useCreateTopic(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TopicCreateRequest) => createTopic(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", courseId] })
    },
  })
}

export function useUpdateTopic(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      topicId,
      payload,
    }: {
      topicId: string
      payload: TopicUpdateRequest
    }) => updateTopic(topicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", courseId] })
    },
  })
}

export function useDeleteTopic(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", courseId] })
    },
  })
}

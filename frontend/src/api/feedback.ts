import { apiClient } from "./client"
import type { FeedbackCreateRequest, FeedbackCreateResponse } from "./types"

export async function submitFeedback(
  payload: FeedbackCreateRequest,
): Promise<FeedbackCreateResponse> {
  const response = await apiClient.post<FeedbackCreateResponse>("/feedback", payload)
  return response.data
}

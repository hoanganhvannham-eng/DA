import apiClient from '../../../shared/services/apiClient'

const BASE_URL = '/v1/recommendations'

export const getRecommendations = async (moodId) => {
  const response = await apiClient.get(BASE_URL, { params: { moodId } })
  return response.data
}

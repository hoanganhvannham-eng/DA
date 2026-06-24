import apiClient from '../../../shared/services/apiClient'

const BASE_URL = '/v1/reading-paths'

export const generatePath = async (moodId) => {
  const response = await apiClient.post(`${BASE_URL}/generate`, { moodId })
  return response.data
}

export const savePath = async (data) => {
  const response = await apiClient.post(BASE_URL, data)
  return response.data
}

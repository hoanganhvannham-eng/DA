import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

const BASE_URL = '/v1/fine-levels'

export const getFineLevels = async (type) => {
  const params = type ? { type } : {}
  const response = await apiClient.get(BASE_URL, { params })
  return response.data
}

export const createFineLevel = async (data) => {
  const response = await apiClient.post(BASE_URL, data)
  return response.data
}

export const updateFineLevel = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, data)
  return response.data
}

export const deleteFineLevel = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`)
  return response.data
}

export const getMyFines = async () => {
  const response = await apiClient.get(API_ENDPOINTS.FINE.MY_FINES)
  return response.data
}

export const payFine = async (fineId, proofImage, idempotencyKey) => {
  const formData = new FormData()
  formData.append('proof_image', proofImage)
  if (idempotencyKey) {
    formData.append('idempotency_key', idempotencyKey)
  }
  const response = await apiClient.post(
    API_ENDPOINTS.FINE.PAY.replace(':id', fineId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

export const getPendingConfirmFines = async (page = 0, size = 20) => {
  const response = await apiClient.get(API_ENDPOINTS.FINE.PENDING_CONFIRM, {
    params: { page, size }
  })
  return response.data
}

export const getFineDetail = async (fineId) => {
  const response = await apiClient.get(API_ENDPOINTS.FINE.DETAIL.replace(':fineId', fineId))
  return response.data
}

export const confirmPayment = async (fineId) => {
  const response = await apiClient.patch(API_ENDPOINTS.FINE.CONFIRM.replace(':fineId', fineId))
  return response.data
}

export const rejectPayment = async (fineId, rejectionReason) => {
  const response = await apiClient.patch(API_ENDPOINTS.FINE.REJECT.replace(':fineId', fineId), { rejectionReason })
  return response.data
}

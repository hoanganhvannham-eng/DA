import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

export const getAwaitingShipmentBorrows = async () => {
  const response = await apiClient.get(API_ENDPOINTS.SHIPPING.AWAITING_SHIPMENT)
  return response.data
}

export const createShipment = async (borrowId) => {
  const url = API_ENDPOINTS.SHIPPING.CREATE_SHIPMENT.replace(':borrowId', borrowId)
  const response = await apiClient.post(url)
  return response.data
}

export const getDeliveryIssues = async () => {
  const response = await apiClient.get(API_ENDPOINTS.DELIVERY.ISSUES)
  return response.data
}

export const handleIssue = async (borrowId, action, notes = null, replacementBookId = null) => {
  const url = API_ENDPOINTS.DELIVERY.HANDLE_ISSUE.replace(':borrowId', borrowId)
  const body = { action }
  if (notes) body.notes = notes
  if (replacementBookId) body.replacementBookId = replacementBookId
  const response = await apiClient.post(url, body)
  return response.data
}

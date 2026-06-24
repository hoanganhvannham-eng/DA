import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

export const createBorrowRequest = async (data) => {
  const response = await apiClient.post(API_ENDPOINTS.BORROW.LIST, data)
  return response.data
}

export const getPendingApprovalBorrows = async () => {
  const response = await apiClient.get(API_ENDPOINTS.BORROW.PENDING_APPROVAL)
  return response.data
}

export const getReservedBorrows = async () => {
  const response = await apiClient.get(API_ENDPOINTS.BORROW.RESERVED)
  return response.data
}

export const approveBorrow = async (borrowId) => {
  const url = API_ENDPOINTS.BORROW.APPROVE.replace(':id', borrowId)
  const response = await apiClient.patch(url)
  return response.data
}

export const rejectBorrow = async (borrowId, rejectionReason) => {
  const url = API_ENDPOINTS.BORROW.REJECT.replace(':id', borrowId)
  const response = await apiClient.patch(url, { rejectionReason })
  return response.data
}

export const cancelBorrow = async (borrowId) => {
  const url = API_ENDPOINTS.BORROW.CANCEL.replace(':id', borrowId)
  const response = await apiClient.post(url)
  return response.data
}

export const confirmPickup = async (borrowId) => {
  const url = API_ENDPOINTS.BORROW.CONFIRM_PICKUP.replace(':id', borrowId)
  const response = await apiClient.patch(url)
  return response.data
}

export const getMyHistory = async ({ status, page = 0, size = 20 } = {}) => {
  const params = { page, size }
  if (status) params.status = status
  const response = await apiClient.get(API_ENDPOINTS.BORROW.MY_HISTORY, { params })
  return response.data
}

export const confirmDelivery = async (borrowId) => {
  const url = API_ENDPOINTS.DELIVERY.CONFIRM.replace(':borrowId', borrowId)
  const response = await apiClient.patch(url)
  return response.data
}

export const reportDeliveryIssue = async (borrowId, issueType, issueDescription) => {
  const url = API_ENDPOINTS.DELIVERY.REPORT_ISSUE.replace(':borrowId', borrowId)
  const response = await apiClient.patch(url, { issueType, issueDescription })
  return response.data
}

export const getRentalRates = async () => {
  const response = await apiClient.get(API_ENDPOINTS.BORROW.RENTAL_RATES)
  return response.data
}

export const getDepositPolicies = async () => {
  const response = await apiClient.get(API_ENDPOINTS.BORROW.DEPOSIT_POLICIES)
  return response.data
}

export const getApprovedWaitingPayment = async () => {
  const response = await apiClient.get(API_ENDPOINTS.BORROW.APPROVED_WAITING_PAYMENT)
  return response.data
}

export const getAwaitingPickup = async () => {
  const response = await apiClient.get(API_ENDPOINTS.BORROW.AWAITING_PICKUP)
  return response.data
}

export const pickupByCode = async (pickupCode) => {
  const url = API_ENDPOINTS.BORROW.PICKUP_BY_CODE.replace(':pickupCode', pickupCode)
  const response = await apiClient.patch(url)
  return response.data
}

export const lookupByPickupCode = async (pickupCode) => {
  const url = API_ENDPOINTS.BORROW.LOOKUP_BY_CODE.replace(':pickupCode', pickupCode)
  const response = await apiClient.get(url)
  return response.data
}

export const confirmShipment = async (borrowId) => {
  const url = API_ENDPOINTS.BORROW.CONFIRM_SHIPMENT.replace(':borrowId', borrowId)
  const response = await apiClient.patch(url)
  return response.data
}

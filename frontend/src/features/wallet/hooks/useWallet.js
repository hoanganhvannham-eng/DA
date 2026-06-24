import { useState, useEffect, useCallback } from 'react'
import { getWallet, getTransactions } from '../services/walletService'

export function useWallet() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWallet()
      setWallet(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin ví')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  return { wallet, loading, error, refresh: fetchWallet }
}

export function useWalletTransactions() {
  const [transactions, setTransactions] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const size = 10

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTransactions({ page, size })
      setTransactions(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử giao dịch')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    totalPages,
    totalElements,
    page,
    setPage,
    loading,
    error,
    refresh: fetchTransactions,
  }
}

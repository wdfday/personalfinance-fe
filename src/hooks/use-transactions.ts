"use client"

import { useState, useEffect } from "react"
import { apiClient, Transaction, CreateTransactionRequest } from "@/lib/api"

interface UseTransactionsParams {
  account_id?: string
  type?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export function useTransactions(params?: UseTransactionsParams) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getTransactions(params)
      setTransactions(response.transactions)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const createTransaction = async (transactionData: CreateTransactionRequest) => {
    try {
      const newTransaction = await apiClient.createTransaction(transactionData)
      setTransactions(prev => [newTransaction, ...prev])
      setTotal(prev => prev + 1)
      return newTransaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction')
      throw err
    }
  }

  const updateTransaction = async (id: string, transactionData: Partial<CreateTransactionRequest>) => {
    try {
      const updatedTransaction = await apiClient.updateTransaction(id, transactionData)
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? updatedTransaction : transaction
      ))
      return updatedTransaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await apiClient.deleteTransaction(id)
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
      throw err
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [params?.account_id, params?.type, params?.start_date, params?.end_date])

  return {
    transactions,
    total,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

export function useTransaction(id: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransaction = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const transactionData = await apiClient.getTransaction(id)
      setTransaction(transactionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTransaction()
    }
  }, [id])

  return {
    transaction,
    isLoading,
    error,
    refetch: fetchTransaction,
  }
}


"use client"

import { useState, useEffect } from "react"
import { transactionsService } from "@/services/api/services/transactions.service"
import { Transaction, CreateTransactionRequest } from "@/services/api/types/transactions"

interface UseTransactionsParams {
  account_id?: string
  limit?: number
  offset?: number
  type?: string
  category_id?: string
  start_date?: string
  end_date?: string
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
      const response = await transactionsService.getAll({
        account_id: params?.account_id,
        category_id: params?.category_id === 'all' ? undefined : params?.category_id,
        type: params?.type as any,
        start_date: params?.start_date,
        end_date: params?.end_date,
        limit: params?.limit,
        offset: params?.offset,
      })
      setTransactions(response.transactions)
      setTotal(response.pagination.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const createTransaction = async (transactionData: CreateTransactionRequest) => {
    try {
      const newTransaction = await transactionsService.create(transactionData)
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
      const updatedTransaction = await transactionsService.update(id, transactionData)
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
      await transactionsService.delete(id)
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
      throw err
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [params?.account_id, params?.type, params?.category_id, params?.start_date, params?.end_date, params?.limit, params?.offset])

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
      const transactionData = await transactionsService.getById(id)
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


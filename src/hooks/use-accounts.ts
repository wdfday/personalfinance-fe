"use client"

import { useState, useEffect } from "react"
import { apiClient, Account, CreateAccountRequest, UpdateAccountRequest } from "@/lib/api"

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getAccounts()
      setAccounts(response.accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const createAccount = async (accountData: CreateAccountRequest) => {
    try {
      const newAccount = await apiClient.createAccount(accountData)
      setAccounts(prev => [...prev, newAccount])
      return newAccount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      throw err
    }
  }

  const updateAccount = async (id: number, accountData: UpdateAccountRequest) => {
    try {
      const updatedAccount = await apiClient.updateAccount(id, accountData)
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ))
      return updatedAccount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
      throw err
    }
  }

  const deleteAccount = async (id: number) => {
    try {
      await apiClient.deleteAccount(id)
      setAccounts(prev => prev.filter(account => account.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      throw err
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  }
}

export function useAccount(id: number) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccount = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const accountData = await apiClient.getAccount(id)
      setAccount(accountData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAccount()
    }
  }, [id])

  return {
    account,
    isLoading,
    error,
    refetch: fetchAccount,
  }
}


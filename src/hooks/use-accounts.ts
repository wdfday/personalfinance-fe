"use client"

import { useState, useEffect } from "react"
import { accountsService } from "@/services/api/services/accounts.service"
import { Account, CreateAccountRequest, UpdateAccountRequest } from "@/services/api/types/accounts"

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<Account | null>(null)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await accountsService.getAll()
      setAccounts(response.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const createAccount = async (accountData: CreateAccountRequest) => {
    try {
      const newAccount = await accountsService.create(accountData)
      setAccounts(prev => [...prev, newAccount])
      return newAccount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      throw err
    }
  }

  const updateAccount = async (id: string, accountData: UpdateAccountRequest) => {
    try {
      const updatedAccount = await accountsService.update(id, accountData)
      setAccounts(prev => prev.map(account => 
        account.id === id ? updatedAccount : account
      ))
      return updatedAccount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
      throw err
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      await accountsService.delete(id)
      setAccounts(prev => prev.filter(account => account.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      throw err
    }
  }

  const getAccount = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const accountData = await accountsService.getById(id)
      setAccount(accountData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return {
    accounts,
    account,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccount,
    refreshAccounts: fetchAccounts
  }
}

export function useAccount(id: string) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccount = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await accountsService.getById(id)
      setAccount(data)
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


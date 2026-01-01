'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import type { BrokerConnection } from '@/services/api/brokers.service'

interface DeleteBrokerModalProps {
    isOpen: boolean
    onClose: () => void
    broker: BrokerConnection | null
    onConfirm: (id: string) => Promise<void>
}

export function DeleteBrokerModal({ isOpen, onClose, broker, onConfirm }: DeleteBrokerModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen || !broker) return null

    const handleConfirm = async () => {
        try {
            setIsDeleting(true)
            await onConfirm(broker.id)
            onClose()
        } catch (error) {
            console.error('Failed to delete broker:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Delete Broker Connection
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            This action cannot be undone
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300">
                        Are you sure you want to delete the broker connection{' '}
                        <span className="font-semibold">{broker.broker_name}</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Note: This will remove the broker connection but will not delete any synced accounts or transactions.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DeleteBrokerModal

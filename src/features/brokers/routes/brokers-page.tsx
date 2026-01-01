'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
    fetchBrokers,
    syncBrokerNow,
    deleteBroker,
    activateBroker,
    deactivateBroker,
    selectBrokers,
    selectBrokersLoading,
    selectBrokersSyncing,
    selectBrokersError,
} from '@/features/brokers/brokersSlice'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Link2, RefreshCw } from 'lucide-react'
import { BrokerCard } from '@/features/brokers/components/broker-card'
import { CreateBrokerModal } from '@/features/brokers/components/create-broker-modal'
import { DeleteBrokerModal } from '@/features/brokers/components/delete-broker-modal'
import type { BrokerConnection } from '@/services/api/brokers.service'
import { toast } from 'sonner'

export default function BrokersPage() {
    const dispatch = useAppDispatch()
    const brokers = useAppSelector(selectBrokers)
    const isLoading = useAppSelector(selectBrokersLoading)
    const isSyncing = useAppSelector(selectBrokersSyncing)
    const error = useAppSelector(selectBrokersError)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedBroker, setSelectedBroker] = useState<BrokerConnection | null>(null)
    const [syncingBrokerId, setSyncingBrokerId] = useState<string | null>(null)

    useEffect(() => {
        dispatch(fetchBrokers())
    }, [dispatch])

    const handleSync = useCallback(async (id: string) => {
        try {
            setSyncingBrokerId(id)
            await dispatch(syncBrokerNow(id)).unwrap()
            toast.success('Sync completed successfully!')
        } catch (error: any) {
            toast.error('Sync failed', { description: error })
        } finally {
            setSyncingBrokerId(null)
        }
    }, [dispatch])

    const handleDelete = useCallback((broker: BrokerConnection) => {
        setSelectedBroker(broker)
        setIsDeleteModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(async (id: string) => {
        await dispatch(deleteBroker(id)).unwrap()
        toast.success('Broker deleted successfully')
    }, [dispatch])

    const handleActivate = useCallback(async (id: string) => {
        try {
            await dispatch(activateBroker(id)).unwrap()
            toast.success('Broker activated')
        } catch (error: any) {
            toast.error('Failed to activate', { description: error })
        }
    }, [dispatch])

    const handleDeactivate = useCallback(async (id: string) => {
        try {
            await dispatch(deactivateBroker(id)).unwrap()
            toast.success('Broker deactivated')
        } catch (error: any) {
            toast.error('Failed to deactivate', { description: error })
        }
    }, [dispatch])

    const handleCreateSuccess = useCallback(() => {
        dispatch(fetchBrokers())
    }, [dispatch])

    // Group brokers by type
    const brokersByType = brokers.reduce((acc, broker) => {
        const type = broker.broker_type
        if (!acc[type]) acc[type] = []
        acc[type].push(broker)
        return acc
    }, {} as Record<string, BrokerConnection[]>)

    if (isLoading && brokers.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading brokers...</p>
                </div>
            </div>
        )
    }

    if (error && brokers.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <Button onClick={() => dispatch(fetchBrokers())}>Retry</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Broker Connections</h1>
                    <p className="text-muted-foreground">
                        Manage your exchange and securities broker connections
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Broker
                </Button>
            </div>

            {/* Summary */}
            {brokers.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{brokers.length}</div>
                            <p className="text-xs text-muted-foreground">Total Connections</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">
                                {brokers.filter(b => b.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">
                                {brokers.filter(b => b.status === 'error').length}
                            </div>
                            <p className="text-xs text-muted-foreground">With Errors</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {brokers.reduce((sum, b) => sum + b.total_syncs, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Syncs</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Broker Cards grouped by type */}
            {Object.entries(brokersByType).map(([type, typeBrokers]) => (
                <div key={type} className="space-y-4">
                    <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
                        {type === 'okx' && '🟣 OKX Exchange'}
                        {type === 'ssi' && '🔵 SSI Securities'}
                        {type === 'sepay' && '🟢 SePay'}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {typeBrokers.map((broker) => (
                            <BrokerCard
                                key={broker.id}
                                broker={broker}
                                onSync={handleSync}
                                onEdit={() => {/* TODO: implement edit modal */ }}
                                onDelete={handleDelete}
                                onActivate={handleActivate}
                                onDeactivate={handleDeactivate}
                                isSyncing={syncingBrokerId === broker.id}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {brokers.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">No Broker Connections</h3>
                            <p className="text-muted-foreground mb-4">
                                Connect your first broker to start syncing your portfolio automatically
                            </p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Connect Broker
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <CreateBrokerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <DeleteBrokerModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedBroker(null)
                }}
                broker={selectedBroker}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}

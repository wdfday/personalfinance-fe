'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BrokerConnection } from '@/services/api/brokers.service'
import {
    RefreshCw,
    MoreVertical,
    Trash2,
    Edit,
    Play,
    Pause,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from 'lucide-react'

interface BrokerCardProps {
    broker: BrokerConnection
    onSync?: (id: string) => void
    onEdit?: (broker: BrokerConnection) => void
    onDelete?: (broker: BrokerConnection) => void
    onActivate?: (id: string) => void
    onDeactivate?: (id: string) => void
    isSyncing?: boolean
}

export function BrokerCard({
    broker,
    onSync,
    onEdit,
    onDelete,
    onActivate,
    onDeactivate,
    isSyncing = false,
}: BrokerCardProps) {
    const getStatusBadge = () => {
        const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
            active: {
                variant: 'default',
                icon: <CheckCircle className="h-3 w-3 mr-1" />,
                label: 'Active'
            },
            pending: {
                variant: 'secondary',
                icon: <Clock className="h-3 w-3 mr-1" />,
                label: 'Pending'
            },
            error: {
                variant: 'destructive',
                icon: <XCircle className="h-3 w-3 mr-1" />,
                label: 'Error'
            },
            disconnected: {
                variant: 'outline',
                icon: <AlertCircle className="h-3 w-3 mr-1" />,
                label: 'Disconnected'
            },
        }

        const config = statusConfig[broker.status] || statusConfig.pending
        return (
            <Badge variant={config.variant} className="flex items-center">
                {config.icon}
                {config.label}
            </Badge>
        )
    }

    const getBrokerTypeLabel = () => {
        const labels: Record<string, string> = {
            okx: 'OKX Exchange',
            ssi: 'SSI Securities',
            sepay: 'SePay',
        }
        return labels[broker.broker_type] || broker.broker_type.toUpperCase()
    }

    const getBrokerTypeColor = () => {
        const colors: Record<string, string> = {
            okx: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            ssi: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            sepay: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        }
        return colors[broker.broker_type] || 'bg-gray-100 text-gray-800'
    }

    const formatLastSync = () => {
        if (!broker.last_sync_at) return 'Never synced'
        const date = new Date(broker.last_sync_at)
        return `Last sync: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    }

    const getSyncSuccessRate = () => {
        if (broker.total_syncs === 0) return null
        const rate = (broker.successful_syncs / broker.total_syncs) * 100
        return `${rate.toFixed(0)}% success (${broker.successful_syncs}/${broker.total_syncs})`
    }

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{broker.broker_name}</CardTitle>
                    <CardDescription className="text-xs mt-1 flex items-center gap-2">
                        <Badge className={getBrokerTypeColor()} variant="secondary">
                            {getBrokerTypeLabel()}
                        </Badge>
                        {getStatusBadge()}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* External Account Info */}
                {broker.external_account_name && (
                    <div className="text-sm text-muted-foreground">
                        Account: {broker.external_account_name}
                        {broker.external_account_number && ` (${broker.external_account_number})`}
                    </div>
                )}

                {/* Sync Info */}
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">{formatLastSync()}</div>
                    {getSyncSuccessRate() && (
                        <div className="text-xs text-muted-foreground">{getSyncSuccessRate()}</div>
                    )}
                    {broker.last_sync_error && broker.status === 'error' && (
                        <div className="text-xs text-red-500 mt-1">
                            Error: {broker.last_sync_error}
                        </div>
                    )}
                </div>

                {/* Sync Settings Summary */}
                <div className="flex flex-wrap gap-1">
                    {broker.auto_sync && (
                        <Badge variant="outline" className="text-xs">
                            Auto-sync: {broker.sync_frequency}min
                        </Badge>
                    )}
                    {broker.sync_assets && <Badge variant="outline" className="text-xs">Assets</Badge>}
                    {broker.sync_transactions && <Badge variant="outline" className="text-xs">Transactions</Badge>}
                    {broker.sync_balance && <Badge variant="outline" className="text-xs">Balance</Badge>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSync?.(broker.id)}
                        disabled={isSyncing || broker.status === 'disconnected'}
                        className="flex-1"
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit?.(broker)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>

                    {broker.status === 'active' ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeactivate?.(broker.id)}
                            title="Deactivate"
                        >
                            <Pause className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onActivate?.(broker.id)}
                            title="Activate"
                        >
                            <Play className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDelete?.(broker)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default BrokerCard

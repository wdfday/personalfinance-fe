'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useAppDispatch } from '@/lib/hooks'
import { createSSIBroker, createOKXBroker, createSepayBroker } from '@/features/brokers/brokersSlice'
import type { BrokerType } from '@/services/api/brokers.service'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Validation schemas - matching backend DTOs
const okxSchema = z.object({
    broker_name: z.string().min(1, 'Tên kết nối là bắt buộc'),
    api_key: z.string().min(1, 'API Key là bắt buộc'),
    api_secret: z.string().min(1, 'API Secret là bắt buộc'),
    passphrase: z.string().min(1, 'Passphrase là bắt buộc'),
    auto_sync: z.boolean().default(true),
    sync_frequency: z.number().min(5).max(1440).default(60),
    sync_assets: z.boolean().default(true),
    sync_transactions: z.boolean().default(true),
    sync_prices: z.boolean().default(true),
    sync_balance: z.boolean().default(true),
    notes: z.string().optional(),
})

const ssiSchema = z.object({
    broker_name: z.string().min(1, 'Tên kết nối là bắt buộc'),
    consumer_id: z.string().min(1, 'Consumer ID là bắt buộc'),
    consumer_secret: z.string().min(1, 'Consumer Secret là bắt buộc'),
    otp_code: z.string().optional(),
    otp_method: z.enum(['PIN', 'SMS', 'EMAIL', 'SMART']).default('PIN'),
    auto_sync: z.boolean().default(true),
    sync_frequency: z.number().min(5).max(1440).default(60),
    sync_assets: z.boolean().default(true),
    sync_transactions: z.boolean().default(true),
    sync_prices: z.boolean().default(true),
    sync_balance: z.boolean().default(true),
    notes: z.string().optional(),
})

const sepaySchema = z.object({
    broker_name: z.string().min(1, 'Tên kết nối là bắt buộc'),
    api_key: z.string().min(1, 'API Key là bắt buộc'),
    auto_sync: z.boolean().default(true),
    sync_frequency: z.number().min(5).max(1440).default(60),
    sync_assets: z.boolean().default(true),
    sync_transactions: z.boolean().default(true),
    sync_prices: z.boolean().default(true),
    sync_balance: z.boolean().default(true),
    notes: z.string().optional(),
})

type OKXFormData = z.infer<typeof okxSchema>
type SSIFormData = z.infer<typeof ssiSchema>
type SepayFormData = z.infer<typeof sepaySchema>

interface CreateBrokerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function CreateBrokerModal({ isOpen, onClose, onSuccess }: CreateBrokerModalProps) {
    const dispatch = useAppDispatch()
    const [brokerType, setBrokerType] = useState<BrokerType>('okx')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // OKX Form
    const okxForm = useForm<OKXFormData>({
        resolver: zodResolver(okxSchema),
        defaultValues: {
            broker_name: '',
            api_key: '',
            api_secret: '',
            passphrase: '',
            auto_sync: true,
            sync_frequency: 60,
            sync_assets: true,
            sync_transactions: true,
            sync_prices: true,
            sync_balance: true,
        },
    })

    // SSI Form
    const ssiForm = useForm<SSIFormData>({
        resolver: zodResolver(ssiSchema),
        defaultValues: {
            broker_name: '',
            consumer_id: '',
            consumer_secret: '',
            otp_method: 'PIN',
            auto_sync: true,
            sync_frequency: 60,
            sync_assets: true,
            sync_transactions: true,
            sync_prices: true,
            sync_balance: true,
        },
    })

    // SePay Form
    const sepayForm = useForm<SepayFormData>({
        resolver: zodResolver(sepaySchema),
        defaultValues: {
            broker_name: '',
            api_key: '',
            auto_sync: true,
            sync_frequency: 60,
            sync_assets: true,
            sync_transactions: true,
            sync_prices: true,
            sync_balance: true,
        },
    })

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)

            if (brokerType === 'okx') {
                const isValid = await okxForm.trigger()
                if (!isValid) return
                const data = okxForm.getValues()
                await dispatch(createOKXBroker(data)).unwrap()
            } else if (brokerType === 'ssi') {
                const isValid = await ssiForm.trigger()
                if (!isValid) return
                const data = ssiForm.getValues()
                await dispatch(createSSIBroker(data)).unwrap()
            } else if (brokerType === 'sepay') {
                const isValid = await sepayForm.trigger()
                if (!isValid) return
                const data = sepayForm.getValues()
                await dispatch(createSepayBroker(data)).unwrap()
            }

            toast.success('Kết nối thành công!', {
                description: 'Broker đã được kết nối và đang đồng bộ tài khoản.',
            })

            handleClose()
            onSuccess?.()
        } catch (error: any) {
            console.error('Failed to create broker:', error)
            toast.error('Kết nối thất bại', {
                description: error || 'Vui lòng kiểm tra lại thông tin đăng nhập',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        okxForm.reset()
        ssiForm.reset()
        sepayForm.reset()
        onClose()
    }

    const handleBrokerTypeChange = (newType: string) => {
        setBrokerType(newType as BrokerType)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Kết nối Broker</DialogTitle>
                    <DialogDescription>
                        Kết nối sàn giao dịch hoặc chứng khoán để tự động đồng bộ danh mục
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Broker Type Tabs */}
                    <Tabs value={brokerType} onValueChange={handleBrokerTypeChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="okx">🟣 OKX</TabsTrigger>
                            <TabsTrigger value="ssi">🔵 SSI</TabsTrigger>
                            <TabsTrigger value="sepay">🟢 SePay</TabsTrigger>
                        </TabsList>

                        {/* OKX Form */}
                        <TabsContent value="okx" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Tên kết nối *</Label>
                                <Input {...okxForm.register('broker_name')} placeholder="My OKX Account" />
                                {okxForm.formState.errors.broker_name && (
                                    <p className="text-sm text-destructive">{okxForm.formState.errors.broker_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>API Key *</Label>
                                <Input {...okxForm.register('api_key')} placeholder="Nhập API Key" />
                                {okxForm.formState.errors.api_key && (
                                    <p className="text-sm text-destructive">{okxForm.formState.errors.api_key.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>API Secret *</Label>
                                <Input {...okxForm.register('api_secret')} type="password" placeholder="Nhập API Secret" />
                                {okxForm.formState.errors.api_secret && (
                                    <p className="text-sm text-destructive">{okxForm.formState.errors.api_secret.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Passphrase *</Label>
                                <Input {...okxForm.register('passphrase')} type="password" placeholder="Nhập Passphrase" />
                                {okxForm.formState.errors.passphrase && (
                                    <p className="text-sm text-destructive">{okxForm.formState.errors.passphrase.message}</p>
                                )}
                            </div>

                            {/* Sync Settings */}
                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-medium">Cài đặt đồng bộ</h4>
                                <div className="flex items-center justify-between">
                                    <Label>Tự động đồng bộ</Label>
                                    <Switch
                                        checked={okxForm.watch('auto_sync')}
                                        onCheckedChange={(checked) => okxForm.setValue('auto_sync', checked)}
                                    />
                                </div>
                                {okxForm.watch('auto_sync') && (
                                    <div className="space-y-2">
                                        <Label>Tần suất (phút)</Label>
                                        <Input
                                            {...okxForm.register('sync_frequency', { valueAsNumber: true })}
                                            type="number"
                                            min={5}
                                            max={1440}
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* SSI Form */}
                        <TabsContent value="ssi" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Tên kết nối *</Label>
                                <Input {...ssiForm.register('broker_name')} placeholder="My SSI Account" />
                                {ssiForm.formState.errors.broker_name && (
                                    <p className="text-sm text-destructive">{ssiForm.formState.errors.broker_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Consumer ID *</Label>
                                <Input {...ssiForm.register('consumer_id')} placeholder="Nhập Consumer ID" />
                                {ssiForm.formState.errors.consumer_id && (
                                    <p className="text-sm text-destructive">{ssiForm.formState.errors.consumer_id.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Consumer Secret *</Label>
                                <Input {...ssiForm.register('consumer_secret')} type="password" placeholder="Nhập Consumer Secret" />
                                {ssiForm.formState.errors.consumer_secret && (
                                    <p className="text-sm text-destructive">{ssiForm.formState.errors.consumer_secret.message}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phương thức OTP</Label>
                                    <Select
                                        value={ssiForm.watch('otp_method')}
                                        onValueChange={(value) => ssiForm.setValue('otp_method', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PIN">PIN</SelectItem>
                                            <SelectItem value="SMS">SMS</SelectItem>
                                            <SelectItem value="EMAIL">Email</SelectItem>
                                            <SelectItem value="SMART">Smart OTP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mã OTP (nếu cần)</Label>
                                    <Input {...ssiForm.register('otp_code')} placeholder="123456" />
                                </div>
                            </div>

                            {/* Sync Settings */}
                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-medium">Cài đặt đồng bộ</h4>
                                <div className="flex items-center justify-between">
                                    <Label>Tự động đồng bộ</Label>
                                    <Switch
                                        checked={ssiForm.watch('auto_sync')}
                                        onCheckedChange={(checked) => ssiForm.setValue('auto_sync', checked)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* SePay Form - Only API Key */}
                        <TabsContent value="sepay" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Tên kết nối *</Label>
                                <Input {...sepayForm.register('broker_name')} placeholder="My SePay Account" />
                                {sepayForm.formState.errors.broker_name && (
                                    <p className="text-sm text-destructive">{sepayForm.formState.errors.broker_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>API Key *</Label>
                                <Input {...sepayForm.register('api_key')} placeholder="Nhập API Key từ SePay dashboard" />
                                {sepayForm.formState.errors.api_key && (
                                    <p className="text-sm text-destructive">{sepayForm.formState.errors.api_key.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Lấy API Key tại: sepay.vn → Cài đặt → API Key
                                </p>
                            </div>

                            {/* Sync Settings */}
                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-medium">Cài đặt đồng bộ</h4>
                                <div className="flex items-center justify-between">
                                    <Label>Tự động đồng bộ</Label>
                                    <Switch
                                        checked={sepayForm.watch('auto_sync')}
                                        onCheckedChange={(checked) => sepayForm.setValue('auto_sync', checked)}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang kết nối...' : 'Kết nối Broker'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CreateBrokerModal

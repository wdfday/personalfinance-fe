import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { accountsService, type CreateAccountWithBrokerRequest, type BrokerType } from '@/services/api/accounts.service'

// Validation schemas
const okxSchema = z.object({
    account_name: z.string().min(1, 'Account name is required'),
    broker_type: z.literal('okx'),
    broker_name: z.string().optional(),
    api_key: z.string().min(1, 'API Key is required for OKX'),
    api_secret: z.string().min(1, 'API Secret is required for OKX'),
    passphrase: z.string().min(1, 'Passphrase is required for OKX'),
    auto_sync: z.boolean().default(true),
    sync_frequency: z.number().min(5).max(1440).default(60),
    sync_assets: z.boolean().default(true),
    sync_transactions: z.boolean().default(true),
    sync_prices: z.boolean().default(true),
    sync_balance: z.boolean().default(true),
})

const ssiSchema = z.object({
    account_name: z.string().min(1, 'Account name is required'),
    broker_type: z.literal('ssi'),
    broker_name: z.string().optional(),
    consumer_id: z.string().min(1, 'Consumer ID is required for SSI'),
    consumer_secret: z.string().min(1, 'Consumer Secret is required for SSI'),
    otp_code: z.string().optional(),
    otp_method: z.enum(['PIN', 'SMS', 'EMAIL', 'SMART']).default('PIN'),
    auto_sync: z.boolean().default(true),
    sync_frequency: z.number().min(5).max(1440).default(60),
    sync_assets: z.boolean().default(true),
    sync_transactions: z.boolean().default(true),
    sync_prices: z.boolean().default(true),
    sync_balance: z.boolean().default(true),
})

type FormData = z.infer<typeof okxSchema> | z.infer<typeof ssiSchema>

interface CreateBrokerAccountModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function CreateBrokerAccountModal({ isOpen, onClose, onSuccess }: CreateBrokerAccountModalProps) {
    const [brokerType, setBrokerType] = useState<BrokerType>('okx')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const schema = brokerType === 'okx' ? okxSchema : ssiSchema

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            broker_type: brokerType,
            auto_sync: true,
            sync_frequency: 60,
            sync_assets: true,
            sync_transactions: true,
            sync_prices: true,
            sync_balance: true,
            otp_method: 'PIN',
        },
    })

    const autoSync = watch('auto_sync')

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true)

            const payload: CreateAccountWithBrokerRequest = {
                ...data,
                account_type: brokerType === 'okx' ? 'crypto_wallet' : 'investment',
            }

            await accountsService.createAccountWithBroker(payload)

            toast.success('Account created successfully!', {
                description: 'Your broker account has been connected and initial data fetched.',
            })

            reset()
            onSuccess?.()
            onClose()
        } catch (error: any) {
            console.error('Failed to create broker account:', error)
            toast.error('Failed to create account', {
                description: error.response?.data?.error || error.message || 'Please check your credentials and try again',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBrokerTypeChange = (newType: BrokerType) => {
        setBrokerType(newType)
        reset({
            broker_type: newType,
            auto_sync: true,
            sync_frequency: 60,
            sync_assets: true,
            sync_transactions: true,
            sync_prices: true,
            sync_balance: true,
            otp_method: 'PIN',
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Connect Broker Account
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Connect your OKX or SSI account to automatically sync your portfolio
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Broker Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Broker Type
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleBrokerTypeChange('okx')}
                                className={`p-4 border-2 rounded-lg transition-colors ${brokerType === 'okx'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <div className="font-semibold">OKX</div>
                                <div className="text-xs text-gray-500">Crypto Exchange</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBrokerTypeChange('ssi')}
                                className={`p-4 border-2 rounded-lg transition-colors ${brokerType === 'ssi'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <div className="font-semibold">SSI</div>
                                <div className="text-xs text-gray-500">Vietnam Securities</div>
                            </button>
                        </div>
                    </div>

                    {/* Account Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Account Name *
                        </label>
                        <input
                            {...register('account_name')}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder={`My ${brokerType === 'okx' ? 'OKX' : 'SSI'} Account`}
                        />
                        {errors.account_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.account_name.message}</p>
                        )}
                    </div>

                    {/* Broker Name (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Broker Name (Optional)
                        </label>
                        <input
                            {...register('broker_name')}
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder={brokerType === 'okx' ? 'OKX Main' : 'SSI Trading'}
                        />
                    </div>

                    {/* OKX Credentials */}
                    {brokerType === 'okx' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    API Key *
                                </label>
                                <input
                                    {...register('api_key')}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Your OKX API Key"
                                />
                                {errors.api_key && 'message' in errors.api_key && (
                                    <p className="mt-1 text-sm text-red-600">{errors.api_key.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    API Secret *
                                </label>
                                <input
                                    {...register('api_secret')}
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Your OKX API Secret"
                                />
                                {errors.api_secret && 'message' in errors.api_secret && (
                                    <p className="mt-1 text-sm text-red-600">{errors.api_secret.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Passphrase *
                                </label>
                                <input
                                    {...register('passphrase')}
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Your OKX Passphrase"
                                />
                                {errors.passphrase && 'message' in errors.passphrase && (
                                    <p className="mt-1 text-sm text-red-600">{errors.passphrase.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* SSI Credentials */}
                    {brokerType === 'ssi' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Consumer ID *
                                </label>
                                <input
                                    {...register('consumer_id')}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Your SSI Consumer ID"
                                />
                                {errors.consumer_id && 'message' in errors.consumer_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.consumer_id.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Consumer Secret *
                                </label>
                                <input
                                    {...register('consumer_secret')}
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Your SSI Consumer Secret"
                                />
                                {errors.consumer_secret && 'message' in errors.consumer_secret && (
                                    <p className="mt-1 text-sm text-red-600">{errors.consumer_secret.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        OTP Method
                                    </label>
                                    <select
                                        {...register('otp_method')}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="PIN">PIN</option>
                                        <option value="SMS">SMS</option>
                                        <option value="EMAIL">EMAIL</option>
                                        <option value="SMART">SMART</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        OTP Code (if required)
                                    </label>
                                    <input
                                        {...register('otp_code')}
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="123456"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Auto-Sync Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Auto-Sync Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    {...register('auto_sync')}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Enable automatic synchronization
                                </label>
                            </div>

                            {autoSync && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Sync Frequency (minutes)
                                        </label>
                                        <input
                                            {...register('sync_frequency', { valueAsNumber: true })}
                                            type="number"
                                            min="5"
                                            max="1440"
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <input
                                                {...register('sync_assets')}
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                Sync Assets
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                {...register('sync_transactions')}
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                Sync Transactions
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                {...register('sync_prices')}
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                Sync Prices
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                {...register('sync_balance')}
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                Sync Balance
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Connecting...' : 'Connect Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

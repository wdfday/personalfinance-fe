import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { brokersService } from '@/services/api'
import type {
    BrokerConnection,
    CreateSSIBrokerRequest,
    CreateOKXBrokerRequest,
    CreateSepayBrokerRequest,
    UpdateBrokerRequest,
    SyncResult,
} from '@/services/api'

// State interface
interface BrokersState {
    brokers: BrokerConnection[]
    selectedBroker: BrokerConnection | null
    isLoading: boolean
    isSyncing: boolean
    error: string | null
    syncResult: SyncResult | null
}

// Initial state
const initialState: BrokersState = {
    brokers: [],
    selectedBroker: null,
    isLoading: false,
    isSyncing: false,
    error: null,
    syncResult: null,
}

// Async thunks
export const fetchBrokers = createAsyncThunk(
    'brokers/fetchBrokers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await brokersService.getAll()
            return response.connections || []
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch brokers')
        }
    }
)

export const fetchBroker = createAsyncThunk(
    'brokers/fetchBroker',
    async (id: string, { rejectWithValue }) => {
        try {
            const broker = await brokersService.getById(id)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch broker')
        }
    }
)

// Type-specific create thunks
export const createSSIBroker = createAsyncThunk(
    'brokers/createSSI',
    async (data: CreateSSIBrokerRequest, { rejectWithValue }) => {
        try {
            const broker = await brokersService.createSSI(data)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to create SSI broker')
        }
    }
)

export const createOKXBroker = createAsyncThunk(
    'brokers/createOKX',
    async (data: CreateOKXBrokerRequest, { rejectWithValue }) => {
        try {
            const broker = await brokersService.createOKX(data)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to create OKX broker')
        }
    }
)

export const createSepayBroker = createAsyncThunk(
    'brokers/createSepay',
    async (data: CreateSepayBrokerRequest, { rejectWithValue }) => {
        try {
            const broker = await brokersService.createSepay(data)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to create SePay broker')
        }
    }
)

export const updateBroker = createAsyncThunk(
    'brokers/updateBroker',
    async ({ id, data }: { id: string; data: UpdateBrokerRequest }, { rejectWithValue }) => {
        try {
            const broker = await brokersService.update(id, data)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to update broker')
        }
    }
)

export const deleteBroker = createAsyncThunk(
    'brokers/deleteBroker',
    async (id: string, { rejectWithValue }) => {
        try {
            await brokersService.delete(id)
            return id
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to delete broker')
        }
    }
)

export const syncBrokerNow = createAsyncThunk(
    'brokers/syncNow',
    async (id: string, { rejectWithValue }) => {
        try {
            const result = await brokersService.sync(id)
            return { id, result }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to sync broker')
        }
    }
)

export const testBrokerConnection = createAsyncThunk(
    'brokers/testConnection',
    async (id: string, { rejectWithValue }) => {
        try {
            const result = await brokersService.testConnection(id)
            return { id, ...result }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Connection test failed')
        }
    }
)

export const activateBroker = createAsyncThunk(
    'brokers/activate',
    async (id: string, { rejectWithValue }) => {
        try {
            const broker = await brokersService.activate(id)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to activate broker')
        }
    }
)

export const deactivateBroker = createAsyncThunk(
    'brokers/deactivate',
    async (id: string, { rejectWithValue }) => {
        try {
            const broker = await brokersService.deactivate(id)
            return broker
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to deactivate broker')
        }
    }
)

// Slice
const brokersSlice = createSlice({
    name: 'brokers',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearSyncResult: (state) => {
            state.syncResult = null
        },
        setSelectedBroker: (state, action: PayloadAction<BrokerConnection | null>) => {
            state.selectedBroker = action.payload
        },
    },
    extraReducers: (builder) => {
        // Fetch brokers
        builder
            .addCase(fetchBrokers.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchBrokers.fulfilled, (state, action) => {
                state.isLoading = false
                state.brokers = action.payload || []
            })
            .addCase(fetchBrokers.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Fetch single broker
        builder
            .addCase(fetchBroker.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchBroker.fulfilled, (state, action) => {
                state.isLoading = false
                state.selectedBroker = action.payload
            })
            .addCase(fetchBroker.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Create SSI broker
        builder
            .addCase(createSSIBroker.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createSSIBroker.fulfilled, (state, action) => {
                state.isLoading = false
                state.brokers.push(action.payload)
            })
            .addCase(createSSIBroker.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Create OKX broker
        builder
            .addCase(createOKXBroker.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createOKXBroker.fulfilled, (state, action) => {
                state.isLoading = false
                state.brokers.push(action.payload)
            })
            .addCase(createOKXBroker.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Create SePay broker
        builder
            .addCase(createSepayBroker.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createSepayBroker.fulfilled, (state, action) => {
                state.isLoading = false
                state.brokers.push(action.payload)
            })
            .addCase(createSepayBroker.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Update broker
        builder
            .addCase(updateBroker.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(updateBroker.fulfilled, (state, action) => {
                state.isLoading = false
                const index = state.brokers.findIndex((b) => b.id === action.payload.id)
                if (index !== -1) {
                    state.brokers[index] = action.payload
                }
                if (state.selectedBroker?.id === action.payload.id) {
                    state.selectedBroker = action.payload
                }
            })
            .addCase(updateBroker.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Delete broker
        builder
            .addCase(deleteBroker.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteBroker.fulfilled, (state, action) => {
                state.isLoading = false
                state.brokers = state.brokers.filter((b) => b.id !== action.payload)
                if (state.selectedBroker?.id === action.payload) {
                    state.selectedBroker = null
                }
            })
            .addCase(deleteBroker.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

        // Sync now
        builder
            .addCase(syncBrokerNow.pending, (state) => {
                state.isSyncing = true
                state.error = null
                state.syncResult = null
            })
            .addCase(syncBrokerNow.fulfilled, (state, action) => {
                state.isSyncing = false
                state.syncResult = action.payload.result
                // Update the broker's last sync info
                const index = state.brokers.findIndex((b) => b.id === action.payload.id)
                if (index !== -1) {
                    state.brokers[index].last_sync_at = action.payload.result.synced_at
                    state.brokers[index].last_sync_status = action.payload.result.success ? 'success' : 'failed'
                }
            })
            .addCase(syncBrokerNow.rejected, (state, action) => {
                state.isSyncing = false
                state.error = action.payload as string
            })

        // Test connection - just update status feedback, no state change needed
        builder
            .addCase(testBrokerConnection.rejected, (state, action) => {
                state.error = action.payload as string
            })

        // Activate broker
        builder
            .addCase(activateBroker.fulfilled, (state, action) => {
                const index = state.brokers.findIndex((b) => b.id === action.payload.id)
                if (index !== -1) {
                    state.brokers[index] = action.payload
                }
            })

        // Deactivate broker
        builder
            .addCase(deactivateBroker.fulfilled, (state, action) => {
                const index = state.brokers.findIndex((b) => b.id === action.payload.id)
                if (index !== -1) {
                    state.brokers[index] = action.payload
                }
            })
    },
})

// Export actions
export const { clearError, clearSyncResult, setSelectedBroker } = brokersSlice.actions

// Export reducer
export default brokersSlice.reducer

// Selectors
export const selectBrokers = (state: { brokers: BrokersState }) => state.brokers.brokers
export const selectSelectedBroker = (state: { brokers: BrokersState }) => state.brokers.selectedBroker
export const selectBrokersLoading = (state: { brokers: BrokersState }) => state.brokers.isLoading
export const selectBrokersSyncing = (state: { brokers: BrokersState }) => state.brokers.isSyncing
export const selectBrokersError = (state: { brokers: BrokersState }) => state.brokers.error
export const selectSyncResult = (state: { brokers: BrokersState }) => state.brokers.syncResult

// Selector by broker type
export const selectBrokersByType = (brokerType: 'okx' | 'ssi' | 'sepay') =>
    (state: { brokers: BrokersState }) =>
        state.brokers.brokers.filter((b) => b.broker_type === brokerType)

// Selector for active brokers only
export const selectActiveBrokers = (state: { brokers: BrokersState }) =>
    state.brokers.brokers.filter((b) => b.status === 'active')

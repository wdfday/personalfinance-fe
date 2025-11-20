import { configureStore } from '@reduxjs/toolkit'
import authSlice from '@/features/auth/authSlice'
import userSlice from '@/features/user/userSlice'
import profileSlice from '@/features/profile/profileSlice'
import accountsSlice from '@/features/accounts/accountsSlice'
import transactionsSlice from '@/features/transactions/transactionsSlice'
import budgetsSlice from '@/features/budgets/budgetsSlice'
import goalsSlice from '@/features/goals/goalsSlice'
import investmentsSlice from '@/features/investments/investmentsSlice'
import categoriesSlice from '@/features/categories/categoriesSlice'
import dashboardSlice from '@/features/dashboard/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    profile: profileSlice.reducer,
    accounts: accountsSlice.reducer,
    transactions: transactionsSlice.reducer,
    budgets: budgetsSlice.reducer,
    goals: goalsSlice.reducer,
    investments: investmentsSlice.reducer,
    categories: categoriesSlice.reducer,
    dashboard: dashboardSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

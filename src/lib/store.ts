import { configureStore } from '@reduxjs/toolkit'
import authSlice from '@/features/auth/authSlice'
import userSlice from '@/features/user/userSlice'
import profileSlice from '@/features/profile/profileSlice'
import accountsSlice from '@/features/accounts/accountsSlice'
import transactionsSlice from '@/features/transactions/transactionsSlice'
import budgetsSlice from '@/features/budgets/budgetsSlice'
import budgetConstraintsSlice from '@/features/budget-constraints/budgetConstraintsSlice'
import goalsSlice from '@/features/goals/goalsSlice'
import debtsSlice from '@/features/debts/debtsSlice'
import investmentsSlice from '@/features/investments/investmentsSlice'
import categoriesSlice from '@/features/categories/categoriesSlice'
import dashboardSlice from '@/features/dashboard/dashboardSlice'
import brokersReducer from '@/features/brokers/brokersSlice'
import analyticsReducer from "@/features/analytics/analyticsSlice"
import budgetAllocationSlice from '@/features/analytics/budgetAllocationSlice'
import monthReducer from '@/features/calendar/month/monthSlice'
import incomeReducer from '@/features/income/incomeSlice'
import dssWorkflowReducer from '@/features/month-dss/dssWorkflowSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    profile: profileSlice.reducer,
    accounts: accountsSlice.reducer,
    transactions: transactionsSlice.reducer,
    budgets: budgetsSlice.reducer,
    budgetConstraints: budgetConstraintsSlice.reducer,
    goals: goalsSlice.reducer,
    debts: debtsSlice.reducer,
    investments: investmentsSlice.reducer,
    categories: categoriesSlice.reducer,
    dashboard: dashboardSlice.reducer,
    brokers: brokersReducer,
    analytics: analyticsReducer,
    budgetAllocation: budgetAllocationSlice.reducer,
    month: monthReducer,
    income: incomeReducer,
    dssWorkflow: dssWorkflowReducer,
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

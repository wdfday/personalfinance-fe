// API Index - Re-exports all services and types

// Client
export { apiClient } from './client'
export { getErrorMessage } from './utils'

// Services
export { authService } from './services/auth.service'
export { accountsService } from './services/accounts.service'
export { categoriesService } from './services/categories.service'
export { transactionsService } from './services/transactions.service'
export { budgetsService } from './services/budgets.service'
export { budgetConstraintsService } from './services/budget-constraints.service'
export { goalsService } from './services/goals.service'
export { incomeProfilesService } from './services/income-profiles.service'
export { debtsService } from './services/debts.service'
export { usersService } from './services/users.service'
export { brokersService } from './services/brokers.service'
export { investmentsService } from './services/investments.service'
export { calendarService } from './services/calendar.service'
export { chatService } from './services/chat.service'
export { notificationsService } from './services/notifications.service'
export { budgetAllocationService } from './services/budget-allocation.service'
export { goalPrioritizationService } from './services/goal-prioritization.service'
export { monthService } from './services/month.service'
export { profileService } from './services/profile.service' // Backward compatibility

// Types - Auth
export type { User, TokenInfo, AuthResponse, LoginRequest, RegisterRequest } from './types/auth'

// Types - Accounts
export type {
  Account,
  AccountType,
  SyncStatus,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountsListResponse,
} from './types/accounts'

// Types - Categories
export type {
  Category,
  CategoryType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
} from './types/categories'

// Types - Transactions
export type {
  Transaction,
  TransactionType,
  TransactionStatus,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionFilters,
  TransactionSummary,
  InstrumentSummary,
  SourceSummary,
} from './types/transactions'

// Types - Budgets
export type {
  Budget,
  BudgetPeriod,
  BudgetStatus,
  AlertThreshold,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetFilters,
  BudgetListResponse,
  BudgetSummary,
} from './types/budgets'

// Types - Budget Constraints
export type {
  BudgetConstraint,
  ConstraintStatus,
  CreateBudgetConstraintRequest,
  UpdateBudgetConstraintRequest,
  BudgetConstraintListResponse,
  BudgetConstraintSummary,
  BudgetConstraintFilters,
} from './types/budget-constraints'

// Types - Goals
export type {
  Goal,
  GoalBehavior,
  GoalCategory,
  GoalPriority,
  GoalStatus,
  CreateGoalRequest,
  UpdateGoalRequest,
} from './types/goals'

// Types - Income Profiles
export type {
  IncomeProfile,
  IncomeStatus,
  DSSMetadata,
  CreateIncomeProfileRequest,
  UpdateIncomeProfileRequest,
  IncomeProfileListResponse,
  IncomeSummary,
} from './types/income-profiles'

// Types - Debts
export type {
  Debt,
  DebtType,
  DebtStatus,
  CreateDebtRequest,
  UpdateDebtRequest,
  DebtSummary,
  AddDebtPaymentRequest,
} from './types/debts'

// Types - Users
export type {
  UserProfile,
  UserStatus,
  UpdateUserProfileRequest,
} from './types/users'

// Types - Brokers
export type {
  BrokerConnection,
  BrokerType,
  BrokerStatus,
  CreateSSIBrokerRequest,
  CreateOKXBrokerRequest,
  CreateSepayBrokerRequest,
  UpdateBrokerRequest,
  SyncResult,
} from './types/brokers'

// Types - Investments
export type {
  InvestmentAsset,
  PortfolioSummary,
  PortfolioSnapshot,
  CreateAssetRequest,
  UpdateAssetRequest,
  TransactionResponse as InvestmentTransactionResponse
} from './types/investments'

// Types - Calendar
export type {
  CalendarEvent,
  CreateEventRequest,
  UpdateEventRequest,
  EventListResponse
} from './types/calendar'

// Types - Chat
export type {
  ChatMessage,
  Conversation,
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationDetailResponse
} from './types/chat'

// Types - Notifications
export type {
  Notification,
  NotificationListResponse,
  NotificationStats,
  NotificationPreference,
  AlertRule
} from './types/notifications'

// Types - Analytics
export type {
  BudgetAllocationModelInput,
  GenerateAllocationRequest,
  ExecuteAllocationRequest,
  BudgetAllocationModelOutput,
  AllocationScenario,
  SensitivityAnalysisResult
} from './types/budget-allocation'

export type {
  GoalForRating,
  DirectRatingInput,
  AHPOutput
} from './types/goal-prioritization'

export type {
  MonthViewResponse,
  CreateMonthRequest,
  AssignCategoryRequest,
  MoveMoneyRequest,
  PlanningIterationResponse,
  RecalculatePlanningRequest
} from './types/month'

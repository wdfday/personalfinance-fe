/**
 * API Services Index
 * Export tất cả services để sử dụng trong ứng dụng
 * Synced with backend API - 2024-12-17
 */

// Export base client
export { baseApiClient } from './base'
export type { ApiError, ApiResponse } from './base'

// Import all services first
import { authService } from './auth.service'
import { userService } from './user.service'
import { profileService } from './profile.service'
import { accountsService } from './accounts.service'
import { transactionsService } from './transactions.service'
import { budgetsService } from './budgets.service'
import { goalsService } from './goals.service'
import { debtsService } from './debts.service'
import { investmentsService } from './investments.service'
import { categoriesService } from './categories.service'
import { summariesService } from './summaries.service'
import { calendarService } from './calendar.service'
import { chatService } from './chat.service'
import { brokersService } from './brokers.service'

// Export auth service
export { authService }
export type {
  UserAuthInfo,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  TokenInfo,
  GoogleAuthRequest,
} from './auth.service'

// Export user service
export { userService }
export type {
  User,
  UpdateUserProfileRequest,
  ChangePasswordRequest,
} from './user.service'

// Export profile service  
export { profileService }
export type {
  UserProfile,
  UpdateProfileRequest as UpdateUserProfileExtendedRequest,
  CreateProfileRequest,
} from './profile.service'

// Export accounts service
export { accountsService }
export type {
  Account,
  AccountType,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountListResponse,
  InstitutionName,
  DebitCreditInstitution,
  InvestmentInstitution,
  CryptoInstitution,
} from './accounts.service'

// Export brokers service
export { brokersService }
export type {
  BrokerConnection,
  BrokerType,
  BrokerConnectionStatus,
  CreateBrokerConnectionRequest,
  UpdateBrokerConnectionRequest,
  BrokerListResponse,
  SyncResult,
} from './brokers.service'

// Export transactions service
export { transactionsService }
export type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListResponse,
  TransactionQueryParams,
} from './transactions.service'

// Export budgets service
export { budgetsService }
export type {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetListResponse,
  BudgetSummary,
} from './budgets.service'

// Export goals service
export { goalsService }
export type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalListResponse,
  GoalSummary,
  GoalProgress,
} from './goals.service'

// Export debts service
export { debtsService }
export type {
  Debt,
  CreateDebtRequest,
  UpdateDebtRequest,
  AddDebtPaymentRequest,
  DebtListResponse,
  DebtSummary,
} from './debts.service'

// Export investments service
export { investmentsService }
export type {
  Investment,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentListResponse,
  InvestmentSummary,
} from './investments.service'

// Export categories service
export { categoriesService }
export type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
} from './categories.service'

// Export summaries service
export { summariesService }
export type {
  AccountSummary,
  TransactionSummary,
  BudgetSummary as BudgetSummaryResponse,
  GoalSummary as GoalSummaryResponse,
  InvestmentSummary as InvestmentSummaryResponse,
  DashboardSummary,
  TransactionSummaryParams,
} from './summaries.service'

// Export calendar service
export { calendarService }
export type {
  CalendarEvent,
  CreateEventRequest as CreateCalendarEventRequest,
  UpdateEventRequest as UpdateCalendarEventRequest,
  EventType,
  EventSource,
  RecurrenceType,
  CalendarEventsResponse,
  CalendarQueryParams,
  UpcomingEventsParams,
  GenerateHolidaysRequest,
} from './calendar.service'

// Export chat service
export { chatService }
export type {
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationRequest,
  ListConversationsParams,
  StreamEvent,
  ChatMessage,
  ChatUIMessage,
  ChatUIState,
} from '@/types/chat'

// Re-export tất cả services dưới dạng object
export const apiServices = {
  auth: authService,
  user: userService,
  profile: profileService,
  accounts: accountsService,
  transactions: transactionsService,
  budgets: budgetsService,
  goals: goalsService,
  debts: debtsService,
  investments: investmentsService,
  categories: categoriesService,
  summaries: summariesService,
  calendar: calendarService,
  chat: chatService,
  brokers: brokersService,
}

// Default export
export default apiServices

/**
 * Usage examples:
 * 
 * // Import individual service
 * import { authService } from '@/services/api'
 * await authService.login({ email: 'john@example.com', password: '123' })
 * 
 * // Import all services
 * import { apiServices } from '@/services/api'
 * await apiServices.auth.login({ email: 'john@example.com', password: '123' })
 * 
 * // Import types
 * import type { User, Account, Transaction } from '@/services/api'
 * 
 * // Import from centralized types
 * import type { Budget, Goal, Debt } from '@/types/api'
 */

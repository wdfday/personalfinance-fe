/**
 * API Services Index
 * Export tất cả services để sử dụng trong ứng dụng
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
import { investmentsService } from './investments.service'
import { categoriesService } from './categories.service'
import { summariesService } from './summaries.service'

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
} from './budgets.service'

// Export goals service
export { goalsService }
export type {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalListResponse,
} from './goals.service'

// Export investments service
export { investmentsService }
export type {
  Investment,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentListResponse,
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
  BudgetSummary,
  GoalSummary,
  InvestmentSummary,
  DashboardSummary,
  TransactionSummaryParams,
} from './summaries.service'

// Re-export tất cả services dưới dạng object
export const apiServices = {
  auth: authService,
  user: userService,
  profile: profileService,
  accounts: accountsService,
  transactions: transactionsService,
  budgets: budgetsService,
  goals: goalsService,
  investments: investmentsService,
  categories: categoriesService,
  summaries: summariesService,
}

// Default export
export default apiServices

/**
 * Usage examples:
 * 
 * // Import individual service
 * import { authService } from '@/services/api'
 * await authService.login({ username: 'john', password: '123' })
 * 
 * // Import all services
 * import { apiServices } from '@/services/api'
 * await apiServices.auth.login({ username: 'john', password: '123' })
 * 
 * // Import types
 * import type { User, Account, Transaction } from '@/services/api'
 */


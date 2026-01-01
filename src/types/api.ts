// TYPESCRIPT TYPES FOR FRONTEND
// Auto-generated from server/TYPESCRIPT_TYPES.ts
// Last synced: 2024-12-17

// ============================================
// ENUMS
// ============================================

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type BudgetStatus = 'active' | 'warning' | 'exceeded' | 'paused' | 'expired';
export type AlertThreshold = '50' | '75' | '90' | '100';

export type GoalType = 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'retirement' | 'education' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'overdue';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type ContributionFrequency = 'one_time' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export type DebtType = 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'personal_loan' | 'car_loan' | 'other';
export type DebtStatus = 'active' | 'paid_off' | 'settled' | 'defaulted' | 'inactive';
export type PaymentFrequency = 'one_time' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

// Transaction - Direction-based model (matching BE)
export type TransactionDirection = 'DEBIT' | 'CREDIT';
export type TransactionInstrument = 'CASH' | 'BANK_ACCOUNT' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'E_WALLET' | 'CRYPTO' | 'UNKNOWN';
export type TransactionSource = 'BANK_API' | 'CSV_IMPORT' | 'JSON_IMPORT' | 'MANUAL';
export type TransactionChannel = 'MOBILE_APP' | 'INTERNET_BANKING' | 'ATM' | 'POS' | 'UNKNOWN';
export type CounterpartyType = 'MERCHANT' | 'PERSON' | 'INTERNAL' | 'UNKNOWN';
export type TransactionLinkType = 'GOAL' | 'BUDGET' | 'DEBT';

// Legacy types (deprecated - for backward compatibility)
/** @deprecated Use TransactionDirection instead */
export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';
/** @deprecated */
export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'failed';

export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'investment' | 'crypto_wallet';
export type AccountStatus = 'active' | 'inactive' | 'closed';
export type SyncStatus = 'active' | 'error' | 'disconnected';

export type CategoryType = 'income' | 'expense' | 'both';

export type IncomeType = 'salary' | 'freelance' | 'business' | 'investment' | 'rental' | 'pension' | 'other';
export type IncomeFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

// ============================================
// MAIN ENTITIES
// ============================================

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  period: BudgetPeriod;
  start_date: string;
  end_date?: string;
  category_id?: string;
  account_id?: string;
  spent_amount: number;
  remaining_amount: number;
  percentage_spent: number;
  status: BudgetStatus;
  last_calculated_at?: string;
  enable_alerts: boolean;
  alert_thresholds: AlertThreshold[];
  alerted_at?: string;
  notification_sent: boolean;
  allow_rollover: boolean;
  rollover_amount: number;
  carry_over_percent?: number;
  auto_adjust: boolean;
  auto_adjust_percentage?: number;
  auto_adjust_based_on?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: GoalType;
  priority: GoalPriority;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  startDate: string;
  targetDate?: string;
  completedAt?: string;
  percentageComplete: number;
  remainingAmount: number;
  status: GoalStatus;
  suggestedContribution?: number;
  contributionFrequency?: ContributionFrequency;
  autoContribute: boolean;
  autoContributeAmount?: number;
  autoContributeAccountId?: string;
  linkedAccountId?: string;
  enableReminders: boolean;
  reminderFrequency?: string;
  lastReminderSentAt?: string;
  milestones?: string;
  notes?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: DebtType;
  principal_amount: number;
  current_balance: number;
  currency: string;
  interest_rate: number;
  minimum_payment: number;
  payment_frequency?: PaymentFrequency;
  next_payment_date?: string;
  start_date: string;
  paid_off_date?: string;
  total_paid: number;
  total_interest_paid: number;
  remaining_amount: number;
  percentage_paid: number;
  status: DebtStatus;
  creditor_name?: string;
  account_number?: string;
  linked_account_id?: string;
  auto_pay: boolean;
  auto_pay_amount?: number;
  enable_reminders: boolean;
  reminder_days_before?: number;
  last_reminder_sent_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Transaction - New direction-based model
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;

  // Direction-based classification
  direction: TransactionDirection;
  instrument: TransactionInstrument;
  source: TransactionSource;

  // Bank/external system info
  bankCode?: string;
  externalId?: string;
  channel?: TransactionChannel;

  // Amount (in smallest currency unit, e.g., VND dong)
  amount: number;
  currency: string;
  runningBalance?: number;

  // Timestamps
  bookingDate: string;
  valueDate: string;
  createdAt: string;
  importedAt?: string;

  // Description
  description?: string;
  userNote?: string;
  reference?: string;

  // Counterparty
  counterparty?: TransactionCounterparty;

  // Classification
  classification?: TransactionClassification;

  // Links to other entities
  links?: TransactionLink[];

  // Metadata
  meta?: TransactionMeta;
}

export interface TransactionCounterparty {
  name?: string;
  accountNumber?: string;
  bankName?: string;
  type?: CounterpartyType;
}

export interface TransactionClassification {
  systemCategory?: string;
  userCategoryId?: string;
  isTransfer?: boolean;
  isRefund?: boolean;
  tags?: string[];
}

export interface TransactionLink {
  type: TransactionLinkType;
  id: string;
}

export interface TransactionMeta {
  checkImageAvailability?: string;
  raw?: Record<string, unknown>;
}

export interface Account {
  id: string;
  userId: string;
  accountName: string;
  accountType: AccountType;
  institutionName?: string;
  currentBalance: number;
  availableBalance?: number;
  currency: string;
  accountNumberMasked?: string;
  isActive: boolean;
  isPrimary: boolean;
  includeInNetWorth: boolean;
  lastSyncedAt?: string;
  syncStatus?: SyncStatus;
  syncErrorMessage?: string;
  brokerConnectionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  parent_id?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  is_system: boolean;
  display_order?: number;
  budget_amount?: number;
  description?: string;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface BudgetProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category_id?: string;
  min_amount: number;
  max_amount: number;
  target_amount?: number;
  constraint_type: 'hard' | 'soft' | 'aspirational';
  priority: number;
  is_flexible: boolean;
  is_active: boolean;
  version: number;
  effective_from: string;
  effective_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeProfile {
  id: string;
  user_id: string;
  name: string;
  type: IncomeType;
  amount: number;
  currency: string;
  frequency: IncomeFrequency;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  is_verified: boolean;
  verified_at?: string;
  source_name?: string;
  account_id?: string;
  tax_rate?: number;
  is_taxable: boolean;
  is_guaranteed: boolean;
  confidence_level?: number;
  version: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface BudgetSummary {
  total_budgets: number;
  active_budgets: number;
  exceeded_budgets: number;
  warning_budgets: number;
  total_amount: number;
  total_spent: number;
  total_remaining: number;
  average_percentage: number;
  budgets_by_category?: Record<string, CategoryBudgetSum>;
}

export interface CategoryBudgetSum {
  category_id: string;
  category_name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface GoalSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overdueGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemaining: number;
  averageProgress: number;
  goalsByType?: Record<string, GoalTypeSum>;
  goalsByPriority?: Record<string, number>;
}

export interface GoalTypeSum {
  count: number;
  targetAmount: number;
  currentAmount: number;
  progress: number;
}

export interface GoalProgress {
  goalId: string;
  name: string;
  type: GoalType;
  priority: GoalPriority;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageComplete: number;
  status: GoalStatus;
  startDate: string;
  targetDate?: string;
  daysElapsed: number;
  daysRemaining?: number;
  timeProgress?: number;
  onTrack?: boolean;
  suggestedContribution?: number;
  projectedCompletionDate?: string;
}

export interface DebtSummary {
  total_debts: number;
  active_debts: number;
  paid_off_debts: number;
  overdue_debts: number;
  total_principal_amount: number;
  total_current_balance: number;
  total_paid: number;
  total_remaining: number;
  total_interest_paid: number;
  average_progress: number;
  debts_by_type?: Record<string, DebtTypeSum>;
  debts_by_status?: Record<string, number>;
}

export interface DebtTypeSum {
  count: number;
  principal_amount: number;
  current_balance: number;
  total_paid: number;
  progress: number;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateBudgetRequest {
  name: string;
  description?: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date?: string;
  category_id?: string;
  account_id?: string;
  enable_alerts?: boolean;
  alert_thresholds?: AlertThreshold[];
  allow_rollover?: boolean;
  carry_over_percent?: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  description?: string;
  amount?: number;
  period?: BudgetPeriod;
  start_date?: string;
  end_date?: string;
  category_id?: string;
  account_id?: string;
  enable_alerts?: boolean;
  alert_thresholds?: AlertThreshold[];
  allow_rollover?: boolean;
  carry_over_percent?: number;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  type: GoalType;
  priority: GoalPriority;
  targetAmount: number;
  startDate: string;
  targetDate?: string;
  contributionFrequency?: ContributionFrequency;
  linkedAccountId?: string;
  autoContribute?: boolean;
  autoContributeAmount?: number;
  autoContributeAccountId?: string;
  enableReminders?: boolean;
  reminderFrequency?: string;
  notes?: string;
  tags?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  type?: GoalType;
  priority?: GoalPriority;
  targetAmount?: number;
  startDate?: string;
  targetDate?: string;
  contributionFrequency?: ContributionFrequency;
  linkedAccountId?: string;
  autoContribute?: boolean;
  autoContributeAmount?: number;
  autoContributeAccountId?: string;
  enableReminders?: boolean;
  reminderFrequency?: string;
  status?: GoalStatus;
  notes?: string;
  tags?: string;
}

export interface CreateDebtRequest {
  name: string;
  description?: string;
  type: DebtType;
  principal_amount: number;
  interest_rate: number;
  minimum_payment: number;
  payment_frequency?: PaymentFrequency;
  start_date: string;
  creditor_name?: string;
  linked_account_id?: string;
}

export interface UpdateDebtRequest {
  name?: string;
  description?: string;
  type?: DebtType;
  principal_amount?: number;
  interest_rate?: number;
  minimum_payment?: number;
  payment_frequency?: PaymentFrequency;
  start_date?: string;
  creditor_name?: string;
  linked_account_id?: string;
}

// Transaction Request DTOs - Direction-based model
export interface CreateTransactionRequest {
  accountId: string;
  direction: TransactionDirection;
  instrument: TransactionInstrument;
  source: TransactionSource;

  // Amount (in smallest currency unit)
  amount: number;
  currency?: string; // Default: VND

  // Timestamps
  bookingDate: string; // ISO format
  valueDate?: string;

  // Description
  description?: string;
  userNote?: string;
  reference?: string;

  // Bank-specific (optional)
  bankCode?: string;
  externalId?: string;
  channel?: TransactionChannel;
  runningBalance?: number;

  // Counterparty (optional)
  counterpartyName?: string;
  counterpartyAccountNumber?: string;
  counterpartyBankName?: string;
  counterpartyType?: CounterpartyType;

  // Classification (optional)
  systemCategory?: string;
  userCategoryId?: string;
  isTransfer?: boolean;
  isRefund?: boolean;
  tags?: string[];

  // Links (optional)
  links?: TransactionLink[];
}

export interface UpdateTransactionRequest {
  accountId?: string;
  direction?: TransactionDirection;
  instrument?: TransactionInstrument;
  source?: TransactionSource;

  amount?: number;
  currency?: string;

  bookingDate?: string;
  valueDate?: string;

  description?: string;
  userNote?: string;
  reference?: string;

  bankCode?: string;
  externalId?: string;
  channel?: TransactionChannel;
  runningBalance?: number;

  counterpartyName?: string;
  counterpartyAccountNumber?: string;
  counterpartyBankName?: string;
  counterpartyType?: CounterpartyType;

  systemCategory?: string;
  userCategoryId?: string;
  isTransfer?: boolean;
  isRefund?: boolean;
  tags?: string[];

  links?: TransactionLink[];
}

// Transaction query filters
export interface TransactionQueryFilters {
  accountId?: string;
  direction?: TransactionDirection;
  instrument?: TransactionInstrument;
  source?: TransactionSource;
  bankCode?: string;
  startBookingDate?: string;
  endBookingDate?: string;
  startValueDate?: string;
  endValueDate?: string;
  minAmount?: number;
  maxAmount?: number;
  categoryId?: string;
  isTransfer?: boolean;
  isRefund?: boolean;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'booking_date' | 'value_date' | 'amount' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Transaction List Response
export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  summary?: TransactionSummary;
}

// Transaction Summary
export interface TransactionSummary {
  totalDebit: number;
  totalCredit: number;
  netAmount: number;
  count: number;
  byInstrument?: Record<string, InstrumentSummary>;
  bySource?: Record<string, SourceSummary>;
}

export interface InstrumentSummary {
  debit: number;
  credit: number;
  count: number;
}

export interface SourceSummary {
  debit: number;
  credit: number;
  count: number;
}

// Import JSON transactions
export interface ImportJSONRequest {
  accountId: string;
  bankCode: string;
  transactions: unknown[]; // Raw bank JSON
  skipDuplicates?: boolean;
}

export interface ImportJSONResponse {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface ContributeToGoalRequest {
  amount: number;
}

export interface AddDebtPaymentRequest {
  amount: number;
}

// ============================================
// API RESPONSE WRAPPER
// ============================================

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TransactionFilters extends PaginationParams {
  type?: TransactionType;
  category_id?: string;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface BudgetFilters extends PaginationParams {
  status?: BudgetStatus;
  period?: BudgetPeriod;
  category_id?: string;
  account_id?: string;
}

export interface GoalFilters extends PaginationParams {
  status?: GoalStatus;
  type?: GoalType;
  priority?: GoalPriority;
}

// ============================================
// CALENDAR EVENTS
// ============================================

export type EventType = 'personal' | 'holiday' | 'birthday' | 'anniversary' | 'meeting' | 'reminder' | 'other';
export type EventSource = 'user_created' | 'system_generated';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: EventType;
  source: EventSource;
  start_date: string; // ISO 8601 format
  end_date?: string;
  all_day: boolean;
  color?: string; // Hex color like #FF5733
  tags?: string; // JSON array string
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  is_multi_day: boolean;
  duration_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  type?: EventType;
  start_date: string; // ISO 8601: "2025-03-15" or "2025-03-15T14:30:00Z"
  end_date?: string;
  all_day?: boolean;
  color?: string; // Hex color: #FF5733
  tags?: string; // JSON array: '["family", "important"]'
}

export interface UpdateEventRequest {
  name?: string;
  description?: string;
  type?: EventType;
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  color?: string;
  tags?: string;
}

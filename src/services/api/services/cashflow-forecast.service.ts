import { apiClient } from '../client';

// ==================== Types ====================

export interface ForecastInput {
  user_id: string;
  monthly_income: number;
  monthly_expenses: number;
  current_cash: number;
  irregular_income_history?: number[];
  irregular_expense_history?: number[];
  months_ahead?: number;
}

export interface MonthlyForecast {
  month: number;
  expected_cash: number;
  min_cash: number;
  max_cash: number;
  probability_negative: number;
}

export interface ForecastResult {
  profile_type: string;
  stability_score: number;
  risk_level: string;
  monthly_forecast: MonthlyForecast[];
  recommendations: string[];
}

export interface StressTestInput {
  scenario_name: string;
  current_cash: number;
  monthly_income: number;
  monthly_expenses: number;
  emergency_fund: number;
  shock_type: 'income_loss' | 'expense_spike' | 'inflation';
  shock_magnitude: number;
  shock_duration_months: number;
  income_volatility?: number;
  expense_volatility?: number;
}

export interface StressTestResult {
  scenario_name: string;
  survival_probability: number;
  months_until_broke: number;
  min_cash_balance: number;
  recovery_months: number;
  recommendation: string;
  severity: string;
}

// ==================== API Service ====================

export const cashflowForecastService = {
  // Calculate cashflow forecast
  calculateForecast: (data: ForecastInput) =>
    apiClient.post<ForecastResult>('/analytics/cashflow/forecast', data),

  // Run stress test
  runStressTest: (data: StressTestInput) =>
    apiClient.post<StressTestResult>('/analytics/cashflow/stress-test', data),

  // Preset scenarios
  createJobLossScenario: (params: {
    current_cash: number;
    monthly_income: number;
    monthly_expenses: number;
    emergency_fund: number;
  }) =>
    apiClient.post<StressTestInput>('/analytics/cashflow/scenarios/job-loss', params),

  createMedicalShockScenario: (params: {
    current_cash: number;
    monthly_income: number;
    monthly_expenses: number;
    emergency_fund: number;
  }) =>
    apiClient.post<StressTestInput>('/analytics/cashflow/scenarios/medical-shock', params),

  createInflationScenario: (params: {
    current_cash: number;
    monthly_income: number;
    monthly_expenses: number;
    emergency_fund: number;
  }) =>
    apiClient.post<StressTestInput>('/analytics/cashflow/scenarios/inflation', params),

  createFreelancerDrySpellScenario: (params: {
    current_cash: number;
    monthly_income: number;
    monthly_expenses: number;
    emergency_fund: number;
    dry_months: number;
  }) =>
    apiClient.post<StressTestInput>('/analytics/cashflow/scenarios/freelancer-dry-spell', params),
};

export default cashflowForecastService;

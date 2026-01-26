import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dssWorkflowService } from '@/services/api/services/dss-workflow.service';
import type {
  AutoScoringRequest,
  GoalPrioritizationRequest,
  DebtStrategyRequest,
  PreviewBudgetAllocationRequest,
  ApplyGoalPrioritizationRequest,
  ApplyDebtStrategyRequest,
  ApplyBudgetAllocationRequest,
  FinalizeDSSRequest,
  FinalizeDSSResponse,
} from '@/services/api/services/dss-workflow.service';

// ==================== Types ====================

interface AutoScoringResult {
  goals: Array<{
    goal_id: string;
    goal_name: string;
    goal_type: string;
    scores: {
      feasibility: { score: number; reason: string };
      impact: { score: number; reason: string };
      importance: { score: number; reason: string };
      urgency: { score: number; reason: string };
    };
  }>;
  default_criteria_weights: Record<string, number>;
  suggested_criteria_ratings: Record<string, number>;
}

interface GoalPrioritizationResult {
  alternative_priorities: Record<string, number>;
  criteria_weights: Record<string, number>;
  local_priorities: Record<string, Record<string, number>>;
  consistency_ratio: number;
  is_consistent: boolean;
  ranking: Array<{
    alternative_id: string;
    alternative_name: string;
    priority: number;
    rank: number;
  }>;
}

interface PaymentPlan {
  debt_id: string;
  debt_name: string;
  monthly_payment: number;
  extra_payment: number;
  payoff_month: number;
  total_interest: number;
  timeline?: Array<{
    month: number;
    start_balance: number;
    interest: number;
    payment: number;
    end_balance: number;
  }>;
}

interface DebtStrategyResult {
  recommended_strategy: string;
  strategy_comparison: Array<{
    strategy: string;
    total_interest: number;
    months: number;
    interest_saved: number;
    first_debt_cleared: number;
    description: string;
    pros: string[];
    cons: string[];
    payment_plans?: PaymentPlan[];
    monthly_allocation: number; // Total monthly payment allocation for this strategy
  }>;
  payment_plans?: PaymentPlan[]; // Payment plans for recommended strategy (revolving debts)
  fixed_payments?: PaymentPlan[]; // Fixed payments for installment/interest_only debts (no chart needed)
  // Optional high-level summary (mirrors DebtStrategyOutput)
  total_interest?: number;
  months_to_debt_free?: number;
  reasoning?: string;
  key_facts?: string[];
}

// Step 3 tradeoff removed - no longer used

interface BudgetAllocationResult {
  total_income: number;
  scenarios: Array<{
    scenario_type: string;
    category_allocations: Array<{
      category_id: string;
      category_name: string;
      amount: number;
      minimum: number;
      maximum: number;
      is_flexible: boolean;
      priority: number;
    }>;
    summary: {
      total_income: number;
      total_allocated: number;
      surplus: number;
      mandatory_expenses: number;
      flexible_expenses: number;
      total_debt_payments: number;
      total_goal_contributions: number;
      savings_rate: number;
    };
    feasibility_score: number;
  }>;
  is_feasible: boolean;
}

interface DSSWorkflowState {
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
  
  // Allocation params để thử số tiền cấp phát cho goal-debt (dùng cho Step 0 và Step 2)
  allocationParams: {
    goalAllocationPct: number; // 0-100, default 20
    debtAllocationPct: number; // 0-100, default calculated from min_payment/income
  };
  
  autoScoring: {
    loading: boolean;
    results: AutoScoringResult | null;
    customWeights: Record<string, number> | null; // User-adjusted criteria weights (0-1 scale)
    error: string | null;
  };
  
  goalPrioritization: {
    loading: boolean;
    preview: GoalPrioritizationResult | null;
    applied: boolean;
    error: string | null;
  };
  
  debtStrategy: {
    loading: boolean;
    preview: DebtStrategyResult | null;
    applied: boolean;
    selectedStrategy: string | null;
    error: string | null;
  };
  
  // Step 3: Budget Allocation (tradeoff step removed)
  budgetAllocation: {
    loading: boolean;
    preview: BudgetAllocationResult | null;
    applied: boolean;
    selectedScenario: string | null;
    error: string | null;
  };

  // Finalize DSS (Approach 2: Apply All at Once)
  finalize: {
    loading: boolean;
    stateVersion: number | null;
    error: string | null;
  };
}

const initialState: DSSWorkflowState = {
  currentStep: 0,
  completedSteps: [],
  isComplete: false,
  
  allocationParams: {
    goalAllocationPct: 20, // Default 20% income cho goals
    debtAllocationPct: 0, // Sẽ được tính từ min_payment/income trong component
  },
  
  autoScoring: {
    loading: false,
    results: null,
    customWeights: null,
    error: null,
  },
  
  goalPrioritization: {
    loading: false,
    preview: null,
    applied: false,
    error: null,
  },
  
  debtStrategy: {
    loading: false,
    preview: null,
    applied: false,
    selectedStrategy: null,
    error: null,
  },
  
  budgetAllocation: {
    loading: false,
    preview: null,
    applied: false,
    selectedScenario: null,
    error: null,
  },

  finalize: {
    loading: false,
    stateVersion: null,
    error: null,
  },
};

// ==================== Async Thunks - Preview ====================

export const previewAutoScoring = createAsyncThunk<
  AutoScoringResult,
  { monthStr: string; data: AutoScoringRequest; useAllocationParams?: boolean },
  { state: { dssWorkflow: DSSWorkflowState } }
>(
  'dssWorkflow/previewAutoScoring',
  async ({ monthStr, data, useAllocationParams = false }, { rejectWithValue, getState }) => {
    try {
      // Nếu useAllocationParams = true, merge allocation params từ state vào request
      // Step 0 chỉ dùng goal_allocation_pct (không có debt)
      const finalData: AutoScoringRequest = { ...data };
      if (useAllocationParams) {
        const state = getState().dssWorkflow;
        if (state.allocationParams.goalAllocationPct !== null) {
          finalData.goal_allocation_pct = state.allocationParams.goalAllocationPct;
        }
      }
      const response = await dssWorkflowService.previewAutoScoring(monthStr, finalData);
      console.log('✅ Thunk result:', response);
      return response as AutoScoringResult;
    } catch (error: any) {
      console.error('❌ Thunk error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to preview auto-scoring');
    }
  }
);

export const previewGoalPrioritization = createAsyncThunk<GoalPrioritizationResult, { monthStr: string; data: GoalPrioritizationRequest }>(
  'dssWorkflow/previewGoalPrioritization',
  async ({ monthStr, data }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.previewGoalPrioritization(monthStr, data);
      console.log('✅ Goal prioritization response:', response);
      return response as GoalPrioritizationResult;
    } catch (error: any) {
      console.error('❌ Goal prioritization error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to preview goal prioritization');
    }
  }
);

export const previewDebtStrategy = createAsyncThunk<
  DebtStrategyResult,
  { monthStr: string; data: DebtStrategyRequest; useAllocationParams?: boolean },
  { state: { dssWorkflow: DSSWorkflowState } }
>(
  'dssWorkflow/previewDebtStrategy',
  async ({ monthStr, data, useAllocationParams = false }, { rejectWithValue, getState }) => {
    try {
      // Nếu useAllocationParams = true, merge allocation params từ state vào request
      const finalData: DebtStrategyRequest = { ...data };
      if (useAllocationParams) {
        const state = getState().dssWorkflow;
        if (state.allocationParams.goalAllocationPct !== null) {
          finalData.goal_allocation_pct = state.allocationParams.goalAllocationPct;
        }
        if (state.allocationParams.debtAllocationPct !== null) {
          finalData.debt_allocation_pct = state.allocationParams.debtAllocationPct;
        }
      }
      const response = await dssWorkflowService.previewDebtStrategy(monthStr, finalData);
      // apiClient đã unwrap, response chính là body
      return response as unknown as DebtStrategyResult;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to preview debt strategy');
    }
  }
);

// Step 3 tradeoff removed - no longer available

export const previewBudgetAllocation = createAsyncThunk(
  'dssWorkflow/previewBudgetAllocation',
  async ({ monthStr, data }: { monthStr: string; data: PreviewBudgetAllocationRequest }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.previewBudgetAllocation(monthStr, data);
      return response as unknown as BudgetAllocationResult;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to preview budget allocation');
    }
  }
);

// ==================== Async Thunks - Apply ====================

export const applyGoalPrioritization = createAsyncThunk(
  'dssWorkflow/applyGoalPrioritization',
  async ({ monthStr, data }: { monthStr: string; data: ApplyGoalPrioritizationRequest }, { rejectWithValue }) => {
    try {
      await dssWorkflowService.applyGoalPrioritization(monthStr, data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply goal prioritization');
    }
  }
);

export const applyDebtStrategy = createAsyncThunk(
  'dssWorkflow/applyDebtStrategy',
  async ({ monthStr, data }: { monthStr: string; data: ApplyDebtStrategyRequest }, { rejectWithValue }) => {
    try {
      await dssWorkflowService.applyDebtStrategy(monthStr, data);
      // Request đã có selected_strategy, lưu trực tiếp từ request data
      return { selected_strategy: data.selected_strategy };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply debt strategy');
    }
  }
);

// Step 3 tradeoff removed - no longer available

export const applyBudgetAllocation = createAsyncThunk(
  'dssWorkflow/applyBudgetAllocation',
  async ({ monthStr, data }: { monthStr: string; data: ApplyBudgetAllocationRequest }, { rejectWithValue }) => {
    try {
      await dssWorkflowService.applyBudgetAllocation(monthStr, data);
      // Note: Backend now finalizes DSS workflow (saves to MonthState and clears Redis) in this call
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply budget allocation');
    }
  }
);

// ==================== Async Thunks - Workflow Management ====================

export const fetchWorkflowStatus = createAsyncThunk<any, string>(
  'dssWorkflow/fetchStatus',
  async (monthStr, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.getWorkflowStatus(monthStr);
      // apiClient đã unwrap, trả về trực tiếp body
      return response as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workflow status');
    }
  }
);

export const resetWorkflow = createAsyncThunk(
  'dssWorkflow/reset',
  async (monthStr: string, { rejectWithValue }) => {
    try {
      await dssWorkflowService.resetWorkflow(monthStr);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset workflow');
    }
  }
);

// ==================== Finalize DSS (Apply All at Once) ====================

export const finalizeDSS = createAsyncThunk(
  'dssWorkflow/finalize',
  async ({ monthStr, data }: { monthStr: string; data: FinalizeDSSRequest }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.finalizeDSS(monthStr, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finalize DSS');
    }
  }
);

// ==================== Slice ====================

const dssWorkflowSlice = createSlice({
  name: 'dssWorkflow',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setCustomWeights: (state, action: PayloadAction<Record<string, number>>) => {
      state.autoScoring.customWeights = action.payload;
    },
    clearError: (state, action: PayloadAction<'autoScoring' | 'goalPrioritization' | 'debtStrategy' | 'budgetAllocation'>) => {
      state[action.payload].error = null;
    },
    setAllocationParams: (state, action: PayloadAction<{ goalAllocationPct: number | null; debtAllocationPct: number | null }>) => {
      state.allocationParams = action.payload;
    },
    // Reset toàn bộ local DSS state (không gọi API reset workflow)
    resetLocalDSSState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Preview Auto-Scoring
    builder
      .addCase(previewAutoScoring.pending, (state) => {
        state.autoScoring.loading = true;
        state.autoScoring.error = null;
      })
      .addCase(previewAutoScoring.fulfilled, (state, action: PayloadAction<AutoScoringResult>) => {
        state.autoScoring.loading = false;
        state.autoScoring.results = action.payload;
      })
      .addCase(previewAutoScoring.rejected, (state, action) => {
        state.autoScoring.loading = false;
        state.autoScoring.error = action.payload as string;
      });

    // Preview Goal Prioritization
    builder
      .addCase(previewGoalPrioritization.pending, (state) => {
        state.goalPrioritization.loading = true;
        state.goalPrioritization.error = null;
      })
      .addCase(previewGoalPrioritization.fulfilled, (state, action: PayloadAction<GoalPrioritizationResult>) => {
        state.goalPrioritization.loading = false;
        state.goalPrioritization.preview = action.payload;
      })
      .addCase(previewGoalPrioritization.rejected, (state, action) => {
        state.goalPrioritization.loading = false;
        state.goalPrioritization.error = action.payload as string;
      });

    // Apply Goal Prioritization
    builder
      .addCase(applyGoalPrioritization.pending, (state) => {
        state.goalPrioritization.loading = true;
        state.goalPrioritization.error = null;
      })
      .addCase(applyGoalPrioritization.fulfilled, (state) => {
        state.goalPrioritization.loading = false;
        state.goalPrioritization.applied = true;
        // Cho phép Step 1 và Step 2 chạy song song - không ép currentStep
        if (!state.completedSteps.includes(1)) {
          state.completedSteps.push(1);
        }
        // Chỉ update currentStep nếu chưa có step nào khác completed
        if (state.currentStep < 1) {
          state.currentStep = 1;
        }
      })
      .addCase(applyGoalPrioritization.rejected, (state, action) => {
        state.goalPrioritization.loading = false;
        state.goalPrioritization.error = action.payload as string;
      });

    // Preview Debt Strategy
    builder
      .addCase(previewDebtStrategy.pending, (state) => {
        state.debtStrategy.loading = true;
        state.debtStrategy.error = null;
      })
      .addCase(previewDebtStrategy.fulfilled, (state, action) => {
        state.debtStrategy.loading = false;
        state.debtStrategy.preview = action.payload;
      })
      .addCase(previewDebtStrategy.rejected, (state, action) => {
        state.debtStrategy.loading = false;
        state.debtStrategy.error = action.payload as string;
      });

    // Apply Debt Strategy
    builder
      .addCase(applyDebtStrategy.pending, (state) => {
        state.debtStrategy.loading = true;
        state.debtStrategy.error = null;
      })
      .addCase(applyDebtStrategy.fulfilled, (state, action) => {
        state.debtStrategy.loading = false;
        state.debtStrategy.applied = true;
        state.debtStrategy.selectedStrategy = action.payload.selected_strategy;
        // Cho phép Step 1 và Step 2 chạy song song - không ép currentStep
        if (!state.completedSteps.includes(2)) {
          state.completedSteps.push(2);
        }
        // Chỉ update currentStep nếu chưa có step nào khác completed
        if (state.currentStep < 2) {
          state.currentStep = 2;
        }
      })
      .addCase(applyDebtStrategy.rejected, (state, action) => {
        state.debtStrategy.loading = false;
        state.debtStrategy.error = action.payload as string;
      });

    // Step 3 tradeoff removed - no longer available

    // Preview Budget Allocation
    builder
      .addCase(previewBudgetAllocation.pending, (state) => {
        state.budgetAllocation.loading = true;
        state.budgetAllocation.error = null;
      })
      .addCase(previewBudgetAllocation.fulfilled, (state, action) => {
        state.budgetAllocation.loading = false;
        state.budgetAllocation.preview = action.payload;
      })
      .addCase(previewBudgetAllocation.rejected, (state, action) => {
        state.budgetAllocation.loading = false;
        state.budgetAllocation.error = action.payload as string;
      });

    // Apply Budget Allocation
    builder
      .addCase(applyBudgetAllocation.pending, (state) => {
        state.budgetAllocation.loading = true;
        state.budgetAllocation.error = null;
      })
      .addCase(applyBudgetAllocation.fulfilled, (state, action) => {
        state.budgetAllocation.loading = false;
        state.budgetAllocation.applied = true;
        state.budgetAllocation.selectedScenario = action.payload.selected_scenario;
        // Step 3 là Budget Allocation (tradeoff đã bị xoá)
        if (!state.completedSteps.includes(3)) {
          state.completedSteps.push(3);
        }
        state.currentStep = 3;
        state.isComplete = true;
      })
      .addCase(applyBudgetAllocation.rejected, (state, action) => {
        state.budgetAllocation.loading = false;
        state.budgetAllocation.error = action.payload as string;
      });

    // Fetch Workflow Status
    builder
      .addCase(fetchWorkflowStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.currentStep = action.payload.current_step || 0;
        state.completedSteps = action.payload.completed_steps || [];
        state.isComplete = action.payload.is_complete || false;
      });

    // Reset Workflow
    builder.addCase(resetWorkflow.fulfilled, (state) => {
      return initialState;
    });

    // Finalize DSS (Apply All at Once)
    builder
      .addCase(finalizeDSS.pending, (state) => {
        state.finalize.loading = true;
        state.finalize.error = null;
      })
      .addCase(finalizeDSS.fulfilled, (state, action: PayloadAction<FinalizeDSSResponse>) => {
        state.finalize.loading = false;
        state.finalize.stateVersion = action.payload.state_version;
        
        // Mark all steps as applied
        state.goalPrioritization.applied = action.payload.dss_workflow.step1_applied;
        state.debtStrategy.applied = action.payload.dss_workflow.step2_applied;
        // Step 3 tradeoff removed - step3_applied luôn false
        state.budgetAllocation.applied = action.payload.dss_workflow.step4_applied;
        
        // Update workflow status
        state.currentStep = action.payload.dss_workflow.current_step;
        state.completedSteps = action.payload.dss_workflow.completed_steps;
        state.isComplete = action.payload.dss_workflow.is_complete;
      })
      .addCase(finalizeDSS.rejected, (state, action) => {
        state.finalize.loading = false;
        state.finalize.error = action.payload as string;
    });
  },
});

export const { setCurrentStep, setCustomWeights, clearError, resetLocalDSSState, setAllocationParams } = dssWorkflowSlice.actions;
export default dssWorkflowSlice.reducer;

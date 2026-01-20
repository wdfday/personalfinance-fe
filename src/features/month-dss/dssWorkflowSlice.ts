import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dssWorkflowService } from '@/services/api/services/dss-workflow.service';
import type {
  AutoScoringRequest,
  GoalPrioritizationRequest,
  DebtStrategyRequest,
  PreviewGoalDebtTradeoffRequest,
  PreviewBudgetAllocationRequest,
  ApplyGoalPrioritizationRequest,
  ApplyDebtStrategyRequest,
  ApplyGoalDebtTradeoffRequest,
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

interface DebtStrategyResult {
  scenarios: Array<{
    strategy: string;
    total_interest: number;
    months_to_debt_free: number;
    monthly_payment: number;
  }>;
  recommended_strategy: string;
}

interface TradeoffResult {
  recommended_goal_allocation: number;
  recommended_debt_allocation: number;
  scenarios: Array<{
    name: string;
    goal_percent: number;
    debt_percent: number;
  }>;
}

interface BudgetAllocationResult {
  scenarios: Array<{
    scenario_name: string;
    category_allocations: Array<{
      category_id: string;
      amount: number;
    }>;
  }>;
}

interface DSSWorkflowState {
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
  
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
  
  goalDebtTradeoff: {
    loading: boolean;
    preview: TradeoffResult | null;
    applied: boolean;
    goalPercent: number | null;
    debtPercent: number | null;
    error: string | null;
  };
  
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
  
  goalDebtTradeoff: {
    loading: false,
    preview: null,
    applied: false,
    goalPercent: null,
    debtPercent: null,
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

export const previewAutoScoring = createAsyncThunk(
  'dssWorkflow/previewAutoScoring',
  async ({ monthStr, data }: { monthStr: string; data: AutoScoringRequest }, { rejectWithValue }) => {
    try {
      // apiClient already unwraps .data, so response IS the data
      const response = await dssWorkflowService.previewAutoScoring(monthStr, data);
      console.log('✅ Thunk result:', response);
      return response; // Don't access .data again!
    } catch (error: any) {
      console.error('❌ Thunk error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to preview auto-scoring');
    }
  }
);

export const previewGoalPrioritization = createAsyncThunk(
  'dssWorkflow/previewGoalPrioritization',
  async ({ monthStr, data }: { monthStr: string; data: GoalPrioritizationRequest }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.previewGoalPrioritization(monthStr, data);
      console.log('✅ Goal prioritization response:', response);
      return response; // apiClient already unwraps .data
    } catch (error: any) {
      console.error('❌ Goal prioritization error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to preview goal prioritization');
    }
  }
);

export const previewDebtStrategy = createAsyncThunk(
  'dssWorkflow/previewDebtStrategy',
  async ({ monthStr, data }: { monthStr: string; data: DebtStrategyRequest }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.previewDebtStrategy(monthStr, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to preview debt strategy');
    }
  }
);

export const previewGoalDebtTradeoff = createAsyncThunk(
  'dssWorkflow/previewGoalDebtTradeoff',
  async ({ monthStr, data }: { monthStr: string; data: PreviewGoalDebtTradeoffRequest }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.previewGoalDebtTradeoff(monthStr, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to preview goal-debt tradeoff');
    }
  }
);

export const previewBudgetAllocation = createAsyncThunk(
  'dssWorkflow/previewBudgetAllocation',
  async ({ monthStr, data }: { monthStr: string; data: PreviewBudgetAllocationRequest }, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.previewBudgetAllocation(monthStr, data);
      return response.data;
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
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply debt strategy');
    }
  }
);

export const applyGoalDebtTradeoff = createAsyncThunk(
  'dssWorkflow/applyGoalDebtTradeoff',
  async ({ monthStr, data }: { monthStr: string; data: ApplyGoalDebtTradeoffRequest }, { rejectWithValue }) => {
    try {
      await dssWorkflowService.applyGoalDebtTradeoff(monthStr, data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply goal-debt tradeoff');
    }
  }
);

export const applyBudgetAllocation = createAsyncThunk(
  'dssWorkflow/applyBudgetAllocation',
  async ({ monthStr, data }: { monthStr: string; data: ApplyBudgetAllocationRequest }, { rejectWithValue }) => {
    try {
      await dssWorkflowService.applyBudgetAllocation(monthStr, data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply budget allocation');
    }
  }
);

// ==================== Async Thunks - Workflow Management ====================

export const fetchWorkflowStatus = createAsyncThunk(
  'dssWorkflow/fetchStatus',
  async (monthStr: string, { rejectWithValue }) => {
    try {
      const response = await dssWorkflowService.getWorkflowStatus(monthStr);
      return response.data;
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
    clearError: (state, action: PayloadAction<'autoScoring' | 'goalPrioritization' | 'debtStrategy' | 'goalDebtTradeoff' | 'budgetAllocation'>) => {
      state[action.payload].error = null;
    },
  },
  extraReducers: (builder) => {
    // Preview Auto-Scoring
    builder
      .addCase(previewAutoScoring.pending, (state) => {
        state.autoScoring.loading = true;
        state.autoScoring.error = null;
      })
      .addCase(previewAutoScoring.fulfilled, (state, action) => {
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
      .addCase(previewGoalPrioritization.fulfilled, (state, action) => {
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
        state.completedSteps.push(1);
        state.currentStep = 2;
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
        state.completedSteps.push(2);
        state.currentStep = 3;
      })
      .addCase(applyDebtStrategy.rejected, (state, action) => {
        state.debtStrategy.loading = false;
        state.debtStrategy.error = action.payload as string;
      });

    // Preview Goal-Debt Tradeoff
    builder
      .addCase(previewGoalDebtTradeoff.pending, (state) => {
        state.goalDebtTradeoff.loading = true;
        state.goalDebtTradeoff.error = null;
      })
      .addCase(previewGoalDebtTradeoff.fulfilled, (state, action) => {
        state.goalDebtTradeoff.loading = false;
        state.goalDebtTradeoff.preview = action.payload;
      })
      .addCase(previewGoalDebtTradeoff.rejected, (state, action) => {
        state.goalDebtTradeoff.loading = false;
        state.goalDebtTradeoff.error = action.payload as string;
      });

    // Apply Goal-Debt Tradeoff
    builder
      .addCase(applyGoalDebtTradeoff.pending, (state) => {
        state.goalDebtTradeoff.loading = true;
        state.goalDebtTradeoff.error = null;
      })
      .addCase(applyGoalDebtTradeoff.fulfilled, (state, action) => {
        state.goalDebtTradeoff.loading = false;
        state.goalDebtTradeoff.applied = true;
        state.goalDebtTradeoff.goalPercent = action.payload.goal_allocation_percent;
        state.goalDebtTradeoff.debtPercent = action.payload.debt_allocation_percent;
        state.completedSteps.push(3);
        state.currentStep = 4;
      })
      .addCase(applyGoalDebtTradeoff.rejected, (state, action) => {
        state.goalDebtTradeoff.loading = false;
        state.goalDebtTradeoff.error = action.payload as string;
      });

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
        state.completedSteps.push(4);
        state.currentStep = 4;
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
        state.goalDebtTradeoff.applied = action.payload.dss_workflow.step3_applied;
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

export const { setCurrentStep, setCustomWeights, clearError } = dssWorkflowSlice.actions;
export default dssWorkflowSlice.reducer;

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { finalizeDSS } from '../dssWorkflowSlice';
import type { FinalizeDSSRequest } from '@/services/api/services/dss-workflow.service';
import { toast } from '@/hooks/use-toast';

interface FinalizeDSSButtonProps {
  monthStr: string;
  monthId: string;
  onComplete?: () => void;
}

export function FinalizeDSSButton({ monthStr, monthId, onComplete }: FinalizeDSSButtonProps) {
  const dispatch = useAppDispatch();
  const { finalize, goalPrioritization, debtStrategy, goalDebtTradeoff, budgetAllocation } = useAppSelector(
    (state) => state.dssWorkflow
  );

  const handleFinalize = async () => {
    // Build request from Redux state (cached preview results)
    const request: FinalizeDSSRequest = {
      use_auto_scoring: false, // User reviewed manually
      
      // Step 1: Goal priorities from preview
      goal_priorities: goalPrioritization.preview?.ranking?.map(g => ({
        goal_id: g.alternative_id,
        priority: g.priority,
        method: 'ahp',
      })) || [],
      
      // Step 2: Debt strategy (if applied)
      debt_strategy: debtStrategy.selectedStrategy || undefined,
      
      // Step 3: Tradeoff (if applied)
      tradeoff_choice: goalDebtTradeoff.goalPercent !== null ? {
        scenario_type: 'balanced', // TODO: Get from user selection
        goal_allocation_pct: goalDebtTradeoff.goalPercent,
        debt_allocation_pct: goalDebtTradeoff.debtPercent || 0,
      } : undefined,
      
      // Step 4: Budget allocations from preview
      budget_allocations: budgetAllocation.preview?.scenarios[0]?.category_allocations.reduce((acc, item) => {
        acc[item.category_id] = item.amount;
        return acc;
      }, {} as Record<string, number>) || {},
      
      goal_fundings: [], // TODO: Extract from preview
      debt_payments: [], // TODO: Extract from preview
      notes: `DSS finalized at ${new Date().toLocaleString()}`,
    };

    try {
      const result = await dispatch(finalizeDSS({ monthStr, data: request })).unwrap();
      
      toast({
        title: "✅ DSS Finalized!",
        description: result.message,
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "❌ Failed to finalize DSS",
        description: error || "Please try again",
      });
    }
  };

  const hasPreviewResults = 
    goalPrioritization.preview !== null &&
    budgetAllocation.preview !== null;

  if (!hasPreviewResults) {
    return null; // Don't show until previews are done
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Finalize DSS Results</CardTitle>
            <CardDescription className="mt-2">
              You've reviewed all optimization results. Click below to apply all changes to your budget.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary of what will be applied */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {goalPrioritization.preview?.ranking?.length || 0} goals prioritized
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {debtStrategy.selectedStrategy ? 'Debt strategy selected' : 'No debts'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {goalDebtTradeoff.goalPercent !== null ? 'Trade-off optimized' : 'Skipped'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {budgetAllocation.preview?.scenarios[0]?.category_allocations.length || 0} categories allocated
              </span>
            </div>
          </div>

          {finalize.error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {finalize.error}
            </div>
          )}

          <Button
            onClick={handleFinalize}
            disabled={finalize.loading}
            size="lg"
            className="w-full text-lg h-14"
          >
            {finalize.loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Finalize & Apply DSS Results
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            This will create a new budget state version with all optimizations applied.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

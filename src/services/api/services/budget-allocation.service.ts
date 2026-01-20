// Budget Allocation Service
import { apiClient } from '../client'
import type { 
  GenerateAllocationRequest, 
  BudgetAllocationModelOutput,
  ExecuteAllocationRequest
} from '../types/budget-allocation'

export const budgetAllocationService = {
  async generateScenarios(data: GenerateAllocationRequest): Promise<BudgetAllocationModelOutput> {
    return apiClient.post<BudgetAllocationModelOutput>('/analytics/budget-allocation/generate', data)
  },

  async executeScenario(data: ExecuteAllocationRequest): Promise<BudgetAllocationModelOutput> {
    return apiClient.post('/analytics/budget-allocation/execute', data)
  },

  async getHistory(year: number, month: number): Promise<BudgetAllocationModelOutput> {
    return apiClient.get<BudgetAllocationModelOutput>(`/analytics/budget-allocation/history/${year}/${month}`)
  }
}

export default budgetAllocationService

import { BudgetDetailPage } from '@/features/budgets/routes/budget-detail-page'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BudgetDetailPage budgetId={id} />
}

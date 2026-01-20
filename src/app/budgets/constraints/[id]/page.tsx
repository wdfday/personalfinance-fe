import { ConstraintDetailPage } from '@/features/budgets/routes/constraint-detail-page'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ConstraintDetailPage constraintId={id} />
}

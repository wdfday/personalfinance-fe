
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function GoalPrioritizationView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Prioritization (AHP)</CardTitle>
        <CardDescription>Prioritize your financial goals using AHP.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 bg-muted/20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Coming Soon: AHP Goal Prioritization Interface</p>
        </div>
      </CardContent>
    </Card>
  )
}

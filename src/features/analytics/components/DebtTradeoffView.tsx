
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function DebtTradeoffView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings vs Debt Tradeoff</CardTitle>
        <CardDescription>Analyze the tradeoff between saving and paying off debt.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 bg-muted/20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Coming Soon: Savings vs Debt Tradeoff Analysis</p>
        </div>
      </CardContent>
    </Card>
  )
}

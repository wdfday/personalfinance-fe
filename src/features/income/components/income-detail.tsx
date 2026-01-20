
import { IncomeProfile } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Wallet, CheckCircle2, AlertCircle, Edit, Trash2, ArrowLeft } from "lucide-react"

interface IncomeDetailProps {
  income: IncomeProfile
  onClose: () => void
  onEdit: (income: IncomeProfile) => void
  onDelete: (id: string) => void
  onVerify: (id: string, verified: boolean) => void
}

export function IncomeDetail({ income, onClose, onEdit, onDelete, onVerify }: IncomeDetailProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-2 mb-4 md:hidden">
          <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
          </Button>
      </div>

      <Card className="border-l-4 border-l-primary/50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{income.source}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                 <Badge variant={income.is_active ? "default" : "secondary"}>
                    {income.status}
                 </Badge>
                 {income.is_recurring && (
                     <Badge variant="outline">Recurring</Badge>
                 )}
                 <span className="text-muted-foreground text-sm ml-2">
                     Updated: {new Date(income.updated_at).toLocaleDateString()}
                 </span>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
                 <Button variant="outline" size="icon" onClick={() => onEdit(income)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(income.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Total Amount</div>
                    <div className="text-xl font-bold text-primary">
                        {formatCurrency(income.total_income, income.currency)}
                    </div>
                     <div className="text-xs text-muted-foreground">{income.frequency}</div>
                </div>
                 <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Base Salary</div>
                    <div className="text-lg font-semibold">
                        {formatCurrency(income.base_salary, income.currency)}
                    </div>
                </div>
                 <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Bonus</div>
                    <div className="text-lg font-semibold">
                        {formatCurrency(income.bonus, income.currency)}
                    </div>
                </div>
                 <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Next Payment</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        {income.start_date ? new Date(income.start_date).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Payment Details
                </h3>
                <div className="border rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Source Type</span>
                        <span className="font-medium capitalize">{income.source}</span>
                    </div>
                     <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Frequency</span>
                        <span className="font-medium capitalize">{income.frequency}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Currency</span>
                        <span className="font-medium">{income.currency}</span>
                    </div>
                     {income.description && (
                        <div className="py-2">
                            <span className="text-muted-foreground block mb-1">Description</span>
                            <p className="bg-muted p-3 rounded text-muted-foreground">
                                {income.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <div className="flex-1 text-sm text-yellow-800 dark:text-yellow-400">
                    {income.is_verified 
                        ? "This income source has been verified as active for the current period." 
                        : "Please verify this income source if you have received the latest payment."}
                </div>
                 <Button 
                    size="sm" 
                    variant={income.is_verified ? "outline" : "default"}
                    onClick={() => onVerify(income.id, !income.is_verified)}
                    className="whitespace-nowrap gap-2"
                 >
                    <CheckCircle2 className={`h-4 w-4 ${income.is_verified ? "text-green-500" : ""}`} />
                    {income.is_verified ? "Verified" : "Verify Receipt"}
                 </Button>
            </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for localized stats or charts specific to this income source */}
      <Card>
          <CardHeader>
              <CardTitle className="text-lg">History & Analytics</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Chart placeholder for income history graph
              </div>
          </CardContent>
      </Card>
    </div>
  )
}

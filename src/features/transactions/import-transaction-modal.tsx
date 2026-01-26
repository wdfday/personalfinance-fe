"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchTransactions } from "@/features/transactions/transactionsSlice"
import { fetchAccounts } from "@/features/accounts/accountsSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileJson, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import { transactionsService } from "@/features/transactions/services/transactions.service"

interface ImportTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportTransactionModal({ isOpen, onClose }: ImportTransactionModalProps) {
  const dispatch = useAppDispatch()
  const { accounts = [] } = useAppSelector((state) => state.accounts)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [importType, setImportType] = useState<"json" | "csv">("json")
  const [accountId, setAccountId] = useState("")
  const [bankCode, setBankCode] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [jsonContent, setJsonContent] = useState("")

  useEffect(() => {
    if (accounts.length === 0) {
      dispatch(fetchAccounts())
    }
  }, [dispatch, accounts.length])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (importType === "json") {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          setJsonContent(content)
        }
        reader.readAsText(selectedFile)
      }
    }
  }

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value)
  }

  const handleSubmit = async () => {
    if (!accountId || !bankCode) {
      toast.error("Vui lòng chọn tài khoản và nhập mã ngân hàng")
      return
    }

    if (importType === "json") {
      if (!jsonContent && !file) {
        toast.error("Vui lòng chọn file JSON hoặc nhập nội dung JSON")
        return
      }

      try {
        setIsSubmitting(true)
        let transactions: unknown[] = []

        if (file) {
          const content = await file.text()
          const parsed = JSON.parse(content)
          // Handle different JSON structures
          if (Array.isArray(parsed)) {
            transactions = parsed
          } else if (parsed.transactions && Array.isArray(parsed.transactions)) {
            transactions = parsed.transactions
          } else if (parsed.data && Array.isArray(parsed.data)) {
            transactions = parsed.data
          } else {
            toast.error("Định dạng JSON không hợp lệ. Vui lòng kiểm tra lại file.")
            return
          }
        } else if (jsonContent) {
          const parsed = JSON.parse(jsonContent)
          if (Array.isArray(parsed)) {
            transactions = parsed
          } else if (parsed.transactions && Array.isArray(parsed.transactions)) {
            transactions = parsed.transactions
          } else if (parsed.data && Array.isArray(parsed.data)) {
            transactions = parsed.data
          } else {
            toast.error("Định dạng JSON không hợp lệ. Vui lòng kiểm tra lại.")
            return
          }
        }

        if (transactions.length === 0) {
          toast.error("Không tìm thấy giao dịch nào trong file JSON")
          return
        }

        const result = await transactionsService.importJSONTransactions({
          accountId,
          bankCode: bankCode.toUpperCase(),
          transactions,
        })

        toast.success(
          `Import thành công! ${result.successCount} giao dịch đã được import, ${result.skippedCount} giao dịch đã tồn tại.`
        )

        // Refresh transactions list
        dispatch(fetchTransactions({}))
        handleClose()
      } catch (error: any) {
        console.error("Import error:", error)
        toast.error("Lỗi import: " + (error.message || "Vui lòng thử lại"))
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // CSV import - TODO: implement CSV parsing
      toast.error("Import CSV đang được phát triển")
    }
  }

  const handleClose = () => {
    setFile(null)
    setJsonContent("")
    setAccountId("")
    setBankCode("")
    setImportType("json")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import giao dịch</DialogTitle>
          <DialogDescription>
            Import giao dịch từ file JSON hoặc CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Import Type */}
          <div className="space-y-2">
            <Label>Loại file</Label>
            <Select value={importType} onValueChange={(value) => setImportType(value as "json" | "csv")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Sắp có)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="accountId">Tài khoản *</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tài khoản" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Code */}
          <div className="space-y-2">
            <Label htmlFor="bankCode">Mã ngân hàng *</Label>
            <Input
              id="bankCode"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              placeholder="VD: TCB, VCB, VPB..."
            />
          </div>

          {/* File Upload */}
          {importType === "json" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="file">Chọn file JSON</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {file && (
                    <span className="text-sm text-muted-foreground">{file.name}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsonContent">Hoặc dán nội dung JSON</Label>
                <Textarea
                  id="jsonContent"
                  value={jsonContent}
                  onChange={handleJsonTextChange}
                  placeholder='[{"id": "...", "bookingDate": "...", ...}]'
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </>
          )}

          {importType === "csv" && (
            <div className="space-y-2">
              <Label htmlFor="csvFile">Chọn file CSV</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Import CSV đang được phát triển
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang import..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

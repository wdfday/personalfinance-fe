'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { goalPrioritizationService } from '@/services/api/services/goal-prioritization.service';
import type { AHPOutput, GoalForRating } from '@/services/api/types/goal-prioritization';
import { profileService } from '@/services/api/services/profile.service';

interface GoalPrioritizationModalProps {
    goals: GoalForRating[];
    userId: string;
}

export function GoalPrioritizationModal({ goals, userId }: GoalPrioritizationModalProps) {
    const [open, setOpen] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(50000000);
    const [ranking, setRanking] = useState<AHPOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set(goals.map(g => g.id)));

    const handlePrioritize = async () => {
        const selectedGoals = goals.filter(g => selectedGoalIds.has(g.id));

        if (selectedGoals.length < 2) {
            setError('Vui lòng chọn ít nhất 2 mục tiêu để phân tích');
            return;
        }

        setLoading(true);
        setError(null);
        setRanking(null);

        try {
            const result = await goalPrioritizationService.prioritizeGoals({
                user_id: userId,
                monthly_income: monthlyIncome,
                goals: selectedGoals
            });

            setRanking(result);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Đã xảy ra lỗi khi phân tích mục tiêu';
            setError(errorMsg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGoalSelection = (goalId: string) => {
        setSelectedGoalIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(goalId)) {
                newSet.delete(goalId);
            } else {
                newSet.add(goalId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedGoalIds.size === goals.length) {
            setSelectedGoalIds(new Set());
        } else {
            setSelectedGoalIds(new Set(goals.map(g => g.id)));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
            case 3: return 'bg-orange-100 text-orange-800 border-orange-300';
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset state when closing
            setRanking(null);
            setError(null);
        } else {
            // Select all goals when opening
            setSelectedGoalIds(new Set(goals.map(g => g.id)));

            // Fetch income from profile
            fetchIncomeFromProfile();
        }
    };

    const fetchIncomeFromProfile = async () => {
        try {
            const profile = await profileService.getProfile();
            if (profile.monthly_income_avg && profile.monthly_income_avg > 0) {
                setMonthlyIncome(profile.monthly_income_avg);
            }
        } catch (err) {
            console.log('Could not fetch income from profile, using default');
            // Keep default value if fetch fails
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Ưu Tiên Mục Tiêu AI
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Phân Tích và Ưu Tiên Mục Tiêu
                    </DialogTitle>
                    <DialogDescription>
                        AI sẽ tự động phân tích và xếp hạng mục tiêu dựa trên tính khẩn cấp, tầm quan trọng, khả thi và tác động tài chính
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Income Input */}
                    <div className="space-y-2">
                        <Label htmlFor="income">Thu nhập hàng tháng (VND)</Label>
                        <Input
                            id="income"
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                            placeholder="50,000,000"
                        />
                        <p className="text-sm text-muted-foreground">
                            💡 Tự động lấy từ hồ sơ thu nhập. Bạn có thể chỉnh sửa nếu cần.
                        </p>
                    </div>

                    {/* Goal Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Chọn mục tiêu để phân tích:</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={toggleSelectAll}
                                className="text-xs"
                            >
                                {selectedGoalIds.size === goals.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                            {goals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                                    onClick={() => toggleGoalSelection(goal.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGoalIds.has(goal.id)}
                                        onChange={() => toggleGoalSelection(goal.id)}
                                        className="h-4 w-4"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{goal.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(goal.target_amount)} • {goal.type}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between p-2 bg-accent rounded text-sm">
                            <span className="text-muted-foreground">Đã chọn:</span>
                            <span className="font-semibold">{selectedGoalIds.size}/{goals.length}</span>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Action Button */}
                    {!ranking && (
                        <Button
                            onClick={handlePrioritize}
                            disabled={loading || selectedGoalIds.size < 2}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang phân tích...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Phân Tích Ngay
                                </>
                            )}
                        </Button>
                    )}

                    {/* Results */}
                    {ranking && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <Trophy className="h-5 w-5" />
                                Phân tích hoàn tất!
                            </div>

                            {/* Ranking List */}
                            <div className="space-y-2">
                                {ranking.ranking.map((item) => {
                                    const goalScores = ranking.local_priorities[item.alternative_id];

                                    return (
                                        <div key={item.alternative_id} className="border rounded-lg">
                                            {/* Header Row */}
                                            <div className="flex items-center gap-3 p-3 hover:bg-accent transition-colors cursor-pointer">
                                                {/* Rank Badge */}
                                                <div
                                                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${getRankBadgeColor(item.rank)}`}
                                                >
                                                    #{item.rank}
                                                </div>

                                                {/* Goal Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold truncate">{item.alternative_name}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Điểm: {item.priority.toFixed(3)} ({(item.priority * 100).toFixed(1)}%)
                                                    </p>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="hidden sm:block w-24">
                                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all"
                                                            style={{ width: `${item.priority * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed Breakdown */}
                                            {goalScores && (
                                                <div className="px-3 pb-3 pt-1 space-y-2 bg-accent/30">
                                                    <p className="text-xs font-medium text-muted-foreground">Chi tiết đánh giá:</p>

                                                    {/* Urgency */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>⚡ Khẩn cấp (Urgency)</span>
                                                            <span className="font-medium">{(goalScores.urgency * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-orange-500 transition-all"
                                                                style={{ width: `${goalScores.urgency * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Importance */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>🔥 Quan trọng (Importance)</span>
                                                            <span className="font-medium">{(goalScores.importance * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-red-500 transition-all"
                                                                style={{ width: `${goalScores.importance * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Feasibility */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>✅ Khả thi (Feasibility)</span>
                                                            <span className="font-medium">{(goalScores.feasibility * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 transition-all"
                                                                style={{ width: `${goalScores.feasibility * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Impact - Temporarily disabled */}
                                                    {/* <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>💰 Tác động (Impact)</span>
                                                            <span className="font-medium">{(goalScores.impact * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 transition-all"
                                                                style={{ width: `${goalScores.impact * 100}%` }}
                                                            />
                                                        </div>
                                                    </div> */}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Criteria Weights */}
                            <div className="mt-6 p-4 bg-accent rounded-lg">
                                <h4 className="font-semibold mb-3">Trọng Số Tiêu Chí</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(ranking.criteria_weights).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="text-sm text-muted-foreground capitalize">{key}</div>
                                            <div className="text-2xl font-bold">{(value * 100).toFixed(0)}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Methodology Explanation */}
                            <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <span>ℹ️</span> Phương pháp tính điểm
                                </h4>
                                <div className="text-xs space-y-1 text-muted-foreground">
                                    <p><strong>⚡ Khẩn cấp:</strong> Dựa vào deadline - càng gần càng cao điểm</p>
                                    <p><strong>🔥 Quan trọng:</strong> Dựa vào loại mục tiêu (khẩn cấp, nợ, hưu trí...)</p>
                                    <p><strong>✅ Khả thi:</strong> Dựa vào thu nhập & số tiền còn thiếu</p>
                                    <p><strong>💰 Tác động:</strong> Dựa vào tổng số tiền mục tiêu</p>
                                </div>
                            </div>

                            {/* Recommendation */}
                            {ranking.ranking.length > 0 && (
                                <Alert>
                                    <TrendingUp className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Khuyến nghị:</strong> Ưu tiên{' '}
                                        <strong>{ranking.ranking[0].alternative_name}</strong> vì có điểm cao nhất
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Re-analyze Button */}
                            <Button
                                onClick={handlePrioritize}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Phân Tích Lại
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

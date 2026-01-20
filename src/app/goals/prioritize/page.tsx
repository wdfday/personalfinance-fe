'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Goal Prioritization Page - Temporarily Disabled
 * 
 * This page requires refactoring to align with the updated AHPOutput types
 * from the goal-prioritization service. The backend API returns different
 * type structure than what the frontend expects.
 * 
 * TODO: Refactor when AHPOutput types are synchronized between backend and frontend
 */
export default function GoalPrioritizationPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        Ưu Tiên Mục Tiêu Tài Chính
                    </CardTitle>
                    <CardDescription>
                        Tính năng đang được nâng cấp
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Chức năng ưu tiên hóa mục tiêu bằng thuật toán AHP đang được cập nhật để cải thiện độ chính xác và trải nghiệm người dùng.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Vui lòng quay lại sau hoặc sử dụng trang Mục Tiêu để quản lý các mục tiêu tài chính của bạn.
                    </p>
                    <Link href="/goals">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại trang Mục Tiêu
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

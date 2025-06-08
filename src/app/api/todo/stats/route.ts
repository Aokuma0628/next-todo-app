import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleApiError, createApiResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { DEFAULT_CATEGORIES } from '@/types/todo-ui';
import type { TodoStats, CategoryStat } from '@/types/todo-ui';

// GET /api/todo/stats - Todo統計情報取得
export async function GET(_request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // 全タスクを取得
    const allTasks = await prisma.task.findMany({
      where: {
        userId: authResult.userId,
      },
      select: {
        id: true,
        completed: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // 基本統計の計算
    const totalCount = allTasks.length;
    const completedCount = allTasks.filter(task => task.completed).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const remainingCount = totalCount - completedCount;

    // 今日作成されたタスクの計算
    const today = new Date();
    const todayTasks = allTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate.toDateString() === today.toDateString();
    });
    const todayCount = todayTasks.length;

    // カテゴリ別統計の計算
    const categoryStats: CategoryStat[] = Object.values(DEFAULT_CATEGORIES)
      .map(category => {
        // カテゴリ名でマッチング（既存のcategoryテーブルとの互換性）
        const categoryTasks = allTasks.filter(task => task.category?.name === category.name);
        const completedTasks = categoryTasks.filter(task => task.completed);
        const total = categoryTasks.length;
        const completed = completedTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          category,
          total,
          completed,
          percentage,
        };
      })
      .filter(stat => stat.total > 0); // タスクがあるカテゴリのみ

    const stats: TodoStats = {
      completionRate,
      completedCount,
      remainingCount,
      todayCount,
      categoryStats,
    };

    return createApiResponse(stats);
  } catch (error) {
    return handleApiError(error, '統計情報の取得に失敗しました');
  }
}

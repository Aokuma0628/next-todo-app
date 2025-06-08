import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleApiError, createApiResponse, parseRequestBody } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { TodoTask } from '@/types/todo-ui';

// Todo更新用のバリデーションスキーマ
const updateTodoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  category: z.string().optional(),
});

// PATCH /api/todo/tasks/[id] - Todo更新
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, updateTodoSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const validatedData = bodyResult.data;
    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    // タスクの存在確認と所有者チェック
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: authResult.userId,
      },
      include: {
        category: true,
      },
    });

    if (!existingTask) {
      return handleApiError(new Error('Task not found'), 'タスクが見つかりません');
    }

    // カテゴリの更新が必要な場合
    let categoryId = existingTask.categoryId;
    if (validatedData.category && validatedData.category !== existingTask.category?.name) {
      let category = await prisma.category.findFirst({
        where: {
          name: validatedData.category,
          userId: authResult.userId,
        },
      });

      if (!category) {
        // デフォルトカテゴリの色を設定
        const defaultColors: Record<string, string> = {
          仕事: '#3b82f6',
          プライベート: '#10b981',
          健康: '#ef4444',
          学習: '#8b5cf6',
          その他: '#6b7280',
        };

        category = await prisma.category.create({
          data: {
            name: validatedData.category,
            color: defaultColors[validatedData.category] || '#6b7280',
            userId: authResult.userId,
          },
        });
      }

      categoryId = category.id;
    }

    // タスク更新
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        completed: validatedData.completed,
        categoryId: categoryId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // UI用の形式に変換
    const todoTask: TodoTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      completed: updatedTask.completed,
      createdAt: updatedTask.createdAt,
      category: updatedTask.category?.name || 'other',
    };

    return createApiResponse<TodoTask>(todoTask);
  } catch (error) {
    return handleApiError(error, 'タスクの更新に失敗しました');
  }
}

// DELETE /api/todo/tasks/[id] - Todo削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    // タスクの存在確認と所有者チェック
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: authResult.userId,
      },
    });

    if (!existingTask) {
      return handleApiError(new Error('Task not found'), 'タスクが見つかりません');
    }

    // タスク削除
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error, 'タスクの削除に失敗しました');
  }
}

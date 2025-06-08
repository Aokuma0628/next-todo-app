import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleApiError, createApiResponse, parseRequestBody } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { TodoTask } from '@/types/todo-ui';

// Todo用のバリデーションスキーマ
const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().optional(),
  category: z.string().min(1, 'カテゴリは必須です'),
});

// GET /api/todo/tasks - Todo一覧取得
export async function GET(_request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // タスク一覧を取得（シンプルTodo用に最適化）
    const tasks = await prisma.task.findMany({
      where: {
        userId: authResult.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { completed: 'asc' }, // 未完了を先に
        { createdAt: 'desc' }, // 新しいものを先に
      ],
    });

    // UI用の形式に変換
    const todoTasks: TodoTask[] = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      createdAt: task.createdAt,
      category: task.category?.name || 'other', // デフォルトは'その他'
    }));

    return createApiResponse(todoTasks);
  } catch (error) {
    return handleApiError(error, 'タスクの取得に失敗しました');
  }
}

// POST /api/todo/tasks - Todo作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, createTodoSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const validatedData = bodyResult.data;

    // カテゴリを名前で検索、なければ作成
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

    // 新しいタスクのポジションを取得
    const lastTask = await prisma.task.findFirst({
      where: { userId: authResult.userId },
      orderBy: { position: 'desc' },
    });

    const newPosition = (lastTask?.position ?? 0) + 1;

    // タスク作成
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        position: newPosition,
        userId: authResult.userId,
        categoryId: category.id,
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
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      createdAt: task.createdAt,
      category: task.category?.name || 'other',
    };

    return createApiResponse<TodoTask>(todoTask, 201);
  } catch (error) {
    return handleApiError(error, 'タスクの作成に失敗しました');
  }
}

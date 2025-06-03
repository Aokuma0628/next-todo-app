import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleApiError, createApiResponse, parseRequestBody } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createTaskSchema, taskQuerySchema } from '@/lib/validations';
import type { Task } from '@/types';
import type { Prisma } from '@prisma/client';

// GET /api/tasks - タスク一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // クエリパラメータの取得と検証
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    let validatedParams;
    try {
      validatedParams = taskQuerySchema.parse(queryParams);
    } catch (error) {
      return handleApiError(error, 'リクエストパラメータが無効です');
    }

    // クエリ条件の構築
    const where: Prisma.TaskWhereInput = {
      userId: authResult.userId,
    };

    if (validatedParams.categoryId) {
      where.categoryId = validatedParams.categoryId;
    }

    if (validatedParams.completed !== undefined) {
      where.completed = validatedParams.completed;
    }

    if (validatedParams.priority) {
      where.priority = validatedParams.priority;
    }

    if (validatedParams.search) {
      where.OR = [
        { title: { contains: validatedParams.search, mode: 'insensitive' } },
        { description: { contains: validatedParams.search, mode: 'insensitive' } },
      ];
    }

    // ソート条件の構築
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [validatedParams.sortBy]: validatedParams.sortOrder,
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        tags: true,
      },
      orderBy,
      take: Number(validatedParams.limit),
      skip: Number(validatedParams.offset),
    });

    const totalCount = await prisma.task.count({ where });

    const responseData = {
      tasks,
      totalCount,
      hasMore: Number(validatedParams.offset) + Number(validatedParams.limit) < totalCount,
    };

    return createApiResponse(responseData);
  } catch (error) {
    return handleApiError(error, 'タスクの取得に失敗しました');
  }
}

// POST /api/tasks - タスク作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, createTaskSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const validatedData = bodyResult.data;

    // カテゴリの存在確認（指定されている場合）
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: authResult.userId,
        },
      });

      if (!category) {
        return handleApiError(
          new Error('Category not found'),
          '指定されたカテゴリが見つかりません',
        );
      }
    }

    // タグの存在確認（指定されている場合）
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      const tagCount = await prisma.tag.count({
        where: {
          id: { in: validatedData.tagIds },
        },
      });

      if (tagCount !== validatedData.tagIds.length) {
        return handleApiError(
          new Error('Some tags not found'),
          '指定されたタグの一部が見つかりません',
        );
      }
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
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        position: newPosition,
        userId: authResult.userId,
        categoryId: validatedData.categoryId,
        tags: validatedData.tagIds
          ? {
              connect: validatedData.tagIds.map(id => ({ id })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return createApiResponse<Task>(task, 201);
  } catch (error) {
    return handleApiError(error, 'タスクの作成に失敗しました');
  }
}

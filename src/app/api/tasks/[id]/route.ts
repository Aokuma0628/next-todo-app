import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  handleApiError,
  createApiResponse,
  createApiErrorResponse,
  parseRequestBody,
  parseUrlParams,
} from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema, idParamSchema } from '@/lib/validations';
import type { Task } from '@/types';

// GET /api/tasks/[id] - 個別タスク取得
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // パラメータの検証
    const paramResult = parseUrlParams(params, idParamSchema);
    if (!paramResult.success) {
      return paramResult.response;
    }

    const { id } = paramResult.data;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!task) {
      return createApiErrorResponse('タスクが見つかりません', 404);
    }

    return createApiResponse<Task>(task);
  } catch (error) {
    return handleApiError(error, 'タスクの取得に失敗しました');
  }
}

// PUT /api/tasks/[id] - タスク更新
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // パラメータの検証
    const paramResult = parseUrlParams(params, idParamSchema);
    if (!paramResult.success) {
      return paramResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, updateTaskSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { id } = paramResult.data;
    const validatedData = bodyResult.data;

    // タスクの存在確認と所有者チェック
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
    });

    if (!existingTask) {
      return createApiErrorResponse('タスクが見つかりません', 404);
    }

    // カテゴリの存在確認（指定されている場合）
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: authResult.userId,
        },
      });

      if (!category) {
        return createApiErrorResponse('指定されたカテゴリが見つかりません', 404);
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
        return createApiErrorResponse('指定されたタグの一部が見つかりません', 404);
      }
    }

    // タスク更新データの構築
    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.completed !== undefined) updateData.completed = validatedData.completed;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }
    if (validatedData.position !== undefined) updateData.position = validatedData.position;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId;

    // タグの更新処理
    if (validatedData.tagIds !== undefined) {
      updateData.tags = {
        set: validatedData.tagIds.map(id => ({ id })),
      };
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true,
      },
    });

    return createApiResponse<Task>(task);
  } catch (error) {
    return handleApiError(error, 'タスクの更新に失敗しました');
  }
}

// DELETE /api/tasks/[id] - タスク削除
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // パラメータの検証
    const paramResult = parseUrlParams(params, idParamSchema);
    if (!paramResult.success) {
      return paramResult.response;
    }

    const { id } = paramResult.data;

    // タスクの存在確認と所有者チェック
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
    });

    if (!existingTask) {
      return createApiErrorResponse('タスクが見つかりません', 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return createApiResponse({ id });
  } catch (error) {
    return handleApiError(error, 'タスクの削除に失敗しました');
  }
}

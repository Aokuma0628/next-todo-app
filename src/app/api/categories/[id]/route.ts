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
import { updateCategorySchema, idParamSchema } from '@/lib/validations';
import type { Category } from '@/types';

// GET /api/categories/[id] - 個別カテゴリ取得
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // パラメータの検証
    const resolvedParams = await params;
    const paramResult = parseUrlParams(resolvedParams, idParamSchema);
    if (!paramResult.success) {
      return paramResult.response;
    }

    const { id } = paramResult.data;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
      include: {
        tasks: {
          include: {
            category: true,
            tags: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!category) {
      return createApiErrorResponse('カテゴリが見つかりません', 404);
    }

    return createApiResponse<Category>(category);
  } catch (error) {
    return handleApiError(error, 'カテゴリの取得に失敗しました');
  }
}

// PUT /api/categories/[id] - カテゴリ更新
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // パラメータの検証
    const resolvedParams = await params;
    const paramResult = parseUrlParams(resolvedParams, idParamSchema);
    if (!paramResult.success) {
      return paramResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, updateCategorySchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { id } = paramResult.data;
    const validatedData = bodyResult.data;

    // カテゴリの存在確認と所有者チェック
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
    });

    if (!existingCategory) {
      return createApiErrorResponse('カテゴリが見つかりません', 404);
    }

    // 名前の重複チェック（名前が変更される場合）
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: validatedData.name,
          userId: authResult.userId,
          NOT: { id },
        },
      });

      if (duplicateCategory) {
        return createApiErrorResponse('同名のカテゴリが既に存在します', 409);
      }
    }

    // カテゴリ更新データの構築
    const updateData: Record<string, unknown> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return createApiResponse<Category>(category);
  } catch (error) {
    return handleApiError(error, 'カテゴリの更新に失敗しました');
  }
}

// DELETE /api/categories/[id] - カテゴリ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // パラメータの検証
    const resolvedParams = await params;
    const paramResult = parseUrlParams(resolvedParams, idParamSchema);
    if (!paramResult.success) {
      return paramResult.response;
    }

    const { id } = paramResult.data;

    // カテゴリの存在確認と所有者チェック
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: authResult.userId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return createApiErrorResponse('カテゴリが見つかりません', 404);
    }

    // カテゴリに関連するタスクがある場合は削除を拒否
    if (existingCategory._count.tasks > 0) {
      return createApiErrorResponse(
        'このカテゴリには関連するタスクがあるため削除できません。先にタスクを削除するか、別のカテゴリに移動してください。',
        409,
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return createApiResponse({ id });
  } catch (error) {
    return handleApiError(error, 'カテゴリの削除に失敗しました');
  }
}

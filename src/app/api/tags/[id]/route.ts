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
import { updateTagSchema, idParamSchema } from '@/lib/validations';
import type { Tag } from '@/types';

// GET /api/tags/[id] - 個別タグ取得
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

    const tag = await prisma.tag.findUnique({
      where: {
        id,
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

    if (!tag) {
      return createApiErrorResponse('タグが見つかりません', 404);
    }

    return createApiResponse<Tag>(tag);
  } catch (error) {
    return handleApiError(error, 'タグの取得に失敗しました');
  }
}

// PUT /api/tags/[id] - タグ更新
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
    const bodyResult = await parseRequestBody(request, updateTagSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const { id } = paramResult.data;
    const validatedData = bodyResult.data;

    // タグの存在確認
    const existingTag = await prisma.tag.findUnique({
      where: {
        id,
      },
    });

    if (!existingTag) {
      return createApiErrorResponse('タグが見つかりません', 404);
    }

    // 名前の重複チェック（名前が変更される場合）
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          name: validatedData.name,
          NOT: { id },
        },
      });

      if (duplicateTag) {
        return createApiErrorResponse('同名のタグが既に存在します', 409);
      }
    }

    // タグ更新データの構築
    const updateData: Record<string, unknown> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;

    const tag = await prisma.tag.update({
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

    return createApiResponse<Tag>(tag);
  } catch (error) {
    return handleApiError(error, 'タグの更新に失敗しました');
  }
}

// DELETE /api/tags/[id] - タグ削除
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

    // タグの存在確認
    const existingTag = await prisma.tag.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!existingTag) {
      return createApiErrorResponse('タグが見つかりません', 404);
    }

    // タグに関連するタスクがある場合でも削除を許可（多対多の関係なので、タグを削除してもタスクは残る）
    await prisma.tag.delete({
      where: { id },
    });

    return createApiResponse({ id });
  } catch (error) {
    return handleApiError(error, 'タグの削除に失敗しました');
  }
}

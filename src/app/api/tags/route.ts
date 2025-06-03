import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleApiError, createApiResponse, parseRequestBody } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createTagSchema } from '@/lib/validations';
import type { Tag } from '@/types';

// GET /api/tags - タグ一覧取得
export async function GET(_request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return createApiResponse(tags);
  } catch (error) {
    return handleApiError(error, 'タグの取得に失敗しました');
  }
}

// POST /api/tags - タグ作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, createTagSchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const validatedData = bodyResult.data;

    // 同名のタグが既に存在するかチェック
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: validatedData.name,
      },
    });

    if (existingTag) {
      return handleApiError(new Error('Tag already exists'), '同名のタグが既に存在します');
    }

    // タグ作成
    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return createApiResponse<Tag>(tag, 201);
  } catch (error) {
    return handleApiError(error, 'タグの作成に失敗しました');
  }
}

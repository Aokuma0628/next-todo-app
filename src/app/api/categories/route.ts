import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleApiError, createApiResponse, parseRequestBody } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { createCategorySchema } from '@/lib/validations';
import type { Category } from '@/types';

// GET /api/categories - カテゴリ一覧取得
export async function GET(_request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: authResult.userId,
      },
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

    return createApiResponse(categories);
  } catch (error) {
    return handleApiError(error, 'カテゴリの取得に失敗しました');
  }
}

// POST /api/categories - カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // リクエストボディの解析
    const bodyResult = await parseRequestBody(request, createCategorySchema);
    if (!bodyResult.success) {
      return bodyResult.response;
    }

    const validatedData = bodyResult.data;

    // 同名のカテゴリが既に存在するかチェック
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        userId: authResult.userId,
      },
    });

    if (existingCategory) {
      return handleApiError(new Error('Category already exists'), '同名のカテゴリが既に存在します');
    }

    // カテゴリ作成
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
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

    return createApiResponse<Category>(category, 201);
  } catch (error) {
    return handleApiError(error, 'カテゴリの作成に失敗しました');
  }
}

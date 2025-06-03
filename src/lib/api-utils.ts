import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResponse } from '@/types';

/**
 * APIエラーハンドリング用のヘルパー関数
 */
export function handleApiError(error: unknown, defaultMessage: string): NextResponse {
  console.error('API エラー:', error);

  // Zodバリデーションエラー
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'リクエストデータが無効です',
        details: error.errors,
      } as ApiResponse,
      { status: 400 },
    );
  }

  // Prismaエラー
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;

    // 一意制約違反
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ success: false, error: '既に存在するデータです' } as ApiResponse, {
        status: 409,
      });
    }

    // レコードが見つからない
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'データが見つかりません' } as ApiResponse, {
        status: 404,
      });
    }

    // 外部キー制約違反
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: '関連するデータが見つかりません' } as ApiResponse,
        { status: 400 },
      );
    }
  }

  // デフォルトエラー
  return NextResponse.json({ success: false, error: defaultMessage } as ApiResponse, {
    status: 500,
  });
}

/**
 * 成功レスポンス作成用のヘルパー関数
 */
export function createApiResponse<T = any>(data?: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    { status },
  );
}

/**
 * エラーレスポンス作成用のヘルパー関数
 */
export function createApiErrorResponse(
  error: string,
  status: number = 400,
  details?: any,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    } as ApiResponse,
    { status },
  );
}

/**
 * ページネーション用のヘルパー関数
 */
export function createPaginationResponse<T>(
  items: T[],
  totalCount: number,
  page: number,
  limit: number,
) {
  return {
    items,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  };
}

/**
 * リクエストボディのパース用ヘルパー関数
 */
export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: createApiErrorResponse('リクエストデータが無効です', 400, error.errors),
      };
    }

    return {
      success: false,
      response: createApiErrorResponse('リクエストの解析に失敗しました', 400),
    };
  }
}

/**
 * URLパラメータのパース用ヘルパー関数
 */
export function parseUrlParams<T>(
  params: Record<string, string>,
  schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: createApiErrorResponse('URLパラメータが無効です', 400, error.errors),
      };
    }

    return {
      success: false,
      response: createApiErrorResponse('パラメータの解析に失敗しました', 400),
    };
  }
}

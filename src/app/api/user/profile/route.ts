import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, User } from '@/types';

export async function GET(_request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    // ユーザー詳細情報を取得
    const user = await prisma.user.findUnique({
      where: {
        id: authResult.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザーが見つかりません',
        } as ApiResponse,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    } as ApiResponse<User>);
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ユーザープロフィールの取得に失敗しました',
      } as ApiResponse,
      { status: 500 },
    );
  }
}

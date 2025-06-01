import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTaskSchema, taskQuerySchema } from '@/lib/validations';
import { z } from 'zod';
import type { ApiResponse, Task } from '@/types';

// GET /api/tasks - タスク一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '認証が必要です' } as ApiResponse, {
        status: 401,
      });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedParams = taskQuerySchema.parse(queryParams);

    // クエリ条件の構築
    const where: any = {
      userId: session.user.id,
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
    const orderBy: any = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

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

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        totalCount,
        hasMore: Number(validatedParams.offset) + Number(validatedParams.limit) < totalCount,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('タスク取得エラー:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'リクエストパラメータが無効です',
          details: error.errors,
        } as ApiResponse,
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'タスクの取得に失敗しました' } as ApiResponse,
      { status: 500 },
    );
  }
}

// POST /api/tasks - タスク作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '認証が必要です' } as ApiResponse, {
        status: 401,
      });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // カテゴリの存在確認（指定されている場合）
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: '指定されたカテゴリが見つかりません' } as ApiResponse,
          { status: 404 },
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
        return NextResponse.json(
          { success: false, error: '指定されたタグの一部が見つかりません' } as ApiResponse,
          { status: 404 },
        );
      }
    }

    // 新しいタスクのポジションを取得
    const lastTask = await prisma.task.findFirst({
      where: { userId: session.user.id },
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
        userId: session.user.id,
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

    return NextResponse.json({ success: true, data: task } as ApiResponse<Task>, { status: 201 });
  } catch (error) {
    console.error('タスク作成エラー:', error);

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

    return NextResponse.json(
      { success: false, error: 'タスクの作成に失敗しました' } as ApiResponse,
      { status: 500 },
    );
  }
}

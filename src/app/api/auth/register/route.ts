import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// 登録スキーマ
const registerSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上である必要があります"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 入力値の検証
    const { name, email, password } = registerSchema.parse(body)

    // 既存ユーザーの確認
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { message: "ユーザーが正常に作成されました", user },
      { status: 201 }
    )

  } catch (error) {
    console.error("登録エラー:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力値が無効です", details: error.errors },
        { status: 400 }
      )
    }

    // Prismaエラーの詳細ログ
    if (error instanceof Error) {
      console.error("エラー詳細:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json(
      { error: "内部サーバーエラーが発生しました", details: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 }
    )
  }
}
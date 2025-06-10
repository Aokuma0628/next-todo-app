import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { ApiResponse } from '@/types';

// ログインスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // 入力値の検証
          const { email, password } = loginSchema.parse(credentials);

          // ユーザーを検索
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          // パスワードの検証
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('認証エラー:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

/**
 * API認証チェック用のヘルパー関数
 * @returns 認証されたユーザーIDまたはエラーレスポンス
 */
export async function requireAuth(): Promise<
  { success: true; userId: string } | { success: false; response: NextResponse }
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        response: NextResponse.json({ success: false, error: '認証が必要です' } as ApiResponse, {
          status: 401,
        }),
      };
    }

    return {
      success: true,
      userId: session.user.id,
    };
  } catch (error) {
    console.error('認証エラー:', error);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: '認証処理でエラーが発生しました' } as ApiResponse,
        { status: 500 },
      ),
    };
  }
}

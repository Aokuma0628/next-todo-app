import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  // 既にログインしている場合はTodoページにリダイレクト
  if (session?.user) {
    redirect('/todo');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Next Todo App</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            効率的なタスク管理のためのシンプルで使いやすいTodoアプリケーション
          </p>
        </header>

        {/* 機能紹介 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>タスク管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                タスクの作成、編集、削除を簡単に行えます。
                優先度や期限を設定して効率的に管理できます。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔐</span>
                <span>セキュア認証</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                NextAuth.jsを使用した安全な認証システムで、 あなたのデータを保護します。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📱</span>
                <span>レスポンシブ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                デスクトップ、タブレット、スマートフォンなど、 どのデバイスでも快適に使用できます。
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA セクション */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>今すぐ始めましょう</CardTitle>
              <CardDescription>アカウントを作成してタスク管理を始めましょう</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth/signup">新規登録</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/auth/signin">ログイン</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 技術スタック */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">技術スタック</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full border">Next.js 15</span>
            <span className="bg-white px-3 py-1 rounded-full border">TypeScript</span>
            <span className="bg-white px-3 py-1 rounded-full border">NextAuth.js</span>
            <span className="bg-white px-3 py-1 rounded-full border">Prisma</span>
            <span className="bg-white px-3 py-1 rounded-full border">PostgreSQL</span>
            <span className="bg-white px-3 py-1 rounded-full border">Tailwind CSS</span>
            <span className="bg-white px-3 py-1 rounded-full border">Shadcn/UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

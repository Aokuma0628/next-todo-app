import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserMenu } from "@/components/auth/user-menu"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ダッシュボード
              </h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                ようこそ、{session.user.name}さん！
              </h2>
              <p className="text-gray-600">
                認証が正常に動作しています。
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      認証システムが正常に設定されました！
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>ユーザーID: {session.user.id}</p>
                <p>メールアドレス: {session.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
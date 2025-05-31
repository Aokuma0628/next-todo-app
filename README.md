# Next.js Todo アプリケーション

このプロジェクトは、Next.js 15を使用したモダンなTodoアプリケーションです。TypeScriptで実装され、Prisma ORM、NextAuth.js認証、TailwindCSSスタイリングなど、Web開発技術スタックを活用しています。

## 技術スタック

- **フロントエンド**:

  - Next.js 15.3.2
  - React 19.0.0
  - TypeScript 5.x
  - TailwindCSS 4.x
  - shadcn/ui コンポーネント
  - Lucide アイコン

- **バックエンド**:

  - Next.js API Routes
  - Prisma ORM 6.8.2
  - PostgreSQL データベース

- **認証**:

  - NextAuth.js 5.0.0-beta.28

- **データ管理**:

  - TanStack React Query 5.76.1
  - React Hook Form 7.56.4
  - Zod バリデーション 3.24.4

- **コード品質管理**:
  - ESLint 9.x (TypeScript対応)
  - Prettier 3.5.3 (コードフォーマッター)
  - Husky (Git hooks)
  - lint-staged (ステージングファイルのlint)

## 必要条件

- Node.js 20.18.1以上
- PostgreSQLデータベース

### 開発サーバーの起動

開発サーバーを起動します:

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認します。

`src/app/page.tsx` を編集することでページの編集を開始できます。ファイルを編集すると、ページは自動的に更新されます。

## 機能

このTodoアプリケーションは現在開発中で、以下の機能を実装予定です:

- ユーザー認証（サインアップ、ログイン、ログアウト）
- Todoタスクの作成、読み取り、更新、削除（CRUD操作）
- タスクのカテゴリ分け
- 期限日の設定と通知
- タスクの優先順位付け
- タスクの検索とフィルタリング
- レスポンシブデザイン

## プロジェクト構造

```
next-todo-app/
├── prisma/              # Prismaスキーマとマイグレーション
├── public/              # 静的アセット
├── src/
│   ├── app/             # Next.jsアプリケーションルーター
│   ├── components/      # UIコンポーネント
│   ├── hooks/           # カスタムReactフック
│   ├── lib/             # ユーティリティ関数
│   └── types/           # TypeScript型定義
├── .env.local           # 環境変数
├── .nvmrc               # Node.jsバージョン
├── components.json      # shadcn/ui設定
├── .github/workflows/   # GitHub Actions CI/CD
├── .husky/              # Git hooks設定
└── ...                  # その他の設定ファイル
```

## 開発ワークフロー

### コード品質管理

このプロジェクトでは、コード品質を保つために以下のツールを使用しています：

#### ESLint & Prettier

```bash
# コードの品質チェック
npm run lint

# 自動修正
npm run lint:fix

# コードフォーマット
npm run format

# フォーマットチェック
npm run format:check
```

#### Pre-commit Hooks

コミット前に自動的にlintとformatが実行されます：

- ステージングされたファイルのみを対象
- ESLintによる自動修正
- Prettierによる自動フォーマット

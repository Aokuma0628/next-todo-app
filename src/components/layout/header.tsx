'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Plus, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenu } from '@/components/auth/user-menu';

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title = 'Todo App' }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* モバイルメニューボタン */}
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>

        {/* ロゴ・タイトル */}
        <div className="mr-4 flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <span className="hidden font-bold sm:inline-block">{title}</span>
          </Link>
        </div>

        {/* 中央の検索エリア（将来的に実装） */}
        <div className="flex flex-1 items-center justify-center px-4">
          {/* 検索機能は将来的に実装 */}
        </div>

        {/* 右側のアクション */}
        <div className="flex items-center space-x-2">
          {/* 新規作成ボタン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">新規作成</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>新規作成</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                新しいタスク
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                新しいカテゴリ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 通知ボタン */}
          <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {/* 通知バッジ（将来的に実装） */}
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive"></span>
                <span className="sr-only">通知</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>通知</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-sm text-muted-foreground">新しい通知はありません</div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 設定ボタン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">設定</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>設定</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                アプリ設定
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                テーマ設定
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ユーザーメニュー */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

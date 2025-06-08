'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User as UserType } from '@/types';

// ユーザープロフィール取得関数
async function fetchUserProfile(): Promise<UserType> {
  const response = await fetch('/api/user/profile');
  if (!response.ok) throw new Error('Failed to fetch user profile');
  const result = await response.json();
  return result.data;
}

export function UserProfileMenu() {
  const { data: session } = useSession();

  // ユーザー詳細情報を取得
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    enabled: !!session?.user,
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (!session?.user) {
    return null;
  }

  // ユーザー名の頭文字を取得（アバター用）
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    return initials.slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 p-2 rounded-md transition-all duration-300 text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
            <AvatarFallback className="text-xs bg-stone-100 text-stone-700 dark:bg-slate-700 dark:text-slate-300">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 bg-white/95 backdrop-blur-md border-stone-200/60 dark:bg-slate-800/95 dark:border-slate-700/50"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback className="text-sm bg-stone-100 text-stone-700 dark:bg-slate-700 dark:text-slate-300">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 dark:text-slate-100 truncate">
                {session.user.name || 'ユーザー'}
              </p>
              <p className="text-sm text-stone-500 dark:text-slate-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-stone-200/60 dark:bg-slate-700/50" />

        {/* メール情報 */}
        <DropdownMenuItem className="cursor-default focus:bg-transparent focus:text-inherit">
          <div className="flex items-center gap-3 w-full">
            <Mail className="h-4 w-4 text-stone-500 dark:text-slate-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 dark:text-slate-300">メール</p>
              <p className="text-xs text-stone-500 dark:text-slate-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </DropdownMenuItem>

        {/* 登録日情報 */}
        {userProfile?.createdAt && (
          <DropdownMenuItem className="cursor-default focus:bg-transparent focus:text-inherit">
            <div className="flex items-center gap-3 w-full">
              <Calendar className="h-4 w-4 text-stone-500 dark:text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-700 dark:text-slate-300">登録日</p>
                <p className="text-xs text-stone-500 dark:text-slate-400">
                  {new Date(userProfile.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-stone-200/60 dark:bg-slate-700/50" />

        {/* ログアウト */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-3" />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

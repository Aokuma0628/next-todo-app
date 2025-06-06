'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  Calendar,
  Archive,
  Trash2,
  Tag,
  Folder,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

// サンプルデータ（将来的にAPIから取得）
const navigationItems: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/dashboard/today', label: '今日のタスク', icon: CheckSquare, count: 5 },
  { href: '/dashboard/upcoming', label: '予定', icon: Calendar, count: 12 },
  { href: '/dashboard/completed', label: '完了済み', icon: Archive, count: 23 },
  { href: '/dashboard/trash', label: 'ゴミ箱', icon: Trash2, count: 3 },
];

const sampleCategories = [
  { id: '1', name: '仕事', color: '#3b82f6', count: 8 },
  { id: '2', name: '個人', color: '#10b981', count: 4 },
  { id: '3', name: '学習', color: '#f59e0b', count: 6 },
];

const sampleTags = [
  { id: '1', name: '緊急', count: 3 },
  { id: '2', name: '重要', count: 5 },
  { id: '3', name: '後回し', count: 2 },
];

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r bg-background transition-all duration-300',
        !isOpen && 'w-0 overflow-hidden md:w-16',
        className,
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-2 p-4">
          {/* メインナビゲーション */}
          <div className="space-y-1">
            {navigationItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start', !isOpen && 'md:justify-center md:px-2')}
                  >
                    <item.icon className={cn('h-4 w-4', isOpen && 'mr-2')} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.count !== undefined && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* カテゴリセクション */}
          {isOpen && (
            <>
              <div className="pt-4">
                <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2">
                      {categoriesOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      <Folder className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">カテゴリ</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={e => {
                          e.stopPropagation();
                          // カテゴリ追加モーダルを開く
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {sampleCategories.map(category => (
                      <Link key={category.id} href={`/dashboard?category=${category.id}`}>
                        <Button variant="ghost" className="w-full justify-start pl-8">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="flex-1 text-left">{category.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {category.count}
                          </Badge>
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* タグセクション */}
              <div className="pt-2">
                <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2">
                      {tagsOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      <Tag className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">タグ</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={e => {
                          e.stopPropagation();
                          // タグ追加モーダルを開く
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {sampleTags.map(tag => (
                      <Link key={tag.id} href={`/dashboard?tag=${tag.id}`}>
                        <Button variant="ghost" className="w-full justify-start pl-8">
                          <Tag className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span className="flex-1 text-left">{tag.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {tag.count}
                          </Badge>
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* フッター（将来的にストレージ使用量など） */}
      {isOpen && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>タスク合計</span>
              <span>42</span>
            </div>
            <div className="flex justify-between">
              <span>今週完了</span>
              <span>15</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

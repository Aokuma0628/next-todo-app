'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckSquare,
  Moon,
  Sun,
  Target,
  Calendar,
  FolderOpen,
  Plus,
  Circle,
  CheckCircle2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserProfileMenu } from '@/components/auth/user-profile-menu';
import { DEFAULT_CATEGORIES } from '@/types/todo-ui';
import type { TodoTask, TodoStats, CreateTodoForm } from '@/types/todo-ui';

// フォームバリデーションスキーマ
const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().optional(),
  category: z.string().min(1, 'カテゴリは必須です'),
});

type CreateTodoFormData = z.infer<typeof createTodoSchema>;

// API関数
async function fetchTasks(): Promise<TodoTask[]> {
  const response = await fetch('/api/todo/tasks');
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const result = await response.json();
  return result.data;
}

async function fetchStats(): Promise<TodoStats> {
  const response = await fetch('/api/todo/stats');
  if (!response.ok) throw new Error('Failed to fetch stats');
  const result = await response.json();
  return result.data;
}

async function createTask(data: CreateTodoForm): Promise<TodoTask> {
  const response = await fetch('/api/todo/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create task');
  const result = await response.json();
  return result.data;
}

async function updateTask(id: string, data: Partial<TodoTask>): Promise<TodoTask> {
  const response = await fetch(`/api/todo/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update task');
  const result = await response.json();
  return result.data;
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/todo/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
}

export default function TodoPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // React Query
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['todo-tasks'],
    queryFn: fetchTasks,
  });

  const { data: stats } = useQuery({
    queryKey: ['todo-stats'],
    queryFn: fetchStats,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['todo-stats'] });
      reset();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoTask> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['todo-stats'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['todo-stats'] });
    },
  });

  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTodoFormData>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      category: 'work',
    },
  });

  const watchedTitle = watch('title');

  const onSubmit = (data: CreateTodoFormData) => {
    createTaskMutation.mutate({
      title: data.title,
      description: data.description || undefined,
      category: DEFAULT_CATEGORIES[data.category]?.name || 'その他',
    });
  };

  const toggleTask = (task: TodoTask) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { completed: !task.completed },
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  // テーマ切り替え
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // カテゴリ選択
  const handleCategoryChange = (value: string) => {
    setValue('category', value);
  };

  // 今日のタスク数を計算
  const todayTasksCount = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  }).length;

  // プログレスメッセージ
  const getProgressMessage = () => {
    if (!stats) return 'タスクを追加して進捗を確認しましょう';
    if (
      stats.completedCount === stats.completedCount + stats.remainingCount &&
      stats.completedCount > 0
    ) {
      return '🎉 素晴らしい！すべてのタスクが完了しました！';
    }
    return `あと${stats.remainingCount}個のタスクで今日の目標達成です`;
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-gradient-to-br from-gray-50 via-stone-50 to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900">
      {/* ヘッダー */}
      <header className="backdrop-blur-md border-b transition-all duration-300 bg-white/80 border-stone-200/60 dark:bg-slate-900/60 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-stone-100 border border-stone-200 dark:bg-slate-700 dark:border-slate-600">
                <CheckSquare className="h-5 w-5 text-stone-700 dark:text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold transition-colors duration-300 text-stone-800 dark:text-slate-100">
                  Todo
                </h1>
                <p className="text-sm transition-colors duration-300 text-stone-500 dark:text-slate-400">
                  シンプルなタスク管理
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-md transition-all duration-300 text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 統計情報 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 完了率カード */}
            <Card className="transition-all duration-300 hover:shadow-md bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200/40 dark:bg-emerald-900/30 dark:border-emerald-800/30">
                    <Target className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-semibold dark:text-slate-100">
                      {stats?.completionRate ?? 0}%
                    </div>
                    <p className="text-sm text-stone-500 dark:text-slate-400">完了率</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-xl font-medium text-emerald-600 dark:text-emerald-300">
                        {stats?.completedCount ?? 0}
                      </div>
                      <p className="text-xs text-stone-400 dark:text-slate-500">完了済み</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-medium text-stone-600 dark:text-slate-300">
                        {stats?.remainingCount ?? 0}
                      </div>
                      <p className="text-xs text-stone-400 dark:text-slate-500">残りタスク</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 今日のタスクカード */}
            <Card className="transition-all duration-300 hover:shadow-md bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-stone-500 dark:text-slate-400" />
                  <h3 className="font-medium dark:text-slate-100">今日のタスク</h3>
                </div>
                <div className="text-2xl font-semibold mb-2 dark:text-slate-100">
                  {todayTasksCount}
                </div>
                <p className="text-sm text-stone-500 dark:text-slate-400">今日作成されたタスク</p>
              </CardContent>
            </Card>

            {/* カテゴリ別統計 */}
            <Card className="transition-all duration-300 hover:shadow-md bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FolderOpen className="h-5 w-5 text-stone-500 dark:text-slate-400" />
                  <h3 className="font-medium dark:text-slate-100">カテゴリ別</h3>
                </div>
                <div className="space-y-3">
                  {stats?.categoryStats.length ? (
                    stats.categoryStats.map(({ category, total, completed, percentage }) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.emoji}</span>
                          <span className="text-sm font-medium dark:text-slate-100">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium dark:text-slate-100">
                            {completed}/{total}
                          </div>
                          <div className="text-xs text-stone-400 dark:text-slate-500">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-400 dark:text-slate-500">
                      カテゴリ別の統計はタスクを追加すると表示されます
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* タスク管理エリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* タスク作成フォーム */}
            <Card className="transition-all duration-300 hover:shadow-md bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader className="p-6 border-b border-stone-200/60 dark:border-slate-700/50">
                <h2 className="flex items-center gap-3 text-lg text-stone-800 dark:text-slate-100">
                  <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 dark:bg-slate-700 dark:border-slate-600">
                    <Plus className="h-4 w-4 text-stone-600 dark:text-slate-300" />
                  </div>
                  新しいタスクを作成
                </h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      {...register('title')}
                      placeholder="何に取り組みますか？"
                      className="w-full px-3 py-2 text-base transition-all duration-300 bg-stone-50/50 border-stone-300 focus:border-stone-400 dark:bg-slate-900/50 dark:border-slate-600 dark:focus:border-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Select defaultValue="work" onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-full px-3 py-2 transition-all duration-300 bg-stone-50/50 border-stone-300 focus:border-stone-400 dark:bg-slate-900/50 dark:border-slate-600 dark:focus:border-slate-400 dark:text-slate-100">
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DEFAULT_CATEGORIES).map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.emoji} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Textarea
                      {...register('description')}
                      placeholder="詳細や注意事項があれば..."
                      rows={3}
                      className="w-full px-3 py-2 resize-none transition-all duration-300 bg-stone-50/50 border-stone-300 focus:border-stone-400 dark:bg-slate-900/50 dark:border-slate-600 dark:focus:border-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!watchedTitle?.trim() || createTaskMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 transition-all duration-300 bg-stone-700 hover:bg-stone-600 text-white disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600 dark:border dark:border-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                    {createTaskMutation.isPending ? '追加中...' : 'タスクを追加'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* タスク一覧 */}
            <div className="space-y-3">
              {tasksLoading ? (
                <Card className="transition-all duration-300 bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
                  <CardContent className="py-16 text-center">
                    <p className="text-lg font-medium text-stone-600 dark:text-slate-300">
                      読み込み中...
                    </p>
                  </CardContent>
                </Card>
              ) : tasks.length === 0 ? (
                <Card className="transition-all duration-300 bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
                  <CardContent className="py-16 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 bg-stone-100 border border-stone-200 dark:bg-slate-700 dark:border-slate-600">
                      <Circle className="h-7 w-7 text-stone-400 dark:text-slate-500" />
                    </div>
                    <p className="text-lg font-medium mb-2 text-stone-600 dark:text-slate-300">
                      まだタスクがありません
                    </p>
                    <p className="text-sm text-stone-400 dark:text-slate-500">
                      上のフォームから新しいタスクを追加してスタートしましょう
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tasks.map(task => {
                  const category =
                    Object.values(DEFAULT_CATEGORIES).find(cat => cat.name === task.category) ||
                    DEFAULT_CATEGORIES.other;

                  return (
                    <Card
                      key={task.id}
                      className={`transition-all duration-300 hover:shadow-md rounded-lg ${
                        task.completed
                          ? 'bg-emerald-50/60 border-emerald-200/40 dark:bg-slate-800/30 dark:border-slate-700/30'
                          : 'bg-white/90 border-stone-200/60 shadow-sm dark:bg-slate-800/50 dark:border-slate-700/50'
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTask(task)}
                            className="mt-1 transition-all duration-200 hover:scale-105 p-0 h-auto"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            )}
                          </Button>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-lg transition-all duration-200 ${
                                task.completed
                                  ? 'text-stone-400 line-through dark:text-slate-500'
                                  : 'text-stone-800 dark:text-slate-100'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p
                                className={`text-sm mt-2 transition-all duration-200 ${
                                  task.completed
                                    ? 'text-stone-400 line-through dark:text-slate-600'
                                    : 'text-stone-600 dark:text-slate-400'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <span
                                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md border ${
                                  theme === 'dark' ? category.color.dark : category.color.light
                                }`}
                              >
                                {category.emoji} {category.name}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-md border bg-stone-100 text-stone-500 border-stone-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/50">
                                {new Date(task.createdAt).toLocaleDateString('ja-JP', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {task.completed && (
                                <span className="text-xs px-2 py-1 rounded-md border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30">
                                  完了
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* フッター統計 */}
            {tasks.length > 0 && (
              <Card className="transition-all duration-300 bg-white/90 border-stone-200/60 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-stone-500 dark:text-slate-400" />
                    <h3 className="font-medium text-stone-800 dark:text-slate-100">今日の進捗</h3>
                  </div>
                  <p className="text-base text-stone-600 dark:text-slate-300">
                    {getProgressMessage()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

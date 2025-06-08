// Todo UI用の型定義

export interface TodoCategory {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  color: {
    light: string;
    dark: string;
  };
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  category: string;
}

export interface TodoStats {
  completionRate: number;
  completedCount: number;
  remainingCount: number;
  todayCount: number;
  categoryStats: CategoryStat[];
}

export interface CategoryStat {
  category: TodoCategory;
  total: number;
  completed: number;
  percentage: number;
}

export interface CreateTodoForm {
  title: string;
  description?: string;
  category: string;
}

export interface UpdateTodoForm {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  category?: string;
}

// デフォルトカテゴリ定義
export const DEFAULT_CATEGORIES: Record<string, TodoCategory> = {
  work: {
    id: 'work',
    name: '仕事',
    icon: 'briefcase',
    emoji: '🧳',
    color: {
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'bg-blue-900/30 text-blue-400 border-blue-800/30',
    },
  },
  personal: {
    id: 'personal',
    name: 'プライベート',
    icon: 'home',
    emoji: '🏠',
    color: {
      light: 'bg-green-100 text-green-700 border-green-200',
      dark: 'bg-green-900/30 text-green-400 border-green-800/30',
    },
  },
  health: {
    id: 'health',
    name: '健康',
    icon: 'heart',
    emoji: '❤️',
    color: {
      light: 'bg-red-100 text-red-700 border-red-200',
      dark: 'bg-red-900/30 text-red-400 border-red-800/30',
    },
  },
  study: {
    id: 'study',
    name: '学習',
    icon: 'book-open',
    emoji: '📚',
    color: {
      light: 'bg-purple-100 text-purple-700 border-purple-200',
      dark: 'bg-purple-900/30 text-purple-400 border-purple-800/30',
    },
  },
  other: {
    id: 'other',
    name: 'その他',
    icon: 'folder-open',
    emoji: '📁',
    color: {
      light: 'bg-gray-100 text-gray-700 border-gray-200',
      dark: 'bg-gray-900/30 text-gray-400 border-gray-800/30',
    },
  },
};

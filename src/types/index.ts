import { Priority } from '@prisma/client';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  position: number;
  userId: string;
  categoryId: string | null;
  category: Category | null;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  categoryId?: string;
  tagIds?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date;
  position?: number;
  categoryId?: string;
  tagIds?: string[];
}

// Category Types
export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryData {
  name: string;
  color: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  color: string;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagData {
  name: string;
  color: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

// Query Parameters
export interface TaskQueryParams {
  categoryId?: string;
  completed?: boolean;
  priority?: Priority;
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'position';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// User Types (for reference)
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

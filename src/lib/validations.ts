import { z } from 'zod';
import { Priority } from '@prisma/client';

// Task Validation Schemas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.MEDIUM),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  categoryId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください')
    .optional(),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
  completed: z.boolean().optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  position: z.number().int().min(0).optional(),
  categoryId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

export const taskQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  completed: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  priority: z.nativeEnum(Priority).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'position']).default('position'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val <= 100)
    .default('50'),
  offset: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0)
    .default('0'),
});

// Category Validation Schemas
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'カテゴリ名は必須です')
    .max(50, 'カテゴリ名は50文字以内で入力してください'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '有効な色コードを入力してください'),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'カテゴリ名は必須です')
    .max(50, 'カテゴリ名は50文字以内で入力してください')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, '有効な色コードを入力してください')
    .optional(),
});

// Tag Validation Schemas
export const createTagSchema = z.object({
  name: z.string().min(1, 'タグ名は必須です').max(30, 'タグ名は30文字以内で入力してください'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '有効な色コードを入力してください'),
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, 'タグ名は必須です')
    .max(30, 'タグ名は30文字以内で入力してください')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, '有効な色コードを入力してください')
    .optional(),
});

// Common Schemas
export const idParamSchema = z.object({
  id: z.string().cuid('有効なIDを指定してください'),
});

// Type exports for use in API routes
export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type CreateTagData = z.infer<typeof createTagSchema>;
export type UpdateTagData = z.infer<typeof updateTagSchema>;
export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Menu + category service.
 *
 * Ported from the web app:
 * - `client/src/api/menu_items.ts`
 * - `client/src/api/categories.ts`
 *
 * Business rules are unchanged: identical filters, identical select strings and
 * identical "missing row → null" semantics.
 */

import type {
  CategoryInsert,
  CategoryRow,
  CategoryUpdate,
  MenuItemInsert,
  MenuItemRow,
  MenuItemUpdate,
} from '@/types/database.types';

import { supabase } from './supabase';
import { fetchOrNull, mutate, mutateVoid } from './supabase/query';

/**
 * Mirrors `api/menu_items.ts` → `getMenuItems()`.
 *
 * Returns every menu item, optionally narrowed to a single category.
 */
export async function getMenuItems(categoryId?: string): Promise<MenuItemRow[]> {
  let builder = supabase.from('menu_items').select('*');

  if (categoryId) {
    builder = builder.eq('category_id', categoryId);
  }

  return mutate(() => builder, { fallbackMessage: 'Failed to load menu items' });
}

/**
 * Mirrors `api/menu_items.ts` → `getAvailableMenuItems()`.
 */
export async function getAvailableMenuItems(): Promise<MenuItemRow[]> {
  return mutate(() => supabase.from('menu_items').select('*').eq('is_available', true), {
    fallbackMessage: 'Failed to load available menu items',
  });
}

/**
 * Mirrors `api/menu_items.ts` → `getMenuItemById()`.
 *
 * `PGRST116` ("0 rows") resolves to `null` exactly like the web app.
 */
export async function getMenuItemById(id: string): Promise<MenuItemRow | null> {
  return fetchOrNull(() => supabase.from('menu_items').select('*').eq('id', id).single(), {
    fallbackMessage: 'Failed to load menu item',
  });
}

/**
 * Mirrors `api/menu_items.ts` → `createMenuItem()`.
 */
export async function createMenuItem(menuItem: MenuItemInsert): Promise<MenuItemRow> {
  return mutate(() => supabase.from('menu_items').insert(menuItem).select().single(), {
    fallbackMessage: 'Failed to create menu item',
  });
}

/**
 * Mirrors `api/menu_items.ts` → `updateMenuItem()`.
 */
export async function updateMenuItem(id: string, menuItem: MenuItemUpdate): Promise<MenuItemRow> {
  return mutate(() => supabase.from('menu_items').update(menuItem).eq('id', id).select().single(), {
    fallbackMessage: 'Failed to update menu item',
  });
}

/**
 * Mirrors `api/menu_items.ts` → `deleteMenuItem()`.
 */
export async function deleteMenuItem(id: string): Promise<void> {
  await mutateVoid(() => supabase.from('menu_items').delete().eq('id', id), {
    fallbackMessage: 'Failed to delete menu item',
  });
}

/**
 * Mirrors `api/menu_items.ts` → `updateMenuItemStatus()`.
 */
export async function updateMenuItemStatus(id: string, isAvailable: boolean): Promise<MenuItemRow> {
  return mutate(
    () =>
      supabase
        .from('menu_items')
        .update({ is_available: isAvailable })
        .eq('id', id)
        .select()
        .single(),
    { fallbackMessage: 'Failed to update menu item availability' }
  );
}

/**
 * Mirrors `api/categories.ts` → `getCategories()`.
 */
export async function getCategories(): Promise<CategoryRow[]> {
  return mutate(() => supabase.from('categories').select('*'), {
    fallbackMessage: 'Failed to load categories',
  });
}

/**
 * Mirrors `api/categories.ts` → `getCategoryById()`.
 */
export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  return fetchOrNull(() => supabase.from('categories').select('*').eq('id', id).single(), {
    fallbackMessage: 'Failed to load category',
  });
}

/**
 * Mirrors `api/categories.ts` → `createCategory()`.
 */
export async function createCategory(category: CategoryInsert): Promise<CategoryRow> {
  return mutate(() => supabase.from('categories').insert(category).select().single(), {
    fallbackMessage: 'Failed to create category',
  });
}

/**
 * Mirrors `api/categories.ts` → `updateCategory()`.
 */
export async function updateCategory(id: string, category: CategoryUpdate): Promise<CategoryRow> {
  return mutate(() => supabase.from('categories').update(category).eq('id', id).select().single(), {
    fallbackMessage: 'Failed to update category',
  });
}

/**
 * Mirrors `api/categories.ts` → `deleteCategory()`.
 */
export async function deleteCategory(id: string): Promise<void> {
  await mutateVoid(() => supabase.from('categories').delete().eq('id', id), {
    fallbackMessage: 'Failed to delete category',
  });
}

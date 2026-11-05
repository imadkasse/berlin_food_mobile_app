import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createCategory as createCategoryRecord,
  createMenuItem,
  deleteMenuItem,
  getCategories,
  getMenuItems,
  updateMenuItem,
  updateMenuItemStatus,
} from '@/services';
import type { Category, MenuItem } from '@/types/models';

import type { MenuItemDraft } from '../types';
import { errorMessage } from '../utils';

type MenuItemPayload = {
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean;
};

function toPayload(draft: MenuItemDraft): MenuItemPayload {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() ? draft.description.trim() : null,
    price: Number(draft.price),
    image_url: draft.image_url.trim() ? draft.image_url.trim() : null,
    category_id: draft.category_id ? draft.category_id : null,
    is_available: draft.is_available,
  };
}

/**
 * Menu editor state. Mirrors the web queries one-to-one:
 * `menu_items` select/insert/update/delete and `categories` select/insert.
 * The list is reloaded after every mutation, exactly like the web app's
 * `router.refresh()`.
 */
export function useAdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);

    const [itemsResult, categoriesResult] = await Promise.allSettled([
      getMenuItems(),
      getCategories(),
    ]);

    if (itemsResult.status === 'fulfilled') {
      setItems((itemsResult.value ?? []) as unknown as MenuItem[]);
    } else {
      setError(errorMessage(itemsResult.reason, 'Failed to load menu items'));
      setItems([]);
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories((categoriesResult.value ?? []) as unknown as Category[]);
    } else {
      const categoriesError = errorMessage(categoriesResult.reason, 'Failed to load categories');
      setError((current) => current ?? categoriesError);
      setCategories([]);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description ?? '').toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, items, search]);

  const createItem = useCallback(
    async (draft: MenuItemDraft): Promise<boolean> => {
      setSaving(true);
      setActionError(null);

      try {
        await createMenuItem(toPayload(draft));
      } catch (createError) {
        setActionError(errorMessage(createError, 'Failed to create menu item'));
        setSaving(false);
        return false;
      }

      await load('refresh');
      setSaving(false);
      return true;
    },
    [load]
  );

  const updateItem = useCallback(
    async (id: string, draft: MenuItemDraft): Promise<boolean> => {
      setSaving(true);
      setActionError(null);

      try {
        await updateMenuItem(id, toPayload(draft));
      } catch (updateError) {
        setActionError(errorMessage(updateError, 'Failed to update menu item'));
        setSaving(false);
        return false;
      }

      await load('refresh');
      setSaving(false);
      return true;
    },
    [load]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      setDeletingId(id);
      setActionError(null);

      try {
        await deleteMenuItem(id);
      } catch (deleteError) {
        setActionError(errorMessage(deleteError, 'Failed to delete menu item'));
        setDeletingId(null);
        return false;
      }

      await load('refresh');
      setDeletingId(null);
      return true;
    },
    [load]
  );

  const toggleAvailability = useCallback(
    async (item: MenuItem): Promise<boolean> => {
      setTogglingId(item.id);
      setActionError(null);
      const nextValue = !(item.is_available ?? false);

      try {
        await updateMenuItemStatus(item.id, nextValue);
      } catch (updateError) {
        setActionError(errorMessage(updateError, 'Failed to update menu item availability'));
        setTogglingId(null);
        return false;
      }

      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, is_available: nextValue } : candidate
        )
      );
      // Keep the rest of the list in sync with the server, mirroring the web
      // app's refresh-after-mutation behaviour.
      await load('refresh');
      setTogglingId(null);
      return true;
    },
    [load]
  );

  const createCategory = useCallback(
    async (name: string, imageUrl: string): Promise<boolean> => {
      setCreatingCategory(true);
      setActionError(null);

      try {
        await createCategoryRecord({
          name: name.trim(),
          image_url: imageUrl.trim() ? imageUrl.trim() : null,
        });
      } catch (insertError) {
        setActionError(errorMessage(insertError, 'Failed to create category'));
        setCreatingCategory(false);
        return false;
      }

      await load('refresh');
      setCreatingCategory(false);
      return true;
    },
    [load]
  );

  return {
    items,
    categories,
    filteredItems,
    loading,
    refreshing,
    error,
    actionError,
    saving,
    creatingCategory,
    togglingId,
    deletingId,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    refresh,
    clearActionError,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    createCategory,
  };
}

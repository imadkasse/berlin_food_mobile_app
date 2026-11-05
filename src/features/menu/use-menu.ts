import { useCallback, useEffect, useState } from 'react';

import { getCategories, getMenuItemById, getMenuItems } from '@/services';
import type { Category, MenuItem } from '@/types/models';

import { getErrorMessage } from './utils';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Guards against malformed deep links before they reach a uuid column. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LoadMode = 'initial' | 'refresh' | 'quiet';

export type UseMenuResult = {
  items: MenuItem[];
  categories: Category[];
  status: LoadStatus;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  retry: () => void;
};

/**
 * Reads the full menu exactly like the web app's `/menu` page:
 * `select *` on `menu_items` and `categories`, with **no** availability
 * filter (unavailable dishes still appear, labelled and not addable).
 */
export function useMenu(): UseMenuResult {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mode: LoadMode) => {
    // Yield before touching state so the mount effect never causes a
    // synchronous cascading render (react-hooks/set-state-in-effect).
    await Promise.resolve();

    if (mode === 'initial') setStatus('loading');
    if (mode === 'refresh') setRefreshing(true);
    if (mode !== 'quiet') setError(null);

    try {
      const [itemsResult, categoriesResult] = await Promise.all([getMenuItems(), getCategories()]);

      setItems(itemsResult ?? []);
      setCategories(categoriesResult ?? []);
      setStatus('ready');
      setError(null);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'We could not load the menu.');
      setError(message);
      if (mode === 'initial') setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Defer one tick: the fetch is an external-system subscription, and
    // starting it after the commit avoids a synchronous cascading render.
    const timer = setTimeout(() => {
      void load('initial');
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const retry = useCallback(() => {
    void load('initial');
  }, [load]);

  return { items, categories, status, error, refreshing, refresh, retry };
}

export type MenuItemLoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

export type UseMenuItemResult = {
  item: MenuItem | null;
  related: MenuItem[];
  status: MenuItemLoadStatus;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  retry: () => void;
};

/**
 * Loads one dish by id (a missing row is a distinct "not found" state) plus up
 * to three other dishes from the same category.
 */
export function useMenuItem(id: string | undefined): UseMenuItemResult {
  const [item, setItem] = useState<MenuItem | null>(null);
  const [related, setRelated] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<MenuItemLoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (mode: LoadMode) => {
      // See the note above: async boundary before any setState.
      await Promise.resolve();

      if (!id || !UUID_PATTERN.test(id)) {
        // A malformed deep link should read as "not found", never as a raw
        // Postgres uuid cast error.
        setItem(null);
        setRelated([]);
        setStatus('not-found');
        return;
      }

      if (mode === 'initial') setStatus('loading');
      if (mode === 'refresh') setRefreshing(true);
      if (mode !== 'quiet') setError(null);

      try {
        const data = await getMenuItemById(id);

        if (!data) {
          setItem(null);
          setRelated([]);
          setStatus('not-found');
          return;
        }

        setItem(data);
        setStatus('ready');

        if (!data.category_id) {
          setRelated([]);
          return;
        }

        // Suggestions are a bonus: a failure must never hide the dish itself.
        try {
          const suggestions = await getMenuItems(data.category_id);
          setRelated(suggestions.filter((candidate) => candidate.id !== data.id).slice(0, 3));
        } catch {
          setRelated([]);
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'We could not load this dish.'));
        if (mode === 'initial') setStatus('error');
      } finally {
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    // Deferred for the same reason as `useMenu`.
    const timer = setTimeout(() => {
      void load('initial');
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const retry = useCallback(() => {
    void load('initial');
  }, [load]);

  return { item, related, status, error, refreshing, refresh, retry };
}

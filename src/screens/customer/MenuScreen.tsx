import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppHeader } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { toCartItem } from '@/features/cart/cart-utils';
import { CategoryChips } from '@/features/menu/CategoryChips';
import { MenuCard } from '@/features/menu/MenuCard';
import { useMenu } from '@/features/menu/use-menu';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useCartStore } from '@/stores/cart.store';
import type { Category, MenuItem } from '@/types/models';

type MenuListHeaderProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  categoryId: string;
  onSelectCategory: (id: string) => void;
  categories: Category[];
  resultCount: number;
};

function MenuListHeader({
  query,
  onChangeQuery,
  categoryId,
  onSelectCategory,
  categories,
  resultCount,
}: MenuListHeaderProps) {
  const { tokens } = useTheme();

  return (
    <View className="gap-6 pb-5">
      {/* Editorial hero — tone and type only, no decorative chrome. */}
      <View className="gap-4 overflow-hidden rounded-lg bg-surface-variant p-6">
        <View className="flex-row items-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-accent" />
          <Text
            variant="label"
            weight="semibold"
            tone="secondary"
            className="uppercase tracking-widest"
          >
            Kitchen open · 30–40 min
          </Text>
        </View>

        <Text variant="headline" weight="extrabold">
          Berlin on a plate,{'\n'}
          <Text variant="headline" weight="extrabold" tone="primary">
            composed for you.
          </Text>
        </Text>

        <Text variant="body" tone="secondary">
          A short, deliberate menu of charcoal grills, fresh pasta and cold drinks — cooked to order
          and delivered warm.
        </Text>

        <View className="flex-row flex-wrap gap-2 pt-1">
          {['Locally sourced', 'Cooked to order', 'Evening delivery'].map((tag) => (
            <View key={tag} className="rounded-full bg-surface-raised px-3 py-1">
              <Text variant="caption" weight="medium" tone="secondary">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Search — a tonal field with a control-affordance outline only. */}
      <View className="h-14 flex-row items-center gap-3 rounded-lg border-2 border-outline-variant/40 bg-surface px-4">
        <Ionicons name="search-outline" size={18} color={tokens.outline} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search dishes…"
          placeholderTextColor={tokens.outline}
          returnKeyType="search"
          autoCorrect={false}
          className="flex-1 font-sans text-body text-on-surface"
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => onChangeQuery('')}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-variant"
          >
            <Ionicons name="close-circle" size={18} color={tokens.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>

      <View className="gap-3">
        <View className="flex-row items-end justify-between gap-3">
          <Text variant="title" weight="bold">
            Today&apos;s menu
          </Text>
          <Text variant="body-sm" tone="secondary">
            {resultCount} {resultCount === 1 ? 'dish' : 'dishes'}
          </Text>
        </View>

        <CategoryChips
          categories={categories}
          selectedId={categoryId}
          onSelect={onSelectCategory}
        />
      </View>
    </View>
  );
}

/**
 * Customer menu — the home tab and the only screen guests need to start an
 * order. Data comes straight from `menu_items` / `categories` with the web
 * app's queries; availability is shown but never used to hide a row.
 */
export function MenuScreen() {
  const { items, categories, status, error, refreshing, refresh, retry } = useMenu();
  const { width } = useWindowDimensions();
  const { tokens } = useTheme();
  const addItem = useCartStore((state) => state.addItem);

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');

  const columns = width < 350 ? 1 : 2;
  const singleColumn = columns === 1;

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = categoryId === 'all' || item.category_id === categoryId;
      if (!matchesCategory) return false;
      if (!term) return true;

      return (
        item.name.toLowerCase().includes(term) ||
        (item.description?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [categoryId, items, query]);

  const handleAdd = (item: MenuItem) => {
    // Intentional mobile fix: the web lets unavailable dishes be added.
    if (item.is_available === false) return;
    addItem(toCartItem(item));
  };

  const clearFilters = () => {
    setQuery('');
    setCategoryId('all');
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Menu" right={<ThemeToggle className="w-36" />} />

      {status === 'loading' ? (
        <LoadingState label="Loading today's menu…" className="flex-1" />
      ) : status === 'error' ? (
        <ErrorState
          title="The kitchen is offline"
          message={error ?? 'We could not load the menu.'}
          onRetry={retry}
          className="flex-1"
        />
      ) : (
        <FlatList
          key={`menu-columns-${columns}`}
          data={filteredItems}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuCard item={item} singleColumn={singleColumn} onAdd={handleAdd} />
          )}
          contentContainerClassName="px-5 pb-28 pt-4"
          columnWrapperStyle={columns > 1 ? { justifyContent: 'space-between' } : undefined}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            <MenuListHeader
              query={query}
              onChangeQuery={setQuery}
              categoryId={categoryId}
              onSelectCategory={setCategoryId}
              categories={categories}
              resultCount={filteredItems.length}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={items.length === 0 ? 'No dishes yet' : 'No dishes found'}
              message={
                items.length === 0
                  ? 'The menu is being prepared. Pull down to refresh in a moment.'
                  : 'Try a different search or category.'
              }
              actionLabel={items.length === 0 ? 'Refresh' : 'Clear filters'}
              onAction={items.length === 0 ? refresh : clearFilters}
            />
          }
          ListFooterComponent={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open your cart"
              onPress={() => router.navigate(ROUTES.cart)}
              className="mt-8 items-center rounded-lg bg-surface px-5 py-4 active:opacity-80"
            >
              <Text variant="body-sm" weight="semibold" tone="primary">
                Finished browsing? Review your cart
              </Text>
            </Pressable>
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={tokens.primary}
              colors={[tokens.primary]}
              progressBackgroundColor={tokens.surfaceRaised}
            />
          }
        />
      )}
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppHeader, SectionHeader } from '@/components/navigation';
import { Badge, Button, EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { toCartItem } from '@/features/cart/cart-utils';
import { QuantityStepper } from '@/features/cart/QuantityStepper';
import { DishImage } from '@/features/menu/DishImage';
import { useMenuItem } from '@/features/menu/use-menu';
import { formatPrice } from '@/features/menu/utils';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useCartStore } from '@/stores/cart.store';

/**
 * Dish detail — pushed from the menu into the public stack, so guests can
 * inspect a dish and still add it to their cart.
 */
export function FoodDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { item, related, status, error, refreshing, refresh, retry } = useMenuItem(id);
  const { tokens } = useTheme();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timeout);
  }, [added]);

  const handleAdd = () => {
    if (!item || item.is_available === false) return;
    addItem(toCartItem(item, quantity));
    setAdded(true);
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader canGoBack title="Dish" />

      {status === 'loading' ? (
        <LoadingState label="Plating your dish…" className="flex-1" />
      ) : status === 'error' ? (
        <ErrorState
          title="This dish is out of reach"
          message={error ?? 'We could not load this dish.'}
          onRetry={retry}
          className="flex-1"
        />
      ) : status === 'not-found' || !item ? (
        <EmptyState
          title="Dish not found"
          message="It may have been taken off the menu."
          actionLabel="Back to the menu"
          onAction={() => router.replace(ROUTES.menu)}
          className="flex-1"
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-5 pb-28 pt-4"
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
        >
          <DishImage
            uri={item.image_url}
            className="h-72 w-full rounded-lg"
            iconSize={44}
            accessibilityLabel={item.name}
          />

          <View className="gap-3">
            <View className="flex-row items-start justify-between gap-4">
              <Text variant="title-lg" weight="bold" className="flex-1">
                {item.name}
              </Text>
              <Text variant="title-lg" weight="bold" tone="primary">
                {formatPrice(item.price)}
              </Text>
            </View>

            <Badge tone={item.is_available === false ? 'error' : 'success'}>
              {item.is_available === false ? 'Unavailable' : 'Available'}
            </Badge>

            <Text variant="body-lg" tone="secondary">
              {item.description ?? 'A house favourite, prepared to order.'}
            </Text>
          </View>

          <View className="gap-4 rounded-md bg-surface p-5">
            <View className="flex-row items-center justify-between gap-4">
              <View className="gap-0.5">
                <Text variant="body-lg" weight="semibold">
                  Quantity
                </Text>
                <Text variant="body-sm" tone="secondary">
                  {formatPrice(item.price)} each
                </Text>
              </View>

              <QuantityStepper
                value={quantity}
                onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
                onIncrement={() => setQuantity((value) => value + 1)}
                decrementDisabled={quantity <= 1}
              />
            </View>

            <Button
              size="lg"
              block
              disabled={item.is_available === false}
              onPress={handleAdd}
              accessibilityLabel={`Add ${quantity} ${item.name} to cart`}
            >
              {item.is_available === false
                ? 'Currently unavailable'
                : added
                  ? 'Added to cart'
                  : `Add to cart · ${formatPrice(item.price * quantity)}`}
            </Button>

            {added ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View cart"
                onPress={() => router.navigate(ROUTES.cart)}
                className="flex-row items-center justify-center gap-2 rounded-full py-2 active:opacity-70"
              >
                <Ionicons name="bag-handle-outline" size={16} color={tokens.primary} />
                <Text variant="body-sm" weight="semibold" tone="primary">
                  View cart
                </Text>
              </Pressable>
            ) : null}
          </View>

          {related.length > 0 ? (
            <View className="gap-3">
              <SectionHeader
                eyebrow="From the same station"
                title="You might also like"
                description="More dishes from this part of the menu."
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3"
              >
                {related.map((dish) => (
                  <Pressable
                    key={dish.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${dish.name}, ${formatPrice(dish.price)}`}
                    onPress={() => router.push({ pathname: '/menu/[id]', params: { id: dish.id } })}
                    className="w-36 gap-2 active:opacity-80"
                  >
                    <DishImage uri={dish.image_url} className="h-24 w-36 rounded-md" />
                    <Text variant="body-sm" weight="semibold" numberOfLines={2}>
                      {dish.name}
                    </Text>
                    <Text variant="body-sm" weight="bold" tone="primary">
                      {formatPrice(dish.price)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

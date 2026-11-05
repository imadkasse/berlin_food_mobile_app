import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, View } from 'react-native';

import { Screen, ScreenScroll, SectionHeader, StatCard } from '@/components/navigation';
import { Card, EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import {
  AvailabilitySwitch,
  DeliveryNotice,
  OrderStatusBadge,
  OrderThumb,
  courierInitials,
  destinationLabel,
  formatMoney,
  shortOrderId,
  useDeliveryDashboard,
} from '@/features/delivery';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';
import { cn } from '@/utils/cn';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DeliveryDashboardScreen() {
  const { tokens } = useTheme();
  const { profile } = useSession();
  const {
    activeOrder,
    recentOrders,
    weeklyDeliveries,
    stats,
    isLoading,
    isRefreshing,
    error,
    isAvailable,
    isTogglingAvailability,
    availabilityError,
    toggleAvailability,
    refresh,
  } = useDeliveryDashboard();

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? 'Courier';
  const peakValue = Math.max(...weeklyDeliveries.map((point) => point.value), 1);
  const showInitialLoading = isLoading && recentOrders.length === 0 && !activeOrder;

  return (
    <Screen>
      <ScreenScroll
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={tokens.primary}
            colors={[tokens.primary]}
          />
        }
      >
        <View className="gap-1.5 pt-1">
          <Text
            variant="label"
            weight="semibold"
            tone="accent"
            className="uppercase tracking-widest"
          >
            Berlin Food · Courier
          </Text>
          <Text variant="headline" weight="extrabold">
            {greeting()}, {firstName}
          </Text>
          <Text variant="body" tone="secondary">
            Here is how your day is moving.
          </Text>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: isAvailable }}
          accessibilityLabel={isAvailable ? 'Available for deliveries' : 'Set as unavailable'}
          disabled={isTogglingAvailability}
          onPress={() => void toggleAvailability()}
          className="active:opacity-90"
        >
          <Card variant="tonal" className="flex-row items-center gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons
                name={isAvailable ? 'bicycle' : 'moon-outline'}
                size={22}
                color={isAvailable ? tokens.primary : tokens.onSurfaceVariant}
              />
            </View>

            <View className="flex-1 gap-0.5">
              <Text variant="body-lg" weight="semibold">
                {isAvailable ? 'Available for deliveries' : 'Set as unavailable'}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {isAvailable
                  ? 'You are visible to the dispatch team.'
                  : 'You will not receive new delivery requests.'}
              </Text>
            </View>

            <AvailabilitySwitch checked={isAvailable} loading={isTogglingAvailability} />
          </Card>
        </Pressable>

        {availabilityError ? (
          <DeliveryNotice notice={{ tone: 'error', message: availabilityError }} />
        ) : null}

        {showInitialLoading ? (
          <LoadingState label="Loading your dashboard…" />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-3">
              <StatCard
                label="Active order"
                value={String(stats.activeOrders)}
                icon="navigate-outline"
                className="min-w-[45%] flex-1"
              />
              <StatCard
                label="Completed today"
                value={String(stats.completedToday)}
                icon="checkmark-done-outline"
                className="min-w-[45%] flex-1"
              />
              <StatCard
                label="Earnings today"
                value={formatMoney(stats.earningsToday)}
                icon="cash-outline"
                className="min-w-[45%] flex-1"
              />
              <StatCard
                label="Average duration"
                value={`${stats.averageMinutes} min`}
                icon="time-outline"
                className="min-w-[45%] flex-1"
              />
            </View>

            {error ? (
              <ErrorState
                title="Dashboard unavailable"
                message={error}
                onRetry={() => void refresh()}
              />
            ) : null}

            {activeOrder ? (
              <Card className="gap-4 bg-primary">
                <View className="flex-row items-start gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-on-primary/15">
                    <Ionicons name="bicycle" size={22} color={tokens.onPrimary} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text
                      variant="label"
                      weight="semibold"
                      className="uppercase tracking-widest text-on-primary/70"
                    >
                      Active delivery · #{shortOrderId(activeOrder.id)}
                    </Text>
                    <Text
                      variant="title"
                      weight="bold"
                      className="text-on-primary"
                      numberOfLines={2}
                    >
                      {destinationLabel(activeOrder.delivery_address)}
                    </Text>
                    <Text variant="body-sm" className="text-on-primary/70">
                      {formatMoney(activeOrder.total_price)} order value
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/delivery/active-delivery/[id]',
                      params: { id: activeOrder.id },
                    })
                  }
                  className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-on-primary active:opacity-80"
                >
                  <Ionicons name="navigate" size={17} color={tokens.primary} />
                  <Text variant="body" weight="semibold" tone="primary">
                    Start navigation
                  </Text>
                </Pressable>
              </Card>
            ) : null}

            <Card className="gap-6">
              <View className="flex-row items-start justify-between gap-3">
                <View className="gap-1">
                  <Text variant="title" weight="bold">
                    Weekly deliveries
                  </Text>
                  <Text variant="body-sm" tone="secondary">
                    Last 7 days
                  </Text>
                </View>
                <View className="flex-row items-center gap-2 pt-1">
                  <View className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <Text
                    variant="caption"
                    weight="semibold"
                    tone="secondary"
                    className="uppercase tracking-widest"
                  >
                    Deliveries
                  </Text>
                </View>
              </View>

              <View className="flex-row items-end gap-2">
                {weeklyDeliveries.map((point) => {
                  const isPeak = point.value === peakValue;
                  const barHeight = Math.max(10, Math.round((point.value / peakValue) * 112));

                  return (
                    <View key={point.label} className="flex-1 items-center gap-2">
                      <Text
                        variant="caption"
                        weight="semibold"
                        tone={isPeak ? 'primary' : 'secondary'}
                      >
                        {point.value}
                      </Text>
                      <View
                        className="w-full justify-end rounded-sm bg-surface-variant/70"
                        style={{ height: 112 }}
                      >
                        <View
                          className={cn(
                            'w-full rounded-sm',
                            isPeak ? 'bg-primary' : 'bg-accent-soft'
                          )}
                          style={{ height: barHeight }}
                        />
                      </View>
                      <Text variant="caption" tone="secondary">
                        {point.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            <View className="gap-3">
              <SectionHeader
                title="Recent orders"
                action={
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(ROUTES.deliveryOrders)}
                    className="active:opacity-70"
                  >
                    <Text variant="body-sm" weight="semibold" tone="primary">
                      View all
                    </Text>
                  </Pressable>
                }
              />

              {recentOrders.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No deliveries yet"
                    message="Orders assigned to you will appear here."
                    actionLabel="Browse orders"
                    onAction={() => router.push(ROUTES.deliveryOrders)}
                  />
                </Card>
              ) : (
                <Card className="gap-2">
                  {recentOrders.slice(0, 8).map((order) => (
                    <View key={order.id} className="flex-row items-center gap-3 py-2">
                      <OrderThumb uri={order.order_items?.[0]?.menu_item?.image_url} size={44} />

                      <View className="flex-1 gap-0.5">
                        <Text variant="body" weight="semibold">
                          #{shortOrderId(order.id)}
                        </Text>
                        <Text variant="body-sm" tone="secondary" numberOfLines={1}>
                          {destinationLabel(order.delivery_address)}
                        </Text>
                      </View>

                      <View className="items-end gap-1.5">
                        <Text variant="body" weight="bold" tone="primary">
                          {formatMoney(order.total_price)}
                        </Text>
                        <OrderStatusBadge status={order.status} className="self-end" />
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>

            <Text variant="caption" tone="secondary" className="text-center">
              Signed in as {profile?.full_name?.trim() || 'Courier'} ·{' '}
              {courierInitials(profile?.full_name)}
            </Text>
          </>
        )}
      </ScreenScroll>
    </Screen>
  );
}

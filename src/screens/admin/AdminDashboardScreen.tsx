import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen, ScreenScroll, SectionHeader, StatCard } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button, Card, Text } from '@/components/ui';
import { adminLiveOrders, adminStats, kitchenEfficiency, topDishes } from '@/data/mock';
import { ProgressBar } from '@/features/admin/components/ProgressBar';
import { WeeklyRevenueChart } from '@/features/admin/components/WeeklyRevenueChart';
import { initials } from '@/features/admin/utils';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';

const DATE_RANGE_LABEL = '24 – 30 Sep 2023';

function LiveOrderRow({
  label,
  count,
  dotClassName,
}: {
  label: string;
  count: number;
  dotClassName: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-3">
        <View className={`h-2.5 w-2.5 rounded-full ${dotClassName}`} />
        <Text variant="body" weight="medium">
          {label}
        </Text>
      </View>
      <Text variant="title" weight="bold">
        {String(count).padStart(2, '0')}
      </Text>
    </View>
  );
}

export function AdminDashboardScreen() {
  const { profile } = useSession();
  const { tokens } = useTheme();
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? 'Chef';

  return (
    <Screen>
      <ScreenScroll>
        <View className="gap-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text
                variant="label"
                weight="semibold"
                tone="accent"
                className="uppercase tracking-widest"
              >
                Admin overview
              </Text>
              <Text variant="headline" weight="extrabold" numberOfLines={2}>
                Good evening, {firstName}
              </Text>
              <Text variant="body-sm" tone="secondary">
                Here is how the kitchen is running tonight.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              <Text variant="body" weight="bold" tone="primary">
                {initials(profile?.full_name ?? 'Berlin Food')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2.5">
              <Ionicons name="calendar-outline" size={16} color={tokens.accent} />
              <Text variant="body-sm" weight="semibold">
                {DATE_RANGE_LABEL}
              </Text>
            </View>
          </View>

          <ThemeToggle />
        </View>

        <View className="flex-row flex-wrap gap-3">
          {adminStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
              icon={stat.icon}
              className="w-[48%] flex-grow gap-3"
            />
          ))}
        </View>

        <WeeklyRevenueChart />

        <Card variant="tonal" className="gap-6">
          <SectionHeader
            eyebrow="Live"
            title="Orders in the kitchen"
            description="Real-time counts across the pass."
          />

          <View className="gap-4">
            <LiveOrderRow
              label="Preparing"
              count={adminLiveOrders.preparing}
              dotClassName="bg-accent"
            />
            <LiveOrderRow
              label="Ready for pickup"
              count={adminLiveOrders.ready}
              dotClassName="bg-primary"
            />
            <LiveOrderRow
              label="Completed today"
              count={adminLiveOrders.completed}
              dotClassName="bg-success"
            />
          </View>

          <Button variant="tonal" block onPress={() => router.push(ROUTES.adminOrders)}>
            Kitchen screen
          </Button>
        </Card>

        <Card className="gap-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text variant="title" weight="bold">
                Kitchen efficiency
              </Text>
              <Text variant="body-sm" tone="secondary">
                Average ticket time tonight
              </Text>
            </View>
            <View className="items-end gap-0.5">
              <Text variant="headline" weight="extrabold" tone="primary">
                {kitchenEfficiency.avgMinutes}
              </Text>
              <Text
                variant="caption"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                minutes
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text
                variant="label"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Target met
              </Text>
              <Text variant="body-sm" weight="bold" tone="success">
                {kitchenEfficiency.percent}%
              </Text>
            </View>
            <ProgressBar percent={kitchenEfficiency.percent} heightClassName="h-3" />
          </View>

          <Text variant="body-sm" tone="secondary">
            {kitchenEfficiency.percent}% of orders leave the pass inside the promised window —
            roughly 12% faster than last week.
          </Text>
        </Card>

        <View className="gap-3">
          <SectionHeader
            eyebrow="Best sellers"
            title="Top dishes"
            description="Highest volume this week."
          />

          <Card className="gap-5">
            {topDishes.map((dish, index) => (
              <View key={dish.id} className="flex-row items-center gap-3">
                <Text variant="body-sm" weight="bold" tone="secondary" className="w-4">
                  {index + 1}
                </Text>
                <Image
                  source={{ uri: dish.image_url }}
                  contentFit="cover"
                  style={{ width: 48, height: 48, borderRadius: 12 }}
                />
                <View className="flex-1 gap-2">
                  <View className="flex-row items-end justify-between gap-2">
                    <Text variant="body-sm" weight="semibold" numberOfLines={1} className="flex-1">
                      {dish.name}
                    </Text>
                    <Text variant="caption" weight="bold" tone="secondary">
                      {dish.sold} sold
                    </Text>
                  </View>
                  <ProgressBar percent={dish.percent} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        <Text variant="caption" tone="secondary" className="text-center">
          Analytics on this screen are the admin dashboard fixtures mirrored from the web prototype
          — not server aggregates.
        </Text>
      </ScreenScroll>
    </Screen>
  );
}

import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { weeklyRevenue } from '@/data/mock';
import { formatCompactEuro } from '../utils';

const BAR_AREA_HEIGHT = 132;

/**
 * Weekly revenue chart built with plain Views — no chart dependency.
 * Bars are accent-filled; the tallest bar carries its value.
 */
export function WeeklyRevenueChart() {
  const max = Math.max(...weeklyRevenue.map((point) => point.value));

  return (
    <Card className="gap-6">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="title" weight="bold">
            Revenue this week
          </Text>
          <Text variant="body-sm" tone="secondary">
            Daily gross across all channels
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-accent" />
          <Text
            variant="caption"
            weight="bold"
            tone="secondary"
            className="uppercase tracking-widest"
          >
            Last 7 days
          </Text>
        </View>
      </View>

      <View className="flex-row items-end gap-2" style={{ height: BAR_AREA_HEIGHT + 24 }}>
        {weeklyRevenue.map((point) => {
          const isTallest = point.value === max;
          const barHeight = Math.max(10, Math.round((point.value / max) * BAR_AREA_HEIGHT));

          return (
            <View key={point.label} className="flex-1 items-center justify-end gap-2">
              {isTallest ? (
                <Text variant="caption" weight="bold" tone="primary">
                  {formatCompactEuro(point.value)}
                </Text>
              ) : (
                <View className="h-3.5" />
              )}
              <View
                className="w-full rounded-t-sm bg-accent"
                style={{ height: barHeight }}
                accessibilityLabel={`${point.label}: ${formatCompactEuro(point.value)}`}
              />
              <Text variant="caption" weight="semibold" tone="secondary">
                {point.label}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

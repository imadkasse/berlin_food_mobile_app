import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type DishImageProps = {
  uri: string | null | undefined;
  /** Sizing/rounding classes applied to the wrapper. */
  className?: string;
  iconSize?: number;
  accessibilityLabel?: string;
};

/**
 * Dish photo with a calm tonal fallback. `expo-image` handles caching and the
 * soft 200 ms fade; the wrapper owns the geometry so every caller can use the
 * same component in cards, rows and hero headers.
 */
export function DishImage({ uri, className, iconSize = 24, accessibilityLabel }: DishImageProps) {
  const { tokens } = useTheme();

  return (
    <View className={cn('overflow-hidden bg-surface-variant', className)}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="restaurant-outline" size={iconSize} color={tokens.onSurfaceVariant} />
        </View>
      )}
    </View>
  );
}

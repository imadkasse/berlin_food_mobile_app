import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export type OrderThumbProps = {
  uri?: string | null;
  size?: number;
  className?: string;
};

/**
 * Warm thumbnail for the first item of an order. Falls back to a tonal plate
 * mark when the menu item has no image so cards never break their rhythm.
 */
export function OrderThumb({ uri, size = 56, className }: OrderThumbProps) {
  const { tokens } = useTheme();

  if (!uri) {
    return (
      <View
        className={cn('items-center justify-center rounded-md bg-accent-soft', className)}
        style={{ width: size, height: size }}
      >
        <Ionicons name="bag-handle-outline" size={Math.round(size * 0.4)} color={tokens.primary} />
      </View>
    );
  }

  return (
    <View
      className={cn('overflow-hidden rounded-md bg-surface-variant', className)}
      style={{ width: size, height: size }}
    >
      <Image
        source={uri}
        contentFit="cover"
        transition={180}
        accessibilityLabel="Order item"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

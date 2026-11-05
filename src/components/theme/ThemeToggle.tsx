import { Pressable, View } from 'react-native';
import { useThemeStore, type ThemeMode } from '@/stores';
import { cn } from '@/utils/cn';
import { Text } from '@/components/ui';

const segments: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * Segmented control for the theme preference. The selection is persisted by
 * the theme store and applied app-wide by the ThemeProvider.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <View
      accessibilityRole="radiogroup"
      className={cn('flex-row rounded-full bg-surface-variant p-1', className)}
    >
      {segments.map(({ value, label }) => {
        const active = mode === value;
        return (
          <Pressable
            key={value}
            onPress={() => setMode(value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            className={cn(
              'h-11 flex-1 items-center justify-center rounded-full active:opacity-70',
              active ? 'bg-surface-raised' : 'bg-transparent'
            )}
          >
            <Text
              variant="label"
              weight={active ? 'semibold' : 'medium'}
              tone={active ? 'default' : 'secondary'}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

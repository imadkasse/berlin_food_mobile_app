import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export type PaginationBarProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

/** Prev/next pager, mirroring the web admin tables' page navigation. */
export function PaginationBar({ page, totalPages, onPrevious, onNext }: PaginationBarProps) {
  const { tokens } = useTheme();

  return (
    <View className="flex-row items-center justify-between gap-3 pt-2">
      <Text variant="body-sm" weight="medium" tone="secondary">
        Page {page} of {totalPages}
      </Text>
      <View className="flex-row items-center gap-2">
        <Button
          variant="tonal"
          size="sm"
          disabled={page <= 1}
          onPress={onPrevious}
          accessibilityLabel="Previous page"
        >
          <Ionicons name="chevron-back" size={16} color={tokens.onAccentSoft} />
          <Text variant="body-sm" weight="semibold" tone="default">
            Prev
          </Text>
        </Button>
        <Button
          variant="tonal"
          size="sm"
          disabled={page >= totalPages}
          onPress={onNext}
          accessibilityLabel="Next page"
        >
          <Text variant="body-sm" weight="semibold" tone="default">
            Next
          </Text>
          <Ionicons name="chevron-forward" size={16} color={tokens.onAccentSoft} />
        </Button>
      </View>
    </View>
  );
}

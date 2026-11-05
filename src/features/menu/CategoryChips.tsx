import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui';
import type { Category } from '@/types/models';
import { cn } from '@/utils/cn';

export type CategoryChipsProps = {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/** Horizontal category filter. "All" is always first, mirroring the web app. */
export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  const chips = [
    { id: 'all', name: 'All' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pb-1"
    >
      {chips.map((chip) => {
        const active = selectedId === chip.id;

        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(chip.id)}
            className={cn(
              'h-10 items-center justify-center rounded-full px-4 active:opacity-80',
              active ? 'bg-accent' : 'bg-surface-variant'
            )}
          >
            <Text
              variant="body-sm"
              weight={active ? 'semibold' : 'medium'}
              tone={active ? 'on-accent' : 'secondary'}
              numberOfLines={1}
            >
              {chip.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Modal, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  /** "Maybe later" mirrors the web app: mark delivered without a rating. */
  onSkip: () => void;
  isSubmitting: boolean;
  error: string | null;
};

const STARS = [1, 2, 3, 4, 5];

/** Five-star courier rating shown when the customer confirms a delivery. */
export function RatingModal({
  visible,
  onClose,
  onSubmit,
  onSkip,
  isSubmitting,
  error,
}: RatingModalProps) {
  const { tokens } = useTheme();
  // The parent mounts this modal per order, so a fresh rating starts at 0
  // without synchronising anything in an effect.
  const [rating, setRating] = useState(0);

  return (
    <Modal visible={visible} onClose={isSubmitting ? () => {} : onClose} title="Rate your delivery">
      <View className="items-center gap-3">
        <Text variant="body-sm" tone="secondary" className="text-center">
          How was the courier for this order? Your rating helps us keep the last mile warm.
        </Text>

        <View className="flex-row items-center gap-2 py-1">
          {STARS.map((star) => {
            const active = rating >= star;

            return (
              <Pressable
                key={star}
                accessibilityRole="button"
                accessibilityLabel={`${star} ${star === 1 ? 'star' : 'stars'}`}
                accessibilityState={{ selected: active }}
                onPress={() => setRating(star)}
                className="p-1 active:opacity-70"
              >
                <Ionicons
                  name={active ? 'star' : 'star-outline'}
                  size={32}
                  color={active ? tokens.accent : tokens.outlineVariant}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? (
        <Text variant="body-sm" tone="error" className="text-center">
          {error}
        </Text>
      ) : null}

      <View className="gap-2 pt-1">
        <Button
          block
          size="lg"
          loading={isSubmitting}
          disabled={rating === 0}
          onPress={() => onSubmit(rating)}
        >
          Submit rating
        </Button>
        <Button block variant="ghost" disabled={isSubmitting} onPress={onSkip}>
          Maybe later
        </Button>
      </View>
    </Modal>
  );
}

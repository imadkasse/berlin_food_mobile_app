import { View } from 'react-native';

import { cn } from '@/utils/cn';

import { clampPercent } from '../utils';

export type ProgressBarProps = {
  /** Percentage 0–100. */
  percent: number;
  className?: string;
  /** Height utility for the track; defaults to `h-2`. */
  heightClassName?: string;
};

/** Slim accent progress bar used by kitchen efficiency and top dishes. */
export function ProgressBar({ percent, className, heightClassName = 'h-2' }: ProgressBarProps) {
  const width = `${clampPercent(percent)}%` as const;

  return (
    <View
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-variant',
        heightClassName,
        className
      )}
    >
      <View className="h-full rounded-full bg-accent" style={{ width }} />
    </View>
  );
}

import { Link } from 'expo-router';
import { View } from 'react-native';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Screen, ScreenScroll } from '@/components/navigation/Screen';
import { Button, Text } from '@/components/ui';

/**
 * Deep-link fallback.
 *
 * Expo Router renders this for an unmatched URL instead of crashing or
 * silently landing on the home screen, which keeps hand-written deep links
 * (`berlinfood://…`) predictable.
 */
export default function NotFoundScreen() {
  return (
    <Screen edges={['bottom']}>
      <AppHeader title="Not found" canGoBack />
      <ScreenScroll>
        <View className="items-center gap-3 py-10">
          <Text variant="display" weight="extrabold" tone="primary">
            404
          </Text>
          <Text variant="title" weight="bold">
            This table is not set
          </Text>
          <Text variant="body-sm" tone="secondary" className="text-center">
            The link you followed does not point to a screen in Berlin Food.
          </Text>
        </View>

        <View className="gap-3">
          <Link href="/" asChild>
            <Button block>Back to the start</Button>
          </Link>
          <Link href="/menu" asChild>
            <Button variant="tonal" block>
              Browse the menu
            </Button>
          </Link>
        </View>
      </ScreenScroll>
    </Screen>
  );
}

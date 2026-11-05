import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Screen, ScreenScroll, SectionHeader } from '@/components/navigation/Screen';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button, Text } from '@/components/ui';
import { mockMenuItems } from '@/data/mock';
import { toHref } from '@/features/auth/navigation';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

const HOW_IT_WORKS = [
  {
    icon: 'restaurant-outline',
    title: 'Choose your food',
    description: 'A short, seasonal menu from kitchens we know by name.',
  },
  {
    icon: 'location-outline',
    title: 'Set your location',
    description: 'Tell us where you are and we route the nearest courier.',
  },
  {
    icon: 'bicycle-outline',
    title: 'Track the delivery',
    description: 'Follow every step from the pass to your door.',
  },
] as const;

const COVERAGE_AREAS = ['Mitte', 'Kreuzberg', 'Neukölln', 'Prenzlauer Berg'];

const PREVIEW_DISHES = mockMenuItems.filter((item) => item.is_available).slice(0, 3);

function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

export function LandingScreen() {
  const { tokens } = useTheme();

  return (
    <Screen>
      <ScreenScroll>
        <View className="gap-10">
          {/* Wordmark + theme switch */}
          <View className="flex-row items-center justify-between gap-3 pt-3">
            <View className="flex-row items-center gap-2">
              <Text variant="title" weight="extrabold" className="tracking-tight">
                Berlin Food
              </Text>
              <View className="h-2 w-2 rounded-full bg-accent" />
            </View>
            <ThemeToggle className="w-36" />
          </View>

          {/* Editorial hero */}
          <View className="gap-6">
            <View className="gap-4">
              <Text
                variant="label"
                weight="semibold"
                tone="accent"
                className="uppercase tracking-widest"
              >
                The evening menu
              </Text>
              <Text variant="display" weight="extrabold" className="tracking-tight">
                Dinner, as it should feel.
              </Text>
              <Text variant="body-lg" tone="secondary">
                Seasonal plates from the city’s best kitchens, delivered warm and unhurried. No
                queues, no noise — just a table set for you.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Button block size="lg" className="flex-1" onPress={() => router.push(ROUTES.menu)}>
                Browse the menu
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onPress={() => router.push(ROUTES.login)}
              >
                Sign in
              </Button>
            </View>

            <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
              <Text variant="caption" weight="semibold" tone="secondary">
                30–40 min
              </Text>
              <Text variant="caption" tone="secondary">
                ·
              </Text>
              <Text variant="caption" weight="semibold" tone="secondary">
                Seven nights a week
              </Text>
              <Text variant="caption" tone="secondary">
                ·
              </Text>
              <Text variant="caption" weight="semibold" tone="secondary">
                Mitte to Neukölln
              </Text>
            </View>

            <View className="overflow-hidden rounded-lg bg-surface">
              <Image
                source={{ uri: HERO_IMAGE }}
                className="h-64 w-full"
                contentFit="cover"
                transition={250}
                accessibilityLabel="A warm table set with plates of seasonal food"
              />
              <View className="absolute inset-x-4 bottom-4 rounded-md bg-surface-raised/95 p-4">
                <Text
                  variant="label"
                  weight="semibold"
                  tone="secondary"
                  className="uppercase tracking-widest"
                >
                  Tonight’s kitchen
                </Text>
                <Text variant="body-lg" weight="semibold" className="mt-1">
                  Charcoal-grilled, finished with lemon.
                </Text>
              </View>
            </View>
          </View>

          {/* Offer */}
          <View className="gap-4 rounded-lg bg-accent-soft p-6">
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles-outline" size={16} color={tokens.onAccentSoft} />
              <Text
                variant="label"
                weight="semibold"
                tone="on-accent"
                className="uppercase tracking-widest"
              >
                Your first evening
              </Text>
            </View>
            <View className="gap-2">
              <Text variant="title-lg" weight="bold">
                €10 off your first order.
              </Text>
              <Text variant="body-sm" tone="secondary">
                Create an account and use the code WELCOME10 at checkout. One use, no rush.
              </Text>
            </View>
            <Button
              variant="primary"
              size="sm"
              className="self-start"
              onPress={() => router.push(toHref(ROUTES.register))}
            >
              Create account
            </Button>
          </View>

          {/* Dish preview */}
          <View className="gap-4">
            <SectionHeader
              eyebrow="A small preview"
              title="Three plates to start"
              description="A taste of the current menu, updated with the season."
              action={
                <Pressable onPress={() => router.push(ROUTES.menu)} accessibilityRole="button">
                  <Text variant="body-sm" weight="semibold" tone="primary">
                    Full menu
                  </Text>
                </Pressable>
              }
            />

            <View className="gap-3">
              {PREVIEW_DISHES.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(toHref(ROUTES.menuItem(item.id)))}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.name}`}
                  className="flex-row gap-4 rounded-md bg-surface p-3 active:opacity-80"
                >
                  <Image
                    source={{ uri: item.image_url ?? undefined }}
                    className="h-24 w-24 rounded-sm bg-surface-variant"
                    contentFit="cover"
                    transition={200}
                    accessibilityLabel={item.name}
                  />
                  <View className="flex-1 justify-between py-1">
                    <View className="gap-1">
                      <Text variant="body-lg" weight="semibold" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text variant="body-sm" tone="secondary" numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                    <Text variant="body" weight="bold" tone="primary">
                      {formatPrice(item.price)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* How it works */}
          <View className="gap-6 rounded-lg bg-surface p-6">
            <View className="gap-1">
              <Text variant="title-lg" weight="bold">
                How it works
              </Text>
              <Text variant="body-sm" tone="secondary">
                Three quiet steps, nothing more.
              </Text>
            </View>

            <View className="gap-5">
              {HOW_IT_WORKS.map((step, index) => (
                <View key={step.title} className="flex-row items-start gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                    <Ionicons name={step.icon} size={20} color={tokens.onAccentSoft} />
                  </View>
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text variant="caption" weight="bold" tone="accent">
                        0{index + 1}
                      </Text>
                      <Text variant="body-lg" weight="semibold">
                        {step.title}
                      </Text>
                    </View>
                    <Text variant="body-sm" tone="secondary">
                      {step.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery coverage */}
          <View className="gap-5 rounded-lg bg-surface-variant p-6">
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-raised">
                <Ionicons name="navigate-outline" size={20} color={tokens.primary} />
              </View>
              <View className="flex-1 gap-2">
                <Text variant="title-lg" weight="bold">
                  Across the city, after dark.
                </Text>
                <Text variant="body-sm" tone="secondary">
                  Couriers are on the road from 18:00 to 23:30. If you are inside the ring, dinner
                  is usually with you in under forty minutes.
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {COVERAGE_AREAS.map((area) => (
                <View key={area} className="rounded-full bg-surface-raised px-3 py-1.5">
                  <Text variant="label" weight="semibold" tone="secondary">
                    {area}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Courier CTA */}
          <View className="gap-5 rounded-lg bg-primary p-6">
            <View className="gap-2">
              <Text
                variant="label"
                weight="semibold"
                tone="inverse"
                className="uppercase tracking-widest"
              >
                Join the road
              </Text>
              <Text variant="title-lg" weight="bold" tone="inverse">
                Ride with Berlin Food.
              </Text>
              <Text variant="body-sm" tone="inverse">
                Flexible evenings, fair pay and a route that fits your life. Apply in a couple of
                minutes.
              </Text>
            </View>
            <Button
              variant="accent"
              size="md"
              className="self-start"
              onPress={() => router.push(ROUTES.registerAsDelivery)}
            >
              Become a courier
            </Button>
          </View>

          {/* Footer */}
          <View className="gap-3 pt-2">
            <View className="h-1 w-10 rounded-full bg-accent" />
            <Text variant="body-sm" tone="secondary">
              Seasonal kitchens, warm food and slow evenings. Berlin Food is a delivery studio for
              the city after dark.
            </Text>
            <Text variant="caption" tone="secondary">
              © 2026 Berlin Food · Made for the city, after dark.
            </Text>
          </View>
        </View>
      </ScreenScroll>
    </Screen>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Screen, ScreenScroll, ListRow } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Badge, Button, Card, Input, LoadingState, Text } from '@/components/ui';
import {
  AvailabilitySwitch,
  DeliveryNotice,
  VEHICLE_OPTIONS,
  courierInitials,
  formatDateTime,
  useDeliveryProfile,
} from '@/features/delivery';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';
import { VEHICLE_LABEL } from '@/types/models';
import { cn } from '@/utils/cn';

export function DeliveryProfileScreen() {
  const { tokens } = useTheme();
  const { signOut } = useSession();
  const { profile, isLoading, draft, isSaving, notice, dismissNotice, setField, save } =
    useDeliveryProfile();

  const displayName = profile?.full_name?.trim() || 'Courier';
  const rating = profile?.delivery_rating ?? 3.5;
  const availability = draft.availability_status;

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTES.menu);
  };

  if (isLoading && !profile) {
    return (
      <Screen>
        <LoadingState label="Loading your profile…" className="flex-1" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenScroll>
        <View className="gap-1.5 pt-1">
          <Text
            variant="label"
            weight="semibold"
            tone="accent"
            className="uppercase tracking-widest"
          >
            Berlin Food · Courier
          </Text>
          <Text variant="headline" weight="extrabold">
            Your profile
          </Text>
          <Text variant="body" tone="secondary">
            Manage how you appear to dispatch and customers.
          </Text>
        </View>

        {/* Brand hero */}
        <Card className="overflow-hidden bg-primary p-6">
          <View className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-on-primary/10" />
          <View className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-on-primary/10" />

          <View className="flex-row items-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-on-primary/20">
              <Text variant="title-lg" weight="extrabold" className="text-on-primary">
                {courierInitials(profile?.full_name)}
              </Text>
            </View>

            <View className="flex-1 gap-1.5">
              <Text variant="title-lg" weight="bold" className="text-on-primary">
                {displayName}
              </Text>
              <Text
                variant="caption"
                weight="semibold"
                className="uppercase tracking-widest text-on-primary/70"
              >
                Courier · {VEHICLE_LABEL[draft.vehicle_type]}
              </Text>

              <View className="flex-row flex-wrap items-center gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-on-primary/15 px-3 py-1">
                  <Ionicons name="star" size={12} color={tokens.onPrimary} />
                  <Text variant="label" weight="bold" className="text-on-primary">
                    {rating.toFixed(1)}
                  </Text>
                  {profile?.number_ratings != null ? (
                    <Text variant="caption" className="text-on-primary/70">
                      · {profile.number_ratings} ratings
                    </Text>
                  ) : null}
                </View>

                <View
                  className={cn(
                    'flex-row items-center gap-1.5 rounded-full px-3 py-1',
                    availability ? 'bg-success-container' : 'bg-surface-variant'
                  )}
                >
                  <View
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      availability ? 'bg-success' : 'bg-outline'
                    )}
                  />
                  <Text
                    variant="label"
                    weight="semibold"
                    className={
                      availability ? 'text-on-success-container' : 'text-on-surface-variant'
                    }
                  >
                    {availability ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Editable details */}
        <Card className="gap-5">
          <View className="gap-1">
            <Text variant="title" weight="bold">
              Personal details
            </Text>
            <Text variant="body-sm" tone="secondary">
              Keep your contact and vehicle up to date for smooth handoffs.
            </Text>
          </View>

          <Input
            label="Full name"
            value={draft.full_name}
            onChangeText={(value) => setField('full_name', value)}
            placeholder="Your full name"
            autoCapitalize="words"
            autoComplete="name"
          />

          <Input
            label="Phone number"
            value={draft.phone_number}
            onChangeText={(value) => setField('phone_number', value)}
            placeholder="+49 …"
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <View className="gap-2">
            <Text variant="label" weight="semibold" tone="secondary" className="ms-1">
              Vehicle type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {VEHICLE_OPTIONS.map((option) => {
                const selected = draft.vehicle_type === option.value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setField('vehicle_type', option.value)}
                    className={cn(
                      'min-w-[45%] flex-1 flex-row items-center gap-2 rounded-md px-4 py-3 active:opacity-80',
                      selected ? 'bg-accent-soft' : 'bg-surface-variant'
                    )}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={selected ? tokens.primary : tokens.onSurfaceVariant}
                    />
                    <Text
                      variant="body-sm"
                      weight="semibold"
                      className={selected ? 'text-on-accent-soft' : 'text-on-surface-variant'}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: availability }}
            accessibilityLabel={availability ? 'Available for deliveries' : 'Set as unavailable'}
            onPress={() => setField('availability_status', !availability)}
            className="flex-row items-center gap-3 rounded-md bg-surface-variant/70 p-4 active:opacity-80"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons
                name={availability ? 'bicycle' : 'moon-outline'}
                size={18}
                color={availability ? tokens.primary : tokens.onSurfaceVariant}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="body-sm" weight="semibold">
                Availability
              </Text>
              <Text variant="caption" tone="secondary">
                {availability ? 'Available for deliveries' : 'Not accepting deliveries'}
              </Text>
            </View>
            <AvailabilitySwitch checked={availability} />
          </Pressable>

          {notice ? <DeliveryNotice notice={notice} onDismiss={dismissNotice} /> : null}

          <Button block loading={isSaving} onPress={() => void save()}>
            Save changes
          </Button>
        </Card>

        {/* Read-only rating */}
        <Card className="gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="gap-1">
              <Text variant="title" weight="bold">
                Delivery rating
              </Text>
              <Text variant="body-sm" tone="secondary">
                Calculated from customer ratings.
              </Text>
            </View>
            <Badge tone="neutral">Read only</Badge>
          </View>

          <View className="flex-row items-center gap-3 rounded-md bg-surface-variant/70 p-4">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="star" size={20} color={tokens.primary} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-baseline gap-1">
                <Text variant="title-lg" weight="bold">
                  {rating.toFixed(1)}
                </Text>
                <Text variant="body-sm" weight="semibold" tone="secondary">
                  / 5.0
                </Text>
              </View>
              <Text variant="caption" tone="secondary">
                {profile?.number_ratings != null
                  ? `${profile.number_ratings} ratings`
                  : 'No ratings yet'}
              </Text>
            </View>
          </View>

          <Text variant="caption" tone="secondary" className="text-end">
            Last updated {formatDateTime(profile?.updated_at)}
          </Text>
        </Card>

        {/* Preferences */}
        <Card className="gap-4">
          <View className="gap-1">
            <Text variant="title" weight="bold">
              Appearance
            </Text>
            <Text variant="body-sm" tone="secondary">
              Follow your system or pick a theme for Berlin Food.
            </Text>
          </View>

          <ThemeToggle />

          <ListRow
            title="Sign out"
            subtitle="You will return to the public menu."
            destructive
            onPress={() => void handleSignOut()}
            leading={
              <View className="h-10 w-10 items-center justify-center rounded-full bg-error-container">
                <Ionicons name="log-out-outline" size={18} color={tokens.error} />
              </View>
            }
          />
        </Card>
      </ScreenScroll>
    </Screen>
  );
}

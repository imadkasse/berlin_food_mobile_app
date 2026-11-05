import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  FormMessage,
  StepProgress,
} from '@/features/auth/components/auth-ui';
import { useCustomerRegistration } from '@/features/auth/use-register';
import { useDeliveryLocation } from '@/features/auth/use-delivery-location';
import { isValidLatitude, isValidLongitude, parseCoordinate } from '@/features/auth/validation';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useOnboardingStore } from '@/stores/onboarding.store';

/**
 * Step 3 of customer sign-up.
 *
 * NOTE: the map picker is intentionally deferred — no map SDK has been chosen
 * for the mobile app yet. This screen uses the device's foreground location or
 * manually entered coordinates, which are enough for the profile trigger.
 */
export function RegisterAddressScreen() {
  const { tokens } = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const setAddress = useOnboardingStore((state) => state.setAddress);
  const resetDraft = useOnboardingStore((state) => state.reset);
  const registration = useCustomerRegistration();

  const location = useDeliveryLocation(draft.address);

  const [latitude, setLatitude] = useState(() =>
    draft.address ? draft.address.lat.toFixed(5) : ''
  );
  const [longitude, setLongitude] = useState(() =>
    draft.address ? draft.address.lng.toFixed(5) : ''
  );
  const [label, setLabel] = useState('');
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);
  const hasCoordinates = isValidLatitude(parsedLatitude) && isValidLongitude(parsedLongitude);

  const applyCurrentLocation = async () => {
    setCoordinateError(null);
    setFormError(null);

    const next = await location.requestLocation();

    if (next) {
      setLatitude(next.lat.toFixed(5));
      setLongitude(next.lng.toFixed(5));
    }
  };

  const finish = async () => {
    setFormError(null);

    if (!hasCoordinates) {
      setCoordinateError(
        'Enter a latitude between -90 and 90 and a longitude between -180 and 180.'
      );
      return;
    }

    setCoordinateError(null);

    if (!draft.full_name || !draft.phone_number || !draft.email || !draft.password) {
      setFormError('Your earlier details are missing. Go back and complete steps 1 and 2.');
      return;
    }

    setAddress({ lat: parsedLatitude, lng: parsedLongitude });

    const trimmedLabel = label.trim();
    const result = await registration.submit({
      email: draft.email,
      password: draft.password,
      fullName: draft.full_name,
      phoneNumber: draft.phone_number,
      address: {
        lat: parsedLatitude,
        lng: parsedLongitude,
        label: trimmedLabel || undefined,
        formatted: trimmedLabel
          ? `${trimmedLabel}, Berlin`
          : `${parsedLatitude.toFixed(5)}, ${parsedLongitude.toFixed(5)}`,
      },
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    resetDraft();
    router.replace(ROUTES.menu);
  };

  return (
    <AuthScreen title="Create account">
      <StepProgress step={3} />

      <AuthHeading
        eyebrow="Delivery address"
        title="Where should we set the table?"
        description="We only need the point on the map. Your street stays optional until checkout."
      />

      {formError ? <FormMessage message={formError} /> : null}

      <View className="gap-5 rounded-lg bg-surface p-5">
        <View className="flex-row items-center gap-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <Ionicons name="location-outline" size={20} color={tokens.onAccentSoft} />
          </View>
          <View className="flex-1 gap-1">
            <Text
              variant="label"
              weight="semibold"
              tone="secondary"
              className="uppercase tracking-widest"
            >
              Delivery location
            </Text>
            {hasCoordinates ? (
              <Text variant="body-lg" weight="semibold">
                {parsedLatitude.toFixed(5)}, {parsedLongitude.toFixed(5)}
              </Text>
            ) : (
              <Text variant="body" tone="secondary">
                No location chosen yet.
              </Text>
            )}
          </View>
        </View>

        <Button
          variant="primary"
          size="md"
          block
          loading={location.isLocating}
          onPress={() => {
            void applyCurrentLocation();
          }}
        >
          Use my current location
        </Button>

        {location.message ? (
          <Text variant="body-sm" tone="secondary">
            {location.message}
          </Text>
        ) : null}

        <Text variant="caption" tone="secondary">
          Map picking is on the way — for now the current location or the coordinates below are
          enough.
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Latitude"
              value={latitude}
              onChangeText={(value) => {
                setLatitude(value);
                setCoordinateError(null);
              }}
              placeholder="52.52000"
              keyboardType="decimal-pad"
              textAlign="left"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Longitude"
              value={longitude}
              onChangeText={(value) => {
                setLongitude(value);
                setCoordinateError(null);
              }}
              placeholder="13.40500"
              keyboardType="decimal-pad"
              textAlign="left"
            />
          </View>
        </View>

        {coordinateError ? (
          <Text variant="body-sm" tone="error" className="ms-1">
            {coordinateError}
          </Text>
        ) : null}

        <Input
          label="Label or street (optional)"
          value={label}
          onChangeText={setLabel}
          placeholder="Home — Torstraße 124"
          autoCapitalize="words"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
        />
      </View>

      <View className="gap-4">
        <Button
          block
          size="lg"
          loading={registration.isSubmitting}
          onPress={() => {
            void finish();
          }}
        >
          Finish sign-up
        </Button>

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          className="items-center"
          hitSlop={8}
        >
          <Text variant="body-sm" tone="secondary">
            Need to change something?{' '}
            <Text variant="body-sm" weight="semibold" tone="primary">
              Go back
            </Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

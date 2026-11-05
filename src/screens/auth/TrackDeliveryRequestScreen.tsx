import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, Button, EmptyState, Input, Text } from '@/components/ui';
import { AuthHeading, AuthScreen, FormMessage } from '@/features/auth/components/auth-ui';
import { toHref } from '@/features/auth/navigation';
import { useTrackDeliveryRequest } from '@/features/auth/use-delivery-request';
import { validateEmail } from '@/features/auth/validation';
import { ROUTES } from '@/navigation/routes';
import { DELIVERY_REQUEST_STATUS_LABEL, DELIVERY_REQUEST_STATUS_TONE } from '@/types/models';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TrackDeliveryRequestScreen() {
  const tracking = useTrackDeliveryRequest();
  const [emailError, setEmailError] = useState<string | null>(null);

  const search = () => {
    const nextError = validateEmail(tracking.email);
    setEmailError(nextError);

    if (nextError) return;

    void tracking.search();
  };

  return (
    <AuthScreen title="Couriers">
      <AuthHeading
        eyebrow="Track application"
        title="Where is my application?"
        description="Enter the email you applied with and we will show you the latest status."
      />

      <View className="gap-5">
        <Input
          label="Email address"
          value={tracking.email}
          onChangeText={(value) => {
            tracking.setEmail(value);
            setEmailError(null);
          }}
          placeholder="name@example.com"
          error={emailError ?? undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          onSubmitEditing={search}
        />

        <Button block size="lg" loading={tracking.isLoading} onPress={search}>
          Check status
        </Button>
      </View>

      {tracking.error ? <FormMessage message={tracking.error} /> : null}

      {tracking.notFound ? (
        <EmptyState
          title="No application found"
          message="We could not find an application with that email. Check the spelling or apply below — it only takes a minute."
          actionLabel="Apply as a courier"
          onAction={() => router.push(ROUTES.registerAsDelivery)}
        />
      ) : null}

      {tracking.request ? (
        <View className="gap-5 rounded-lg bg-surface p-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text
                variant="label"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Application
              </Text>
              <Text variant="title-lg" weight="bold">
                #{tracking.request.id.slice(0, 8)}
              </Text>
            </View>
            <Badge tone={DELIVERY_REQUEST_STATUS_TONE[tracking.request.status]}>
              {DELIVERY_REQUEST_STATUS_LABEL[tracking.request.status]}
            </Badge>
          </View>

          <View className="gap-3">
            <View className="gap-0.5">
              <Text
                variant="caption"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Name
              </Text>
              <Text variant="body-lg" weight="semibold">
                {tracking.request.full_name}
              </Text>
            </View>

            <View className="gap-0.5">
              <Text
                variant="caption"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Phone
              </Text>
              <Text variant="body" weight="medium">
                {tracking.request.phone_number ?? 'Not provided'}
              </Text>
            </View>

            <View className="gap-0.5">
              <Text
                variant="caption"
                weight="semibold"
                tone="secondary"
                className="uppercase tracking-widest"
              >
                Submitted
              </Text>
              <Text variant="body" weight="medium">
                {formatDate(tracking.request.created_at)}
              </Text>
            </View>
          </View>

          {tracking.request.status === 'pending' ? (
            <View className="rounded-md bg-surface-variant p-4">
              <Text variant="body-sm" tone="secondary">
                We are reviewing your application. You will hear from us within a few days.
              </Text>
            </View>
          ) : null}

          {tracking.request.status === 'rejected' ? (
            <View className="rounded-md bg-error-container p-4">
              <Text variant="body-sm" tone="error">
                This application was not approved. You are welcome to apply again with updated
                details.
              </Text>
            </View>
          ) : null}

          {tracking.request.status === 'approved' ? (
            <View className="gap-3 rounded-md bg-success-container p-4">
              <Text variant="body" weight="semibold" tone="success">
                You are approved. Finish your courier account to start riding.
              </Text>
              <Button
                size="md"
                block
                onPress={() =>
                  router.push(toHref(ROUTES.completeRegistration(tracking.request?.id ?? '')))
                }
              >
                Complete registration
              </Button>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push(ROUTES.registerAsDelivery)}
        accessibilityRole="button"
        className="items-center"
        hitSlop={8}
      >
        <Text variant="body-sm" tone="secondary">
          Not applied yet?{' '}
          <Text variant="body-sm" weight="semibold" tone="primary">
            Apply as a courier
          </Text>
        </Text>
      </Pressable>
    </AuthScreen>
  );
}

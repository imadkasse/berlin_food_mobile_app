import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, ErrorState, Input, LoadingState, Text } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  FormMessage,
  PasswordField,
} from '@/features/auth/components/auth-ui';
import {
  useCompleteDeliveryRegistration,
  useDeliveryRequestById,
  type DeliveryVehicle,
} from '@/features/auth/use-delivery-request';
import {
  isValidPhone,
  validateEmail,
  validatePassword,
  validateRequired,
} from '@/features/auth/validation';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES, type IoniconsName } from '@/navigation/routes';
import type { DeliveryRequest } from '@/types/models';
import { cn } from '@/utils/cn';

const VEHICLES: { value: DeliveryVehicle; label: string; icon: IoniconsName }[] = [
  { value: 'bicycle', label: 'Bicycle', icon: 'bicycle-outline' },
  { value: 'scooter', label: 'Scooter', icon: 'speedometer-outline' },
  { value: 'car', label: 'Car', icon: 'car-outline' },
  { value: 'van', label: 'Van', icon: 'bus-outline' },
];

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
};

function CompleteDeliveryForm({ request }: { request: DeliveryRequest }) {
  const { tokens } = useTheme();
  const completion = useCompleteDeliveryRegistration();

  const [fullName, setFullName] = useState(request.full_name);
  const [email, setEmail] = useState(request.email ?? '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(request.phone_number ?? '');
  const [address, setAddress] = useState('');
  const [vehicle, setVehicle] = useState<DeliveryVehicle>('bicycle');
  const [errors, setErrors] = useState<FormErrors>({});

  const submit = async () => {
    const nextErrors: FormErrors = {
      fullName: validateRequired(fullName, 'full name') ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password, 6) ?? undefined,
      phone: !phone.trim()
        ? 'Enter your phone number.'
        : isValidPhone(phone)
          ? undefined
          : 'Enter a valid phone number.',
      address: validateRequired(address, 'address') ?? undefined,
    };

    setErrors(nextErrors);

    if (
      nextErrors.fullName ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.phone ||
      nextErrors.address
    ) {
      return;
    }

    await completion.submit({
      fullName,
      email,
      password,
      phoneNumber: phone,
      address,
      vehicleType: vehicle,
    });
  };

  if (completion.isSuccess) {
    return (
      <View className="gap-7">
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-success-container">
            <Ionicons name="checkmark" size={28} color={tokens.onSuccessContainer} />
          </View>
          <AuthHeading
            eyebrow="You are in"
            title="Your courier account is ready."
            description="Sign in to see your dashboard, availability and assigned deliveries. If your email needs confirmation, check your inbox first."
          />
        </View>

        <Button block size="lg" onPress={() => router.replace(ROUTES.login)}>
          Go to sign in
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-7">
      <AuthHeading
        eyebrow="Final step"
        title={`Welcome, ${request.full_name.split(' ')[0]}.`}
        description="Set a password and tell us how you get around the city. You can change all of this later."
      />

      {completion.error ? <FormMessage message={completion.error} /> : null}

      <View className="gap-5">
        <Input
          label="Full name"
          value={fullName}
          onChangeText={(value) => {
            setFullName(value);
            setErrors((current) => ({ ...current, fullName: undefined }));
          }}
          placeholder="Lukas Schmidt"
          error={errors.fullName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />

        <Input
          label="Email address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          placeholder="name@example.com"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />

        <PasswordField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          hint="At least 6 characters."
          placeholder="Choose a password"
          autoComplete="new-password"
          textContentType="newPassword"
        />

        <Input
          label="Phone number"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setErrors((current) => ({ ...current, phone: undefined }));
          }}
          placeholder="+49 30 1234 5678"
          error={errors.phone}
          keyboardType="phone-pad"
          textAlign="left"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />

        <Input
          label="Address"
          value={address}
          onChangeText={(value) => {
            setAddress(value);
            setErrors((current) => ({ ...current, address: undefined }));
          }}
          placeholder="Street, number, postcode"
          error={errors.address}
          multiline
          numberOfLines={3}
          autoCapitalize="words"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
        />
      </View>

      <View className="gap-3">
        <Text
          variant="label"
          weight="semibold"
          tone="secondary"
          className="uppercase tracking-widest"
        >
          How do you deliver?
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {VEHICLES.map((option) => {
            const selected = vehicle === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => setVehicle(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={cn(
                  'min-w-[45%] flex-1 flex-row items-center gap-2 rounded-md p-4',
                  selected ? 'bg-primary' : 'bg-surface-variant'
                )}
              >
                <Ionicons
                  name={option.icon}
                  size={19}
                  color={selected ? tokens.onPrimary : tokens.onSurfaceVariant}
                />
                <Text variant="body-sm" weight="semibold" tone={selected ? 'inverse' : 'secondary'}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        block
        size="lg"
        loading={completion.isSubmitting}
        onPress={() => {
          void submit();
        }}
      >
        Create courier account
      </Button>

      <Pressable
        onPress={() => router.push(ROUTES.login)}
        accessibilityRole="button"
        className="items-center"
        hitSlop={8}
      >
        <Text variant="body-sm" tone="secondary">
          Already have an account?{' '}
          <Text variant="body-sm" weight="semibold" tone="primary">
            Sign in
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}

export function CompleteDeliveryRegistrationScreen() {
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId;
  const { request, isLoading, notFound, error, reload } = useDeliveryRequestById(requestId);

  return (
    <AuthScreen title="Couriers">
      {isLoading ? <LoadingState label="Loading your application…" /> : null}

      {!isLoading && error ? (
        <ErrorState
          title="We could not load this application"
          message={error}
          retryLabel="Try again"
          onRetry={reload}
        />
      ) : null}

      {!isLoading && !error && notFound ? (
        <View className="gap-7">
          <View className="items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-error-container">
              <Text variant="title-lg" weight="bold" tone="error">
                !
              </Text>
            </View>
            <AuthHeading
              eyebrow="Application unavailable"
              title="This link has expired."
              description="We could not find an application for this link. It may have already been completed, or the link may be incomplete."
            />
          </View>

          <View className="gap-3">
            <Button block size="lg" onPress={() => router.push(ROUTES.trackDeliveryRequest)}>
              Track my application
            </Button>
            <Button
              variant="ghost"
              size="md"
              block
              onPress={() => router.push(ROUTES.registerAsDelivery)}
            >
              Apply as a courier
            </Button>
          </View>
        </View>
      ) : null}

      {!isLoading && !error && request && request.status !== 'approved' ? (
        <View className="gap-7">
          <AuthHeading
            eyebrow="Not ready yet"
            title="This application is still being reviewed."
            description="We can only create your courier account once an administrator has approved the application."
          />
          <Button block size="lg" onPress={() => router.push(ROUTES.trackDeliveryRequest)}>
            Check application status
          </Button>
        </View>
      ) : null}

      {!isLoading && !error && request && request.status === 'approved' ? (
        <CompleteDeliveryForm key={request.id} request={request} />
      ) : null}
    </AuthScreen>
  );
}

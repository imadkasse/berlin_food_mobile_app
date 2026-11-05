import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { AuthHeading, AuthScreen, StepProgress } from '@/features/auth/components/auth-ui';
import { isValidPhone, validateRequired } from '@/features/auth/validation';
import { ROUTES } from '@/navigation/routes';
import { useOnboardingStore } from '@/stores/onboarding.store';

type DetailsErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export function RegisterDetailsScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const setDetails = useOnboardingStore((state) => state.setDetails);

  const [firstName, setFirstName] = useState(() => {
    const parts = draft.full_name.trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(0, -1).join(' ') : (parts[0] ?? '');
  });
  const [lastName, setLastName] = useState(() => {
    const parts = draft.full_name.trim().split(/\s+/);
    return parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
  });
  const [phone, setPhone] = useState(draft.phone_number);
  const [errors, setErrors] = useState<DetailsErrors>({});

  const submit = () => {
    const nextErrors: DetailsErrors = {
      firstName: validateRequired(firstName, 'first name') ?? undefined,
      lastName: validateRequired(lastName, 'last name') ?? undefined,
      phone: !phone.trim()
        ? 'Enter your phone number.'
        : isValidPhone(phone)
          ? undefined
          : 'Enter a valid phone number.',
    };

    setErrors(nextErrors);

    if (nextErrors.firstName || nextErrors.lastName || nextErrors.phone) {
      return;
    }

    setDetails({
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      phone_number: phone.trim(),
    });

    router.push(ROUTES.registerContact);
  };

  return (
    <AuthScreen title="Create account">
      <StepProgress step={1} />

      <AuthHeading
        eyebrow="Personal details"
        title="Let's start with you."
        description="We use your name for the order and your number only when the courier is close."
      />

      <View className="gap-5">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="First name"
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                setErrors((current) => ({ ...current, firstName: undefined }));
              }}
              placeholder="Lena"
              error={errors.firstName}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Last name"
              value={lastName}
              onChangeText={(value) => {
                setLastName(value);
                setErrors((current) => ({ ...current, lastName: undefined }));
              }}
              placeholder="Hoffmann"
              error={errors.lastName}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
            />
          </View>
        </View>

        <Input
          label="Phone number"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setErrors((current) => ({ ...current, phone: undefined }));
          }}
          placeholder="+49 30 1234 5678"
          error={errors.phone}
          hint="Include your country code so we can reach you."
          keyboardType="phone-pad"
          textAlign="left"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>

      <View className="gap-4">
        <Button block size="lg" onPress={submit}>
          Continue
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
    </AuthScreen>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  PasswordField,
  StepProgress,
} from '@/features/auth/components/auth-ui';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/features/auth/validation';
import { ROUTES } from '@/navigation/routes';
import { useOnboardingStore } from '@/stores/onboarding.store';

type AccountErrors = {
  email?: string;
  password?: string;
  confirmation?: string;
};

export function RegisterAccountScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const setAccount = useOnboardingStore((state) => state.setAccount);

  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState(draft.password);
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<AccountErrors>({});

  const submit = () => {
    const nextErrors: AccountErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password, 8) ?? undefined,
      confirmation: validatePasswordConfirmation(password, confirmation) ?? undefined,
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password || nextErrors.confirmation) {
      return;
    }

    setAccount({ email: email.trim(), password });
    router.push(ROUTES.registerAddress);
  };

  return (
    <AuthScreen title="Create account">
      <StepProgress step={2} />

      <AuthHeading
        eyebrow="Account setup"
        title="Make it yours."
        description="Your email signs you in and your password keeps the table reserved."
      />

      <View className="gap-5">
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
            setErrors((current) => ({ ...current, password: undefined, confirmation: undefined }));
          }}
          error={errors.password}
          hint="At least 8 characters."
          placeholder="Choose a password"
          autoComplete="new-password"
          textContentType="newPassword"
        />

        <PasswordField
          label="Confirm password"
          value={confirmation}
          onChangeText={(value) => {
            setConfirmation(value);
            setErrors((current) => ({ ...current, confirmation: undefined }));
          }}
          error={errors.confirmation}
          placeholder="Repeat your password"
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>

      <View className="gap-4">
        <Button block size="lg" onPress={submit}>
          Continue
        </Button>

        <Pressable
          onPress={() => router.push(ROUTES.register)}
          accessibilityRole="button"
          className="items-center"
          hitSlop={8}
        >
          <Text variant="body-sm" tone="secondary">
            Need to change your details?{' '}
            <Text variant="body-sm" weight="semibold" tone="primary">
              Go back
            </Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

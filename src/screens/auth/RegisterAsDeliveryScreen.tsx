import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import {
  AuthHeading,
  AuthScreen,
  BrandMark,
  FormMessage,
} from '@/features/auth/components/auth-ui';
import { toHref } from '@/features/auth/navigation';
import { useDeliveryApplication } from '@/features/auth/use-delivery-request';
import { isValidPhone, validateEmail, validateRequired } from '@/features/auth/validation';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';

type ApplicationErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
};

export function RegisterAsDeliveryScreen() {
  const { tokens } = useTheme();
  const application = useDeliveryApplication();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<ApplicationErrors>({});

  const submit = async () => {
    const nextErrors: ApplicationErrors = {
      fullName: validateRequired(fullName, 'full name') ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: !phone.trim()
        ? 'Enter your phone number.'
        : isValidPhone(phone)
          ? undefined
          : 'Enter a valid phone number.',
    };

    setErrors(nextErrors);

    if (nextErrors.fullName || nextErrors.email || nextErrors.phone) {
      return;
    }

    await application.submit({
      full_name: fullName,
      email,
      phone_number: phone,
    });
  };

  if (application.isSubmitted) {
    return (
      <AuthScreen title="Couriers">
        <View className="items-center pt-4">
          <BrandMark size="lg" />
        </View>

        <View className="gap-7">
          <View className="items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success-container">
              <Ionicons name="checkmark" size={28} color={tokens.onSuccessContainer} />
            </View>
            <AuthHeading
              eyebrow="Application received"
              title="Thank you, we have your details."
              description="Our team reviews courier applications within a few days. You can check the status any time with the email you used."
            />
          </View>

          <View className="gap-3">
            <Button block size="lg" onPress={() => router.push(ROUTES.trackDeliveryRequest)}>
              Track my application
            </Button>
            <Button variant="ghost" size="md" block onPress={() => router.replace(ROUTES.landing)}>
              Back to home
            </Button>
          </View>
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Couriers">
      <View className="items-center pt-4">
        <BrandMark size="lg" />
      </View>

      <AuthHeading
        eyebrow="Courier application"
        title="Ride with Berlin Food."
        description="Flexible evenings, fair pay and routes that fit your life. Apply in a couple of minutes — no CV needed."
      />

      {application.error ? <FormMessage message={application.error} /> : null}

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
        <Button
          block
          size="lg"
          loading={application.isSubmitting}
          onPress={() => {
            void submit();
          }}
        >
          Send application
        </Button>

        <Pressable
          onPress={() => router.push(ROUTES.trackDeliveryRequest)}
          accessibilityRole="button"
          className="items-center"
          hitSlop={8}
        >
          <Text variant="body-sm" tone="secondary">
            Already applied?{' '}
            <Text variant="body-sm" weight="semibold" tone="primary">
              Track your application
            </Text>
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(toHref(ROUTES.register))}
          accessibilityRole="button"
          className="items-center"
          hitSlop={8}
        >
          <Text variant="body-sm" weight="semibold" tone="secondary">
            Looking to order? Create a customer account
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

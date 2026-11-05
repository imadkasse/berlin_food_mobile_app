import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, View } from 'react-native';

import { AppHeader, ListRow, SectionHeader } from '@/components/navigation';
import { ScreenScroll } from '@/components/navigation/Screen';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button, Card, Input, Text } from '@/components/ui';
import { getInitials } from '@/features/menu/utils';
import { formatAddress, parseAddresses } from '@/features/profile/addresses';
import { PersonalDetailsCard } from '@/features/profile/PersonalDetailsCard';
import { usePasswordUpdate } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';
import { ROLE_LABEL } from '@/types/models';

/** Signed-in customer profile: details, addresses, security and appearance. */
export function ProfileScreen() {
  const { profile, role, refreshProfile, signOut } = useSession();
  const { tokens } = useTheme();

  const password = usePasswordUpdate();

  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const addresses = useMemo(() => parseAddresses(profile?.address), [profile?.address]);
  const primaryAddress = addresses[0] ?? null;

  const displayName = profile?.full_name?.trim() || 'Berlin Food customer';
  const initials = getInitials(profile?.full_name);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace(ROUTES.menu);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Profile" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenScroll
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={tokens.primary}
              colors={[tokens.primary]}
              progressBackgroundColor={tokens.surfaceRaised}
            />
          }
        >
          <SectionHeader
            eyebrow="Account"
            title="Your Berlin Food"
            description="Keep your details current so every delivery arrives smoothly."
          />

          <Card className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
              <Text variant="title-lg" weight="bold" tone="primary">
                {initials}
              </Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text variant="title" weight="bold" numberOfLines={1}>
                {displayName}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {ROLE_LABEL[role]}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {profile?.phone_number || 'No phone added'}
              </Text>
            </View>
          </Card>

          <View className="gap-3">
            <SectionHeader
              title="Personal details"
              description="Used on your orders and receipts."
            />
            {/* Remount only when the profile row first becomes available, so
                the draft seeds from it without wiping save feedback later. */}
            <PersonalDetailsCard key={profile?.id ?? 'pending'} />
          </View>

          <View className="gap-3">
            <SectionHeader
              title="Delivery addresses"
              description="Where your orders should arrive."
            />
            <Card className="gap-3">
              {primaryAddress ? (
                <View className="flex-row items-start gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
                    <Ionicons name="home-outline" size={20} color={tokens.primary} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text variant="body-lg" weight="semibold">
                      {primaryAddress.label}
                    </Text>
                    <Text variant="body-sm" tone="secondary">
                      {formatAddress(primaryAddress)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text variant="body-sm" tone="secondary">
                  No address saved yet. Add one so checkout is a single tap.
                </Text>
              )}

              <ListRow
                title="Manage delivery addresses"
                subtitle={`${addresses.length} ${addresses.length === 1 ? 'address' : 'addresses'} saved`}
                leading={<Ionicons name="map-outline" size={20} color={tokens.onSurfaceVariant} />}
                onPress={() => router.push(ROUTES.addresses)}
              />
            </Card>
          </View>

          <View className="gap-3">
            <SectionHeader title="Security" description="Change the password for this account." />
            <Card className="gap-4">
              <Input
                label="New password"
                placeholder="••••••••"
                value={password.newPassword}
                onChangeText={password.setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                hint="At least 6 characters."
              />

              <Input
                label="Confirm password"
                placeholder="••••••••"
                value={password.confirmPassword}
                onChangeText={password.setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />

              {password.error ? (
                <Text variant="body-sm" tone="error">
                  {password.error}
                </Text>
              ) : password.success ? (
                <Text variant="body-sm" tone="success">
                  {password.success}
                </Text>
              ) : null}

              <Button
                block
                variant="tonal"
                loading={password.isSaving}
                onPress={() => void password.updatePassword()}
                accessibilityLabel="Update password"
              >
                Update password
              </Button>
            </Card>
          </View>

          <View className="gap-3">
            <SectionHeader title="Appearance" description="Berlin Food follows your preference." />
            <Card>
              <ThemeToggle />
            </Card>
          </View>

          <Button
            block
            variant="destructive"
            size="lg"
            loading={signingOut}
            onPress={() => void handleSignOut()}
            accessibilityLabel="Sign out"
          >
            Sign out
          </Button>
        </ScreenScroll>
      </KeyboardAvoidingView>
    </View>
  );
}

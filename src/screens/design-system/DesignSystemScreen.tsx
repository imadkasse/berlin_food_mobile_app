import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  Text,
} from '@/components/ui';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

/**
 * Living style guide for the Berlin Food design system. It exercises every
 * base component in both themes and doubles as the milestone-2 verification
 * surface. Real screens replace this in later milestones.
 */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    // The no-line rule: sections are separated by whitespace and tone only.
    <View className="gap-3">
      <View className="gap-1 px-1">
        <Text variant="title" weight="bold">
          {title}
        </Text>
        {description ? (
          <Text variant="body-sm" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function DesignSystemScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-10 px-5 pb-16 pt-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View className="gap-4">
          <View className="gap-1">
            <Text variant="label" weight="semibold" tone="accent" className="uppercase">
              Design system
            </Text>
            <Text variant="display" weight="extrabold" tone="primary">
              Berlin Food
            </Text>
            <Text variant="body-lg" tone="secondary">
              Warm minimalism, premium delivery.
            </Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Typography */}
        <Section title="Typography" description="Plus Jakarta Sans — the editorial type scale.">
          <Card>
            <View className="gap-2">
              <Text variant="display" weight="extrabold">
                Display 40
              </Text>
              <Text variant="headline" weight="bold">
                Headline 32
              </Text>
              <Text variant="title-lg" weight="bold">
                Title large 24
              </Text>
              <Text variant="title" weight="semibold">
                Title 20
              </Text>
              <Text variant="body-lg">Body large 17</Text>
              <Text variant="body">Body 15</Text>
              <Text variant="body-sm" tone="secondary">
                Body small 13
              </Text>
              <Text variant="label" weight="semibold" tone="primary">
                LABEL 12
              </Text>
              <Text variant="caption" tone="secondary">
                Caption 11
              </Text>
            </View>
          </Card>
        </Section>

        {/* Surfaces — tonal depth */}
        <Section title="Surfaces" description="Depth through tone, never lines.">
          <View className="gap-3">
            <Card>
              <Text variant="label" weight="semibold" tone="secondary">
                BACKGROUND
              </Text>
            </Card>
            <Card>
              <Text variant="label" weight="semibold" tone="secondary">
                SURFACE — CARD
              </Text>
              <View className="mt-3 gap-3">
                <Card variant="tonal" compact>
                  <Text variant="body-sm" tone="secondary">
                    Surface variant — tonal group
                  </Text>
                </Card>
                <Card variant="raised" compact>
                  <Text variant="body-sm" tone="secondary">
                    Surface raised — elevated layer
                  </Text>
                </Card>
              </View>
            </Card>
          </View>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" description="Every variant, size and state.">
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="tonal">Tonal</Button>
            </View>
            <View className="flex-row flex-wrap gap-3">
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
              <Button disabled>Disabled</Button>
            </View>
            <Button
              size="lg"
              block
              loading={loading}
              onPress={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              Place order
            </Button>
          </View>
        </Section>

        {/* Inputs */}
        <Section title="Inputs" description="Tonal fields with focus and error states.">
          <Card>
            <View className="gap-4">
              <Input
                label="Email"
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                hint="We never share your email."
              />
              <Input
                label="Delivery note"
                placeholder="Ring the bell twice…"
                multiline
                hint="Optional — shown to your courier."
              />
              <Input
                label="Promo code"
                placeholder="BERLIN10"
                error="This code is not valid anymore."
                defaultValue="BERLIN10"
              />
            </View>
          </Card>
        </Section>

        {/* Badges */}
        <Section title="Badges" description="Tonal status pills for order states.">
          <View className="flex-row flex-wrap gap-2">
            <Badge tone="neutral">Pending</Badge>
            <Badge tone="accent">Preparing</Badge>
            <Badge tone="primary">On the way</Badge>
            <Badge tone="success">Delivered</Badge>
            <Badge tone="error">Cancelled</Badge>
          </View>
        </Section>

        {/* Composition — a taste of the menu experience */}
        <Section title="Composition" description="Tokens composed into a menu item.">
          <Card onPress={() => setModalVisible(true)}>
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-md bg-accent-soft">
                <Text variant="title-lg" weight="bold" tone="primary">
                  BF
                </Text>
              </View>
              <View className="flex-1 gap-1">
                <Text variant="title" weight="bold">
                  Berliner Teller
                </Text>
                <Text variant="body-sm" tone="secondary" numberOfLines={2}>
                  Currywurst, hand-cut fries and a house dip — the city on one plate.
                </Text>
                <View className="flex-row items-center justify-between pt-1">
                  <Text variant="title" weight="bold" tone="primary">
                    €12.50
                  </Text>
                  <Badge tone="success">Available</Badge>
                </View>
              </View>
            </View>
          </Card>
        </Section>

        {/* States */}
        <Section title="States" description="Loading, empty and error blocks.">
          <Card>
            <LoadingState label="Loading the menu…" />
          </Card>
          <Card>
            <EmptyState
              title="No orders yet"
              message="Your first Berlin Food order will appear here."
              actionLabel="Browse the menu"
              onAction={() => {}}
            />
          </Card>
          <Card>
            <ErrorState
              message="We could not reach the kitchen. Check your connection."
              onRetry={() => {}}
            />
          </Card>
        </Section>

        <View className="items-center gap-2 pt-2">
          <Link href="/">
            <Text variant="label" weight="semibold" tone="primary">
              Back to the app
            </Text>
          </Link>
          <Text variant="caption" tone="secondary" className="text-center">
            Berlin Food · Design system preview
          </Text>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Add to cart?">
        <Text variant="body" tone="secondary">
          Berliner Teller — €12.50
        </Text>
        <View className="flex-row justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
          <Button size="sm" onPress={() => setModalVisible(false)}>
            Add
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

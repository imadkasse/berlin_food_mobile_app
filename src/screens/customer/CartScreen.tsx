import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { AppHeader, SectionHeader } from '@/components/navigation';
import { Button, Card, EmptyState, Modal, Text } from '@/components/ui';
import { CartLineItem } from '@/features/cart/CartLineItem';
import { CheckoutModal } from '@/features/cart/CheckoutModal';
import { usePlaceOrder } from '@/features/cart/use-checkout';
import { formatPrice } from '@/features/menu/utils';
import { parseAddresses } from '@/features/profile/addresses';
import { ROUTES } from '@/navigation/routes';
import { useSession } from '@/providers/SessionProvider';
import { DELIVERY_FEE, selectSubtotal, useCartStore, VAT_RATE } from '@/stores/cart.store';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text variant="body" tone="secondary">
        {label}
      </Text>
      <Text variant="body" weight="semibold">
        {value}
      </Text>
    </View>
  );
}

/**
 * Cart — available to guests, exactly like the web app. Placing an order needs
 * a signed-in customer so `customer_id` and a saved address are present.
 */
export function CartScreen() {
  const items = useCartStore((state) => state.items);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectSubtotal);

  const { profile, isSignedIn, session } = useSession();
  const { placeOrder, isSubmitting, error, clearError } = usePlaceOrder();

  const addresses = useMemo(() => parseAddresses(profile?.address), [profile?.address]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  // Kept for web parity; the note is never persisted because `orders` has no
  // note column. Never invent one — see CheckoutModal.
  const [orderNote, setOrderNote] = useState('');

  const taxes = subtotal * VAT_RATE;
  const total = subtotal + DELIVERY_FEE + taxes;

  const openCheckout = () => {
    clearError();
    setSelectedAddressId(addresses[0]?.id ?? null);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    if (isSubmitting) return;
    setCheckoutOpen(false);
  };

  const handleConfirm = async () => {
    const address = addresses.find((entry) => entry.id === selectedAddressId);
    const customerId = session?.user.id;

    if (!address || !customerId) return;

    const orderId = await placeOrder({ customerId, address, items, total });
    if (!orderId) return;

    clearCart();
    setOrderNote('');
    setCheckoutOpen(false);
    setSuccessOrderId(orderId);
  };

  const handleSuccessContinue = () => {
    setSuccessOrderId(null);
    router.replace(isSignedIn ? ROUTES.orders : ROUTES.login);
  };

  const handleBackToMenu = () => {
    setSuccessOrderId(null);
    router.navigate(ROUTES.menu);
  };

  const summary = (
    <Card className="mt-2 gap-5">
      <Text variant="title" weight="bold">
        Order summary
      </Text>

      <View className="gap-3">
        <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        <SummaryRow label="Delivery fee" value={formatPrice(DELIVERY_FEE)} />
        {VAT_RATE > 0 ? <SummaryRow label="VAT" value={formatPrice(taxes)} /> : null}
      </View>

      <View className="flex-row items-end justify-between gap-3">
        <Text variant="body-lg" weight="semibold">
          Total
        </Text>
        <Text variant="title-lg" weight="bold" tone="primary">
          {formatPrice(total)}
        </Text>
      </View>

      <View className="gap-2">
        <Button block size="lg" onPress={openCheckout}>
          Place order
        </Button>
        <Button block variant="ghost" onPress={() => router.navigate(ROUTES.menu)}>
          Add more items
        </Button>
      </View>

      <Text variant="caption" tone="secondary" className="text-center">
        Pay on delivery · Prices include the flat delivery fee
      </Text>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Cart" />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartLineItem
            item={item}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
            onRemove={removeItem}
          />
        )}
        contentContainerClassName="gap-4 px-5 pb-28 pt-4"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <SectionHeader
            eyebrow="Your selection"
            title={items.length > 0 ? 'Almost at your door' : 'Your cart'}
            description={
              items.length > 0
                ? 'Adjust quantities and confirm where it should arrive.'
                : 'Good food is only a few taps away.'
            }
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Your cart is empty"
            message="Browse the menu and add something you fancy."
            actionLabel="Browse the menu"
            onAction={() => router.navigate(ROUTES.menu)}
          />
        }
        ListFooterComponent={items.length > 0 ? summary : undefined}
      />

      <CheckoutModal
        visible={checkoutOpen}
        onClose={closeCheckout}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setSelectedAddressId}
        isSignedIn={isSignedIn}
        isSubmitting={isSubmitting}
        error={error}
        note={orderNote}
        onChangeNote={setOrderNote}
        onConfirm={() => void handleConfirm()}
        onSignIn={() => {
          setCheckoutOpen(false);
          router.push(ROUTES.login);
        }}
        onManageAddresses={() => {
          setCheckoutOpen(false);
          router.push(ROUTES.addresses);
        }}
      />

      <Modal visible={successOrderId !== null} onClose={handleSuccessContinue} title="Order placed">
        <Text variant="body" tone="secondary">
          Your order #{successOrderId?.slice(0, 6).toUpperCase()} is with the kitchen. We will let
          you know as soon as it moves.
        </Text>

        <View className="gap-2 pt-1">
          <Button block size="lg" onPress={handleSuccessContinue}>
            {isSignedIn ? 'View my orders' : 'Sign in to track it'}
          </Button>
          <Button block variant="ghost" onPress={handleBackToMenu}>
            Back to the menu
          </Button>
        </View>
      </Modal>
    </View>
  );
}

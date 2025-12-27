import CustomButton from '@/components/CustomButton';
import CustomHeader from '@/components/CustomHeader';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { createPaymentIntent } from '@/lib/stripe';
import useAuthStore from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentScreen = () => {
  const { amount, items } = useLocalSearchParams<{ amount: string; items: string }>();
  const [loading, setLoading] = useState(false);
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      
      // Call API to create payment intent
      const data = await createPaymentIntent({
        amount: parseFloat(amount || '0'),
        currency: 'usd',
        customerEmail: user?.email,
        customerName: user?.name,
      });

      if (!data) {
        return;
      }

      const { paymentIntent, customerSessionClientSecret } = data;

      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Food Delivery App',
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: customerSessionClientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user?.name,
          email: user?.email,
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPaymentSheetEnabled(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const handlePayment = async () => {
    if (!paymentSheetEnabled) {
      Alert.alert('Error', 'Payment sheet not ready');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else {
        // Send order confirmation email
        try {
          await sendOrderConfirmationEmail({
            email: user?.email || '',
            name: user?.name || 'Customer',
            orderDetails: {
              items: items || '0',
              amount: amount || '0',
              orderDate: new Date().toLocaleString(),
            },
          });
          console.log('Order confirmation email sent successfully');
        } catch (emailError: any) {
          console.error('Failed to send confirmation email:', emailError);
        }

        Alert.alert(
          'Payment Successful',
          'Your order has been placed successfully! A confirmation email has been sent to your email address.',
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.replace('/(tabs)');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 py-4 border-b border-gray-100">
        <CustomHeader title="Payment" />
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        <View className="bg-gray-50 rounded-2xl p-5 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-base text-gray-600">Total Items</Text>
            <Text className="text-base font-semibold text-gray-900">
              {items}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-base text-gray-600">Amount to Pay</Text>
            <Text className="text-xl font-bold text-orange-500">
              ${amount}
            </Text>
          </View>
        </View>

        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <Text className="text-sm text-blue-800 mb-2 font-semibold">
            🔒 Secure Payment
          </Text>
          <Text className="text-xs text-blue-600">
            Your payment information is encrypted and secure with Stripe.
          </Text>
        </View>

        {loading ? (
          <View className="flex items-center justify-center py-10">
            <ActivityIndicator size="large" color="#FF9500" />
            <Text className="mt-4 text-gray-600">
              {paymentSheetEnabled ? 'Processing...' : 'Preparing payment...'}
            </Text>
          </View>
        ) : (
          <CustomButton
            title="Pay Now"
            onPress={handlePayment}
            isLoading={loading}
          />
        )}

        <CustomButton
          title="Cancel"
          onPress={() => router.back()}
          style="mt-3 !bg-gray-200"
          textStyle="!text-gray-700"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Wrapper component with StripeProvider
const Payment = () => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  if (!publishableKey) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-5">
        <Text className="text-red-500 text-center text-lg font-semibold">
          Stripe publishable key is missing
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Please add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env file
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <PaymentScreen />
    </StripeProvider>
  );
};

export default Payment;

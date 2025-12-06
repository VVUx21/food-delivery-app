import { Alert } from 'react-native';

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
}

interface PaymentIntentResponse {
  paymentIntent: string;
  customerSessionClientSecret: string;
  customer: string;
  publishableKey: string;
}

export const createPaymentIntent = async (
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse | null> => {
  try {

    const response = await fetch(`/api/stripe-server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'usd',
        customerEmail: params.customerEmail,
        customerName: params.customerName,
      }),
    });

    const data = await response.json();

    if (data.error) {
      Alert.alert('Error', data.error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Payment Intent Creation Error:', error);
    Alert.alert('Error', error.message || 'Failed to create payment intent');
    return null;
  }
};

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

export const formatDisplayAmount = (amount: number): string => {
  return `$${(amount / 100).toFixed(2)}`;
};

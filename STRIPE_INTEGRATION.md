# Stripe Payment Integration Guide

This guide explains how to set up and use Stripe payments in the Food Delivery App.

## Prerequisites

1. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
2. **Stripe Keys**: Get your publishable and secret keys from the Stripe Dashboard

## Setup Instructions

### 1. Install Dependencies

The required packages are already installed:
- `stripe` - For server-side API
- `@stripe/stripe-react-native` - For React Native integration

### 2. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
EXPO_STRIPE_SECRET_KEY=sk_test_your_secret_key

# API URL (your backend server URL)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

⚠️ **Important**: 
- Use **test keys** (pk_test_... and sk_test_...) for development
- Never commit your `.env` file to version control
- The secret key should ONLY be used on the server side

### 3. Backend API Setup

The Stripe API endpoint is located at `/app/api/stripe-server-api.ts`. This handles:
- Creating Stripe customers
- Generating customer sessions
- Creating payment intents

**API Endpoint**: `POST /api/stripe-server-api`

**Request Body**:
```json
{
  "amount": 29.50,
  "currency": "usd",
  "customerEmail": "user@example.com",
  "customerName": "John Doe"
}
```

**Response**:
```json
{
  "paymentIntent": "pi_xxx_secret_xxx",
  "customerSessionClientSecret": "cuss_xxx",
  "customer": "cus_xxx",
  "publishableKey": "pk_test_xxx"
}
```

### 4. Payment Flow

The payment flow is implemented as follows:

1. **Cart Screen** (`app/(tabs)/cart.tsx`):
   - User views cart items and total
   - Clicks "Proceed to Payment"
   - Redirects to payment screen with amount and item count

2. **Payment Screen** (`app/payment.tsx`):
   - Initializes Stripe Payment Sheet
   - Calls backend API to create payment intent
   - Presents Stripe payment UI
   - Handles payment success/failure

3. **Helper Functions** (`lib/stripe.ts`):
   - `createPaymentIntent()` - Creates payment intent via API
   - `formatAmountForStripe()` - Converts dollars to cents
   - `formatDisplayAmount()` - Formats cents to display string

## Usage

### From Cart Screen

```typescript
import { useCartStore } from '@/store/cart.store';
import { router } from 'expo-router';

const Cart = () => {
  const { getTotalPrice, getTotalItems } = useCartStore();
  
  const handlePayment = () => {
    const total = getTotalPrice() + 5.00 - 0.50; // Add fees
    router.push({
      pathname: '/payment',
      params: {
        amount: total.toFixed(2),
        items: getTotalItems().toString(),
      }
    });
  };
  
  return <CustomButton title="Proceed to Payment" onPress={handlePayment} />;
};
```

### Custom Payment Integration

```typescript
import { createPaymentIntent } from '@/lib/stripe';
import { useStripe } from '@stripe/stripe-react-native';

const MyComponent = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const handlePayment = async (amount: number) => {
    // 1. Create payment intent
    const data = await createPaymentIntent({
      amount,
      currency: 'usd',
      customerEmail: 'user@example.com',
      customerName: 'John Doe',
    });
    
    if (!data) return;
    
    // 2. Initialize payment sheet
    await initPaymentSheet({
      merchantDisplayName: 'Food Delivery App',
      paymentIntentClientSecret: data.paymentIntent,
      customerEphemeralKeySecret: data.customerSessionClientSecret,
    });
    
    // 3. Present payment sheet
    const { error } = await presentPaymentSheet();
    
    if (!error) {
      console.log('Payment successful!');
    }
  };
};
```

## Testing

### Test Cards

Use these test card numbers in development:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Security Best Practices

1. ✅ **Never expose secret key** - Only use on server
2. ✅ **Validate amounts** - Always validate on server side
3. ✅ **Use HTTPS** - In production, ensure API uses HTTPS
4. ✅ **Handle errors** - Implement proper error handling
5. ✅ **Test thoroughly** - Use test mode before going live

## Deployment

### Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update `EXPO_PUBLIC_API_URL` to production URL
- [ ] Enable HTTPS for API endpoint
- [ ] Test with real cards
- [ ] Set up webhook handlers (optional)
- [ ] Configure Stripe Dashboard settings

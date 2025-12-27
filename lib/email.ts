import { Resend } from 'resend';

const resend = new Resend(process.env.EXPO_PUBLIC_RESEND_API_KEY!);

interface OrderConfirmationParams {
  email: string;
  name: string;
  orderDetails: {
    items: string;
    amount: string;
    orderDate: string;
  };
}

export const sendOrderConfirmationEmail = async (params: OrderConfirmationParams) => {
  try {
    const { email, name, orderDetails } = params;
    const response = await resend.emails.send({
      from: 'Food Delivery App <onboarding@resend.dev>', // Change this to your verified domain
      to: email,
      subject: 'Order Confirmation - Thank You for Your Order!',
      html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9500; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        .amount { color: #FF9500; font-size: 24px; font-weight: bold; }
        .success-icon { font-size: 48px; text-align: center; color: #4CAF50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍔 Food Delivery App</h1>
        </div>
        <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="text-align: center; color: #4CAF50;">Order Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for your order! We're excited to prepare your delicious meal.</p>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
                <p><strong>Total Items:</strong> ${orderDetails.items}</p>
                <p><strong>Amount Paid:</strong> <span class="amount">$${orderDetails.amount}</span></p>
            </div>

            <p>Your order is being prepared and will be delivered soon. We'll notify you when it's on the way!</p>
            
            <p style="margin-top: 20px;">
                <strong>Need Help?</strong><br>
                If you have any questions about your order, please don't hesitate to contact our support team.
            </p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Food Delivery App. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
Hi ${name},

Thank you for your order! We're excited to prepare your delicious meal.

ORDER DETAILS
--------------
Order Date: ${orderDetails.orderDate}
Total Items: ${orderDetails.items}
Amount Paid: $${orderDetails.amount}

Your order is being prepared and will be delivered soon. We'll notify you when it's on the way!

Need Help?
If you have any questions about your order, please contact our support team.

---
This is an automated message, please do not reply to this email.
© ${new Date().getFullYear()} Food Delivery App. All rights reserved.
      `,
    });

    console.log('Order confirmation email sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error);
    throw new Error(`Failed to send order confirmation email: ${error.message}`);
  }
};

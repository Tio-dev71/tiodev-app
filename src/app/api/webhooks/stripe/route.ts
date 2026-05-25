// POST /api/webhooks/stripe — Stripe webhook handler
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { appendOrderToSheet } from '@/lib/google-sheets';
import { sendOrderConfirmation } from '@/lib/email';
import { sendDiscordNotification } from '@/lib/discord';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Update order status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paymentId: session.payment_intent as string },
        include: { items: { include: { product: true } } },
      });

      // Sync to Google Sheets
      await appendOrderToSheet({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || '',
        products: order.items.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        affiliateCode: order.affiliateCode || '',
        paymentMethod: order.paymentMethod,
        status: 'PAID',
        createdAt: order.createdAt.toISOString(),
      });

      await prisma.order.update({ where: { id: orderId }, data: { syncedToSheets: true } });

      // Send confirmation email
      await sendOrderConfirmation({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderNumber: order.orderNumber,
        items: order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.price,
          downloadLink: i.product.downloadLink,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
      });

      await sendDiscordNotification(order);
    }
  }

  return NextResponse.json({ received: true });
}

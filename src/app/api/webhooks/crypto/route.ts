import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCryptomusSignature } from '@/lib/cryptomus';
import { appendOrderToSheet } from '@/lib/google-sheets';
import { sendOrderConfirmation } from '@/lib/email';
import { sendDiscordNotification } from '@/lib/discord';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('sign');

    if (!signature || !verifyCryptomusSignature(bodyText, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const data = JSON.parse(bodyText);
    
    // Cryptomus status can be 'paid', 'paid_over', 'wrong_amount', 'wrong_amount_waiting', 'host_account_connected', 'system_fail', 'refund_process', 'refund_fail', 'refund_paid', 'locked'
    // We only care if it's successfully paid
    if (data.status === 'paid' || data.status === 'paid_over') {
      const orderId = data.order_id;
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });

      if (order && order.status !== 'PAID') {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID', paymentId: data.uuid },
          include: { items: { include: { product: true } } },
        });

        if (!updatedOrder.syncedToSheets) {
          await appendOrderToSheet({
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            customerName: updatedOrder.customerName,
            customerEmail: updatedOrder.customerEmail,
            customerPhone: updatedOrder.customerPhone || '',
            products: updatedOrder.items.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
            subtotal: updatedOrder.subtotal,
            discount: updatedOrder.discount,
            total: updatedOrder.total,
            affiliateCode: updatedOrder.affiliateCode || '',
            paymentMethod: 'crypto',
            status: 'PAID',
            createdAt: updatedOrder.createdAt.toISOString(),
          });

          await prisma.order.update({ where: { id: orderId }, data: { syncedToSheets: true } });

          await sendOrderConfirmation({
            customerName: updatedOrder.customerName,
            customerEmail: updatedOrder.customerEmail,
            orderNumber: updatedOrder.orderNumber,
            items: updatedOrder.items.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              price: i.price,
              downloadLink: i.product.downloadLink,
            })),
            subtotal: updatedOrder.subtotal,
            discount: updatedOrder.discount,
            total: updatedOrder.total,
            paymentMethod: 'crypto',
          });

          await sendDiscordNotification(updatedOrder);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Cryptomus webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

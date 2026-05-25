import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPlisioSignature } from '@/lib/plisio';
import { appendOrderToSheet } from '@/lib/google-sheets';
import { sendOrderConfirmation } from '@/lib/email';
import { sendDiscordNotification } from '@/lib/discord';

export async function POST(req: Request) {
  try {
    let data: Record<string, any> = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    }

    if (!verifyPlisioSignature(data)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Plisio status: 'completed', 'mismatch', 'cancelled', 'error', 'new', 'pending'
    if (data.status === 'completed' || data.status === 'mismatch') {
      const orderId = data.order_number;
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });

      if (order && order.status !== 'PAID') {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID', paymentId: data.txn_id || data.id || '' },
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
    console.error('Plisio webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

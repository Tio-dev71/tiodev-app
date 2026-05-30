import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { appendOrderToSheet } from '@/lib/google-sheets';
import { sendOrderConfirmation } from '@/lib/email';
import { sendDiscordNotification } from '@/lib/discord';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const apiKey = authHeader.replace(/^Apikey\s+/i, '').trim();

    // Verify API Key if configured
    const expectedApiKey = process.env.SEPAY_API_KEY;
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Sepay webhook payload includes: transferType, transferAmount, content/description, referenceCode
    if (data.transferType !== 'in') {
      return NextResponse.json({ received: true, message: 'Not an incoming transfer' });
    }

    const description = data.description || data.content || '';
    
    // The checkout route generates description in the format: "Order <orderNumber>"
    const match = description.match(/Order\s+([a-zA-Z0-9]+)/i);
    
    if (!match) {
      return NextResponse.json({ received: true, message: 'No order number found in description' });
    }

    const orderNumber = match[1];
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json({ received: true, message: 'Order not found' });
    }

    if (order.status !== 'PAID') {
      // Allow a small tolerance in amount (e.g., 1000 VND)
      const expectedAmount = order.total * 26000;
      
      if (data.transferAmount < expectedAmount - 1000) {
         return NextResponse.json({ received: true, message: 'Partial payment, not marking as paid' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'PAID', 
          paymentId: data.referenceCode || String(data.id) || '' 
        },
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
          paymentMethod: 'vietqr',
          status: 'PAID',
          createdAt: updatedOrder.createdAt.toISOString(),
        });

        await prisma.order.update({ where: { id: updatedOrder.id }, data: { syncedToSheets: true } });

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
          paymentMethod: 'vietqr',
        });

        await sendDiscordNotification(updatedOrder);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Sepay webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Admin Order Update API - PUT to update status
import { prisma } from '@/lib/prisma';
import { appendOrderToSheet } from '@/lib/google-sheets';
import { sendOrderConfirmation } from '@/lib/email';
import { sendDiscordNotification } from '@/lib/discord';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } },
    });

    // If marking as PAID and not yet synced, sync to Google Sheets
    if (status === 'PAID' && !order.syncedToSheets) {
      await appendOrderToSheet({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || '',
        products: order.items.map(i => `${i.product.name} x${i.quantity}`).join(', '),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        affiliateCode: order.affiliateCode || '',
        paymentMethod: order.paymentMethod,
        status: 'PAID',
        createdAt: order.createdAt.toISOString(),
      });

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

      await prisma.order.update({ where: { id }, data: { syncedToSheets: true } });
      await sendDiscordNotification(order);
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

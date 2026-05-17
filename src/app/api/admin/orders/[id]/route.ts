// Admin Order Update API - PUT to update status
import { prisma } from '@/lib/prisma';
import { appendOrderToSheet } from '@/lib/google-sheets';
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
      await prisma.order.update({ where: { id }, data: { syncedToSheets: true } });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: { 
        status: true,
        items: {
          select: {
            product: {
              select: {
                name: true,
                downloadLink: true,
              }
            }
          }
        }
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    // Only return download links if the order is PAID
    const responseData = {
      status: order.status,
      items: order.status === 'PAID' ? order.items : [],
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Fetch order status error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

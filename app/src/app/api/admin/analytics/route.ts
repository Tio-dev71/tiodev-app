// Admin Analytics API - Dashboard stats
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalRevenue, totalOrders, totalProducts, totalAffiliates, recentOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.affiliate.count({ where: { active: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalProducts,
      totalAffiliates,
      recentOrders: recentOrders.map(o => ({ ...o, createdAt: o.createdAt.toISOString() })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

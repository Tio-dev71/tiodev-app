// Admin Affiliates API - GET all with stats, POST create, DELETE by id
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateCode } from '@/lib/utils';
import { appendAffiliateToSheet, initializeAffiliateSheetHeaders } from '@/lib/google-sheets';

export async function GET() {
  try {
    const affiliates = await prisma.affiliate.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });

    const withRevenue = await Promise.all(
      affiliates.map(async (a) => {
        const result = await prisma.order.aggregate({
          where: { affiliateCode: a.code, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
          _sum: { total: true },
        });
        return { ...a, totalRevenue: result._sum.total || 0 };
      })
    );

    return NextResponse.json(withRevenue);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body.code || generateCode(8);

    const existing = await prisma.affiliate.findUnique({ where: { code } });
    if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 400 });

    const affiliate = await prisma.affiliate.create({
      data: {
        code,
        name: body.name,
        email: body.email,
        discountPercent: body.discountPercent || 10,
        commissionRate: body.commissionRate || 5,
      },
    });

    await initializeAffiliateSheetHeaders();
    await appendAffiliateToSheet({
      code: affiliate.code,
      name: affiliate.name,
      email: affiliate.email,
      discountPercent: affiliate.discountPercent,
      commissionRate: affiliate.commissionRate,
      active: affiliate.active,
      orderCount: 0,
      totalRevenue: 0,
      createdAt: affiliate.createdAt.toISOString(),
    });

    return NextResponse.json(affiliate, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create affiliate' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing affiliate id' }, { status: 400 });
    }

    await prisma.affiliate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete affiliate' }, { status: 500 });
  }
}

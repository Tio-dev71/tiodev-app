// POST /api/affiliates/validate — Validate affiliate code
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ valid: false, message: 'Code is required' });

    const affiliate = await prisma.affiliate.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!affiliate || !affiliate.active) {
      return NextResponse.json({ valid: false, message: 'Invalid or inactive affiliate code' });
    }

    return NextResponse.json({
      valid: true,
      code: affiliate.code,
      discountPercent: affiliate.discountPercent,
      message: `${affiliate.discountPercent}% discount applied`,
    });
  } catch (error) {
    console.error('Failed to validate affiliate code:', error);
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 });
  }
}

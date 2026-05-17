// API to record a subscription order for affiliate tracking
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, cycle, amount, affiliateCode, customerName, customerEmail } = body;

    if (!planName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only create order if there's an affiliate code and it exists
    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { code: affiliateCode },
      });

      if (!affiliate) {
        return NextResponse.json({ error: 'Affiliate code not found' }, { status: 404 });
      }
    }

    // Create order in web database for tracking
    const order = await prisma.order.create({
      data: {
        customerName: customerName || 'Subscription User',
        customerEmail: customerEmail || '',
        subtotal: amount,
        total: amount,
        status: 'PAID',
        paymentMethod: 'sepay',
        affiliateCode: affiliateCode || null,
        notes: `9Meta Subscription - ${planName} (${cycle})`,
        items: {
          create: [{
            productId: await getOrCreateSubscriptionProduct(planName),
            quantity: 1,
            price: amount,
          }],
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Failed to record subscription order:', error);
    return NextResponse.json({ error: 'Failed to record order' }, { status: 500 });
  }
}

// Get or create a virtual product for subscription tracking
async function getOrCreateSubscriptionProduct(planName: string): Promise<string> {
  const slug = `9meta-subscription-${planName.toLowerCase()}`;

  let product = await prisma.product.findUnique({ where: { slug } });

  if (!product) {
    product = await prisma.product.create({
      data: {
        name: `9Meta ${planName}`,
        slug,
        description: `Gói đăng ký 9Meta - ${planName}`,
        price: 0,
        image: '',
        category: 'subscription',
        active: false, // Don't show in store
      },
    });
  }

  return product.id;
}

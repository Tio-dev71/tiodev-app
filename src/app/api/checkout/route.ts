// POST /api/checkout — Create order and initiate payment
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { generateVietQR } from '@/lib/vietqr';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, affiliateCode } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Fetch products and calculate prices server-side (prevent price manipulation)
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Some products are no longer available' }, { status: 400 });
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      return { productId: product.id, quantity: item.quantity, price: product.price };
    });

    // Apply affiliate discount
    let discount = 0;
    let validAffiliateCode: string | null = null;
    if (affiliateCode) {
      const affiliate = await prisma.affiliate.findUnique({
        where: { code: affiliateCode.toUpperCase(), active: true },
      });
      if (affiliate) {
        discount = Math.round((subtotal * affiliate.discountPercent) / 100 * 100) / 100;
        validAffiliateCode = affiliate.code;
      }
    }

    const total = Math.round((subtotal - discount) * 100) / 100;

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        subtotal,
        discount,
        total,
        paymentMethod,
        affiliateCode: validAffiliateCode,
        status: 'PENDING',
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    // Handle payment based on method
    if (paymentMethod === 'stripe') {
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order.items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: { name: item.product.name, images: item.product.image ? [item.product.image] : [] },
            unit_amount: Math.round(item.price * 100), // Stripe uses cents
          },
          quantity: item.quantity,
        })),
        ...(discount > 0 ? {
          discounts: [{
            coupon: (await stripe.coupons.create({
              amount_off: Math.round(discount * 100),
              currency: 'usd',
              duration: 'once',
            })).id,
          }],
        } : {}),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        customer_email: customerEmail,
        metadata: { orderId: order.id },
      });

      // Update order with Stripe session ID
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: session.id },
      });

      return NextResponse.json({ checkoutUrl: session.url, orderId: order.id });
    }

    if (paymentMethod === 'vietqr') {
      // Generate VietQR code
      const qrData = await generateVietQR({
        amount: total,
        description: `Order ${order.orderNumber}`,
        orderNumber: order.orderNumber,
      });

      return NextResponse.json({ orderId: order.id, vietqr: qrData });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

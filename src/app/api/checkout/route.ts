// POST /api/checkout — Create order and initiate payment
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { generateVietQR } from '@/lib/vietqr';
import { sendDiscordNotification } from '@/lib/discord';
import { appendOrderToSheet } from '@/lib/google-sheets';
import { sendOrderConfirmation } from '@/lib/email';
import { createCryptomusInvoice } from '@/lib/cryptomus';
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

    const isFree = total === 0;

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
        paymentMethod: isFree ? 'free' : paymentMethod,
        affiliateCode: validAffiliateCode,
        tradingViewUser: body.tradingViewUser || null,
        status: isFree ? 'PAID' : 'PENDING',
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    if (isFree) {
      await appendOrderToSheet({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || '',
        products: order.items.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        affiliateCode: order.affiliateCode || '',
        paymentMethod: 'free',
        status: 'PAID',
        createdAt: order.createdAt.toISOString(),
      });

      await prisma.order.update({ where: { id: order.id }, data: { syncedToSheets: true } });

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
        paymentMethod: 'free',
      });

      await sendDiscordNotification(order);
      return NextResponse.json({ orderId: order.id });
    }

    // Notify Discord for the new pending order
    await sendDiscordNotification(order);

    // Handle payment based on method
    if (paymentMethod === 'stripe') {
      const discountPercent = affiliateCode && validAffiliateCode ? (discount / subtotal) : 0;

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order.items.map((item) => {
          // Subtract discount directly from item price
          const itemDiscount = item.price * discountPercent;
          const discountedPrice = item.price - itemDiscount;

          return {
            price_data: {
              currency: 'usd',
              product_data: { name: item.product.name, images: item.product.image ? [item.product.image] : [] },
              unit_amount: Math.round(discountedPrice * 100), // Stripe uses cents
            },
            quantity: item.quantity,
          };
        }),
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
      // Generate VietQR code for bank transfer
      // Multiply by 26000 to convert USD to VND
      const qrData = await generateVietQR({
        amount: total * 26000,
        description: `Order ${order.orderNumber}`,
        orderNumber: order.orderNumber,
      });

      return NextResponse.json({ orderId: order.id, vietqr: qrData });
    }

    if (paymentMethod === 'crypto') {
      const checkoutUrl = await createCryptomusInvoice({
        id: order.id,
        amount: total,
        currency: 'USD',
      });
      return NextResponse.json({ checkoutUrl, orderId: order.id });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

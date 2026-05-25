// Admin Products API - PUT update, DELETE
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: slugify(body.name),
        description: body.description,
        price: body.price,
        image: body.image || '',
        images: body.images || [],
        category: body.category || null,
        featured: body.featured || false,
        downloadLink: body.downloadLink || null,
        isSubscription: body.isSubscription || false,
        subscriptionType: body.subscriptionType || null,
        embedCode: body.embedCode || null,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete related OrderItems first, then the product
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

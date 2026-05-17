// Admin Products API - GET all, POST create
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = slugify(body.name);
    
    // Check for duplicate slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: finalSlug,
        description: body.description,
        price: body.price,
        image: body.image || '',
        category: body.category || null,
        featured: body.featured || false,
        downloadLink: body.downloadLink || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

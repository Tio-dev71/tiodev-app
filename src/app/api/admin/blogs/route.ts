import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = slugify(body.title);
    
    // Check for duplicate slug
    const existing = await prisma.blog.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug: finalSlug,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category || 'General',
        readTime: body.readTime || '5 min read',
        image: body.image || '',
        published: body.published ?? true,
      },
    });
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Failed to create blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

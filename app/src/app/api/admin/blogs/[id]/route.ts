import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // We only update what is provided
    const data: any = {};
    if (body.title) data.title = body.title;
    if (body.excerpt) data.excerpt = body.excerpt;
    if (body.content) data.content = body.content;
    if (body.category) data.category = body.category;
    if (body.readTime) data.readTime = body.readTime;
    if (body.image) data.image = body.image;
    if (body.published !== undefined) data.published = body.published;

    const blog = await prisma.blog.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Failed to update blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.blog.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}

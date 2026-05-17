import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public GET for a specific setting by key
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  const setting = await prisma.siteSetting.findUnique({
    where: { key },
  });

  if (!setting) {
    return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
  }

  return NextResponse.json({ key: setting.key, value: setting.value });
}

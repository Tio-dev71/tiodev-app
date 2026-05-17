import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET all settings (admin only)
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: 'asc' },
  });

  return NextResponse.json(settings);
}

// PUT - update settings (admin only)
export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { settings } = body as { settings: { key: string; value: string; label?: string }[] };

  if (!settings || !Array.isArray(settings)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // Upsert each setting
  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      create: {
        key: setting.key,
        value: setting.value,
        label: setting.label,
      },
      update: {
        value: setting.value,
        label: setting.label,
      },
    });
  }

  const updated = await prisma.siteSetting.findMany({
    orderBy: { key: 'asc' },
  });

  return NextResponse.json(updated);
}

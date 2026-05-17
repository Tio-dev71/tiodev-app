// Admin Settings API - GET all, PUT update
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all settings (admin only — protected by middleware)
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - update settings (admin only — protected by middleware)
export async function PUT(request: Request) {
  try {
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
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

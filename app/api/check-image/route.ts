// app/api/check-image/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encodedIconPath = searchParams.get('iconPath');

  if (!encodedIconPath) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const iconPath = decodeURIComponent(encodedIconPath);

  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'icons', `${iconPath}.png`);
    await fs.access(imagePath);
    return NextResponse.json({ exists: true });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}
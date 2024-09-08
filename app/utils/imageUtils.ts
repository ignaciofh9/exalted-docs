// utils/imageUtils.ts
import fs from 'fs';
import path from 'path';

export function imageExists(iconPath: string): boolean {
  const imagePath = path.join(process.cwd(), 'public', 'images', 'icons', `${iconPath}.png`);
  return fs.existsSync(imagePath);
}
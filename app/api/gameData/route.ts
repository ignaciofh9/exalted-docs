import { NextRequest, NextResponse } from 'next/server';
import { GameData } from '@/app/types';
import { fetchUnits } from './fetchUnits';
import { fetchItems } from './fetchItems';
import { fetchChapters } from './fetchChapters';
import { fetchSkills } from './fetchSkills';
import { fetchSkillCombos } from './fetchSkillCombos';
import { fetchAffinities } from './fetchAffinities';

export const revalidate = 600; // revalidate every 20 seconds

export async function GET(request: NextRequest) {
  try {
    const gameData: GameData = {
      units: await fetchUnits(),
      items: await fetchItems(),
      chapters: await fetchChapters(),
      skills: await fetchSkills(),
      skillCombos: await fetchSkillCombos(),
      affinities: await fetchAffinities(),
    };

    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Error fetching game data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
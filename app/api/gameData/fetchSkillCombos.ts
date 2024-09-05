// docs/exalted-docs/app/api/gameData/fetchSkillCombos.ts

import { SkillCombo, SkillName } from '@/app/types';
import { getAllRows, SheetRow } from '@/app/utils/sheets';

export async function fetchSkillCombos(): Promise<SkillCombo[]> {
  const rows = await getAllRows('Skill-Combos');
  return rows.map(convertRowToSkillCombo);
}

export function convertRowToSkillCombo(row: SheetRow): SkillCombo {
  return {
    requiredSkills: [
      [row['Skill 1'] as SkillName],
      (row['Skill(s) 2'] as string).split(',').map(skill => skill.trim() as SkillName)
    ],
    description: row.Description as string
  };
}

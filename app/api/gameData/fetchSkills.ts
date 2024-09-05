// docs/exalted-docs/app/api/gameData/fetchSkills.ts

import { Skill, SkillName, createVersioned, CooldownType, ItemName, AffinityType, SkillCombo, SkillAllocType, Version } from '@/app/types';
import { getAllRows, SheetRow } from '@/app/utils/sheets';
import { convertRowToSkillCombo } from './fetchSkillCombos';
import { parseIntSafe } from './utils';

export async function fetchSkills(): Promise<{ [name: string]: Skill }> {
  const skillRows = await getAllRows('Skills');
  const comboRows = await getAllRows('Skill-Combos');
  
  const skillCombos = processSkillCombos(comboRows);
  const skills: { [name: string]: Skill } = {};
  
  skillRows.forEach(row => {
    const skill = convertRowToSkill(row, skillCombos);
    skills[skill.name] = skill;
  });

  return skills;
}

function processSkillCombos(rows: SheetRow[]): { [skillName: string]: SkillCombo[] } {
  const combos: { [skillName: string]: SkillCombo[] } = {};

  rows.forEach(row => {
    const combo = convertRowToSkillCombo(row);
    
    // Add combo to first skill
    const firstSkill = combo.requiredSkills[0][0];
    if (!combos[firstSkill]) {
      combos[firstSkill] = [];
    }
    combos[firstSkill].push(combo);

    // Add combo to each of the second skills
    combo.requiredSkills[1].forEach(skill => {
      if (!combos[skill]) {
        combos[skill] = [];
      }
      combos[skill].push(combo);
    });
  });

  return combos;
}

function convertRowToSkill(row: SheetRow, skillCombos: { [skillName: string]: SkillCombo[] }): Skill {
  const skillName = row.Name as SkillName;
  const affinity = row.Affinity ? (row.Affinity as AffinityType) : undefined;
  const defaultCapacity = parseIntSafe(row.Capacity as string);
  const capacityPerVersion: Partial<Record<Version, number>> = {
    [Version.DEFAULT]: defaultCapacity,
  }
  if (affinity) {
    capacityPerVersion[affinity] = Math.max(defaultCapacity - 5, 5);
  }
  return {
    name: skillName,
    description: row.Description as string,
    type: convertToSkillType(row.Type as string),
    capacity: createVersioned(capacityPerVersion),
    scroll: row.Scroll ? (row.Scroll as ItemName) : null,
    classes: row.Classes ? (row.Classes as string).split(',').map(cls => cls.trim()) : undefined,
    innateEffect: row['Innate-Effect'] as string || undefined,
    affinity: affinity,
    cooldown: row.Cooldown ? parseIntSafe(row.Cooldown as string) : undefined,
    cooldownTypes: row['Cooldown-Type'] ? convertToCooldownTypes(row['Cooldown-Type'] as string) : undefined,
    combos: skillCombos[skillName] || []
  };
}

function convertToSkillType(type: string): SkillAllocType {
  switch (type.toLowerCase()) {
    case 'unslotted':
      return SkillAllocType.Unslotted;
    case 'locked':
      return SkillAllocType.Locked;
    case 'unlocked':
      return SkillAllocType.Unlocked;
    default:
      throw new Error(`Invalid SkillType: ${type}`);
  }
}

function convertToCooldownTypes(types: string): CooldownType[] {
  return types.split(',').map(type => {
    switch (type.trim().toLowerCase()) {
      case 'turn':
        return CooldownType.Turn;
      case 'battle':
        return CooldownType.Battle;
      case 'melee':
        return CooldownType.Melee;
      default:
        throw new Error(`Invalid CooldownType: ${type}`);
    }
  });
}
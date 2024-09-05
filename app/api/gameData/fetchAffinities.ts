// docs/exalted-docs/app/api/gameData/fetchAffinities.ts

import { Affinity, AffinityType, SupportBonuses, UnversionedGrowthStats, UnversionedStats, SupportBonusType, SupportLevel } from '@/app/types';
import { getAllRows, SheetRow } from '@/app/utils/sheets';
import { parseIntSafe, parseFloatSafe } from './utils';

export async function fetchAffinities(): Promise<{ [key in AffinityType]: Affinity }> {
  const rows = await getAllRows('Affinities');
  const affinities: { [key in AffinityType]: Affinity } = {} as { [key in AffinityType]: Affinity };

  rows.forEach(row => {
    const affinity = convertRowToAffinity(row);
    affinities[affinity.name] = affinity;
  });

  return affinities;
}

function convertRowToAffinity(row: SheetRow): Affinity {
  return {
    name: row.Name as AffinityType,
    supportBonuses: createSupportBonuses(row, false),
    exaltedGrowthBonuses: createExaltedGrowthBonuses(row),
    exaltedSupportBonuses: createSupportBonuses(row, true),
    exaltedStatBonuses: createExaltedStatBonuses(row)
  };
}

function createSupportBonuses(row: SheetRow, isExalted: boolean): SupportBonuses {
  const supportBonuses: SupportBonuses = {} as SupportBonuses;

  for (const level of Object.values(SupportLevel)) {
    supportBonuses[level] = {} as { [key in SupportBonusType]: number };
    for (const bonusType of Object.values(SupportBonusType)) {
      let key: string;
      if (isExalted) {
        key = `${bonusType}-Exalted-${level}-Support-Bonus`;
      } else {
        key = `${bonusType}-${level}-Support-Bonus`;
      }
      supportBonuses[level][bonusType] = parseFloatSafe(row[key] as string);
    }
  }

  return supportBonuses;
}

function createExaltedGrowthBonuses(row: SheetRow): UnversionedGrowthStats {
  return {
    HP: parseIntSafe(row['Exalted-HP-Growth-Bonus'] as string),
    Str: parseIntSafe(row['Exalted-Str-Growth-Bonus'] as string),
    Mag: parseIntSafe(row['Exalted-Mag-Growth-Bonus'] as string),
    Skl: parseIntSafe(row['Exalted-Skl-Growth-Bonus'] as string),
    Spd: parseIntSafe(row['Exalted-Spd-Growth-Bonus'] as string),
    Lck: parseIntSafe(row['Exalted-Lck-Growth-Bonus'] as string),
    Def: parseIntSafe(row['Exalted-Def-Growth-Bonus'] as string),
    Res: parseIntSafe(row['Exalted-Res-Growth-Bonus'] as string)
  };
}

function createExaltedStatBonuses(row: SheetRow): UnversionedStats {
  return {
    HP: parseIntSafe(row['Exalted-HP-Bonus'] as string),
    Str: parseIntSafe(row['Exalted-Str-Bonus'] as string),
    Mag: parseIntSafe(row['Exalted-Mag-Bonus'] as string),
    Skl: parseIntSafe(row['Exalted-Skl-Bonus'] as string),
    Spd: parseIntSafe(row['Exalted-Spd-Bonus'] as string),
    Lck: parseIntSafe(row['Exalted-Lck-Bonus'] as string),
    Def: parseIntSafe(row['Exalted-Def-Bonus'] as string),
    Res: parseIntSafe(row['Exalted-Res-Bonus'] as string),
    Move: parseIntSafe(row['Exalted-Mov-Bonus'] as string),
    Shove: parseIntSafe(row['Exalted-Shove-Bonus'] as string),
    Weight: parseIntSafe(row['Exalted-Weight-Bonus'] as string)
  };
}
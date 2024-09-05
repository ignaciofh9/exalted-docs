// src/types/unitTypes.ts

import {
  AffinityType,
  ClassType,
  WeaponType,
  WeaponRank,
} from "./enums";

import {
  SkillName,
  ItemName,
  UnitName,
  Versioned,
  VersionedGrowthStats,
  VersionedStats,
  ChapterNumbering
} from "./baseTypes";

export interface Tier {
  name: string;
  tierIndex: number;
  caps: VersionedGrowthStats;
  defaultPromoLevel: Versioned<number | null>;
  statsPromo: VersionedStats | null;
  skills: Versioned<SkillName[]>;
  classType: Versioned<ClassType[]>;
  minWeaponRanks: { [key in WeaponType]: Versioned<WeaponRank> };
}

export interface ItemSlot {
  name: ItemName;
  locked: boolean;
}

export interface UnitData {
  name: UnitName;
  growths: VersionedGrowthStats;
  baseStats: VersionedStats;
  tiers: Tier[];
  isLaguz: boolean;
  primaryAffinity: AffinityType;
  secondaryAffinity: AffinityType | null;
  exaltedBonus: String;
  bonds: UnitName[];
  preferredWeapons: ItemName[];
  shiftedMoveBonus: Versioned<number>;
  authority: Versioned<number>;
  startingInventory: Versioned<ItemSlot[]>;
  baseLevel: Versioned<number>;
  firstAppears: Versioned<ChapterNumbering>;
}

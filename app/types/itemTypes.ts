// docs/exalted-docs/app/types/itemTypes.ts

import {
  ItemType,
  ClassType,
  WeaponType,
  WeaponTrianglePosition,
  ConsecutiveAttackType,
  WeaponRankOrPrf
} from "./enums";

import {
  ItemName,
  UnitName,
  VersionedStats,
  VersionedWeaponRange,
  Versioned,
} from "./baseTypes";

export interface BaseItem {
  name: ItemName;
  type: ItemType;
  description: Versioned<string>;
  uses: Versioned<number | null>; // null for infinite use items
  worth: Versioned<number>;
}

export interface Weapon extends BaseItem {
  type: ItemType.Weapon;
  weaponType: Versioned<WeaponType>;
  trianglePosition: Versioned<WeaponTrianglePosition>;
  rank: Versioned<WeaponRankOrPrf>;
  might: Versioned<number>;
  hit: Versioned<number>;
  crit: Versioned<number>;
  weight: Versioned<number>;
  range: Versioned<VersionedWeaponRange>;
  aura: Versioned<boolean>;
  crossbow: Versioned<boolean>;
  effective: Versioned<ClassType[]>;
  equipStatBonuses: Versioned<Partial<VersionedStats>>;
  weaponExp: Versioned<number>;
  consecutive: Versioned<ConsecutiveAttackType>;
  recharge: Versioned<number | null>;
  preferredUsers: Versioned<UnitName[]>;
}

export interface UsableItem extends BaseItem {
  type: ItemType.Usable;
  uses: Versioned<number>;
}

export interface Card extends BaseItem {
  type: ItemType.Card;
  uses: Versioned<number>;
  might: Versioned<number>;
  hit: Versioned<number>;
  crit: Versioned<number>;
  range: VersionedWeaponRange;
}

export interface MiscItem extends BaseItem {
  type: ItemType.Misc;
  uses: Versioned<null>;
}

export interface Equipment extends BaseItem {
  type: ItemType.Equipment;
  statBonuses: VersionedStats;
}

export type Item = Weapon | UsableItem | Card | MiscItem | Equipment;

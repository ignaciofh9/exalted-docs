// docs/exalted-docs/app/types/baseTypes.ts

export enum AffinityType {
  Fire = "Fire",
  Thunder = "Thunder",
  Wind = "Wind",
  Water = "Water",
  Dark = "Dark",
  Light = "Light",
  Earth = "Earth",
  Heaven = "Heaven",
}

export enum Version {
  Fire = "Fire",
  Thunder = "Thunder",
  Wind = "Wind",
  Water = "Water",
  Dark = "Dark",
  Light = "Light",
  Earth = "Earth",
  Heaven = "Heaven",
  DEFAULT = "DEFAULT",
}

export enum GrowthStat {
  HP = "HP",
  STR = "Str",
  MAG = "Mag",
  SKL = "Skl",
  SPD = "Spd",
  LCK = "Lck",
  DEF = "Def",
  RES = "Res",
}

export enum NonGrowthStat {
  MOVE = "Move",
  SHOVE = "Shove",
  WEIGHT = "Weight",
}

export enum SupportBonusType {
  Atk = "Atk",
  Def = "Def",
  Hit = "Hit",
  Avo = "Avo",
}

export enum SupportLevel {
  C = "C",
  B = "B",
  A = "A",
}

export enum ClassType {
  Armored = "Armored",
  Cavalry = "Cavalry",
  Flying = "Flying",
  Dragon = "Dragon",
  Beast = "Beast",
  Dark = "Dark",
  Mage = "Mage",
  FireCat = "Fire Cat",
}

export enum ItemType {
  Weapon = "Weapon",
  Usable = "Usable",
  Card = "Card",
  Misc = "Misc",
  Equipment = "Equipment",
}

export enum AvailabilityType {
  Forced = "Forced",
  Recruited = "Recruited",
  Available = "Available",
  Blocked = "Blocked",
}

export enum DifficultyType {
  Normal = "Normal",
  Hard = "Hard",
  Maniac = "Maniac",
}

export enum WeaponType {
  Sword = "Sword",
  Lance = "Lance",
  Axe = "Axe",
  Bow = "Bow",
  Knife = "Knife",
  Strike = "Strike",
  Fire = "Fire",
  Thunder = "Thunder",
  Wind = "Wind",
  Light = "Light",
  Dark = "Dark",
  Staff = "Staff",
}

export enum WeaponTrianglePosition {
  Agile = "Agile",
  Balance = "Balance",
  Heavy = "Heavy",
  Fire = "Fire",
  Wind = "Wind",
  Thunder = "Thunder",
  Light = "Light",
  Dark = "Dark",
  NoneMagic = "NoneMagic",
  NonePhysical = "NonePhysical",
}

export enum WeaponRank {
  E = "E",
  D = "D",
  C = "C",
  B = "B",
  A = "A",
  S = "S",
  SS = "SS",
}

export enum WeaponRankOrPrf {
  E = "E",
  D = "D",
  C = "C",
  B = "B",
  A = "A",
  S = "S",
  SS = "SS",
  PRF = "PRF",
}

export enum ConsecutiveAttackType {
  Never = "Never",
  Always = "Always",
  Initiating = "Initiating",
}

export enum SkillAllocType {
  Unslotted = "Unslotted",
  Locked = "Locked",
  Unlocked = "Unlocked",
}

export enum CooldownType {
  Turn = "Turn",
  Battle = "Battle",
  Melee = "Melee",
}

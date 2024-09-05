// docs/exalted-docs/app/types/gameTypes.ts

import { AffinityType, AvailabilityType, DifficultyType } from "./enums";
import {
  UnitName,
  ItemName,
  ChapterName,
  SkillName,
  ChapterNumbering,
  UnversionedGrowthStats,
  UnversionedStats,
  SupportBonuses,
  Versioned,
} from "./baseTypes";
import { Item } from "./itemTypes";
import { Skill, SkillCombo } from "./skillTypes";
import { UnitData } from "./unitTypes";

export interface Affinity {
  name: AffinityType;
  supportBonuses: SupportBonuses;
  exaltedSupportBonuses: SupportBonuses;
  exaltedGrowthBonuses: UnversionedGrowthStats;
  exaltedStatBonuses: UnversionedStats;
}

export interface Availability {
  type: AvailabilityType;
  appearanceTurn: number | null;
}

export interface Conversation {
  name: string;
  requiredUnits: UnitName[];
  requiredEvents: string[];
  importance: number;
  reward: ItemName | number | UnitName | string | null;
  description: string;
}

export interface ChapterIndexing {
  part: number;
  index: number;
}

export interface VersionedChapterData {
  hasBase: Versioned<boolean>;
  hasSkills: Versioned<boolean>;
  affinity: Versioned<AffinityType>;
  commander: Versioned<UnitName>;
  objective: Versioned<string>;
  bargains: Versioned<ItemName[]>;
  conversations: Versioned<Conversation[]>;
  startingNumUnits: Versioned<number>;
  unitsAvailable: Versioned<Record<UnitName, Availability>>;
  turnBonusExp: Versioned<Record<number, number>>;
  otherBonusExp: Versioned<Record<string, number>>;
}

export interface NonVersionedChapterData {
  hasBase: boolean;
  hasSkills: boolean;
  affinity: AffinityType;
  commander: UnitName;
  objective: string;
  bargains: ItemName[];
  conversations: Conversation[];
  startingNumUnits: number;
  unitsAvailable: Record<UnitName, Availability>;
  turnBonusExp: Record<number, number>;
  otherBonusExp: Record<string, number>;
}

export interface Chapter {
  name: ChapterName;
  numbering: ChapterNumbering;
  indexing: ChapterIndexing;
  perDifficultyData: Record<DifficultyType, VersionedChapterData>;
}

export interface GameData {
  units: Record<UnitName, UnitData>;
  items: Record<ItemName, Item>;
  chapters: Record<ChapterNumbering, Chapter>;
  skills: Record<SkillName, Skill>;
  skillCombos: SkillCombo[];
  affinities: Record<AffinityType, Affinity>;
}
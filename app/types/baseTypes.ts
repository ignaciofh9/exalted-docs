// docs/exalted-docs/app/types/baseTypes.ts
import {
  Version,
  GrowthStat,
  NonGrowthStat,
  SupportLevel,
  SupportBonusType,
  AffinityType,
} from "./enums";

export type UnitName = string;
export type ItemName = string;
export type SkillName = string;
export type ChapterName = string;
export type ChapterNumbering = string;

export type VersionedResult<T> = {
  value: T | undefined;
  version: Version;
};

export type Versioned<T> = {
  [key in Version]?: T;
} & {
  DEFAULT?: T;
  get: (v: AffinityType | Version.DEFAULT) => T | undefined;
  getWithVersionInfo: (v: AffinityType | Version.DEFAULT) => VersionedResult<T>;
};

export function createVersioned<T>(
  data: Partial<Record<Version, T>>
): Versioned<T> {
  return {
    ...data,
    get: function (v: AffinityType | Version.DEFAULT): T | undefined {
      return this[v] !== undefined ? this[v] : this[Version.DEFAULT];
    },
    getWithVersionInfo: function (v: AffinityType | Version.DEFAULT): VersionedResult<T> {
      if (this[v] !== undefined) {
        return { value: this[v], version: v as unknown as Version };
      } else {
        return { value: this[Version.DEFAULT], version: Version.DEFAULT };
      }
    },
  };
}

export type UnversionedGrowthStats = {
  [key in GrowthStat]: number;
};

export type UnversionedNonGrowthStats = {
  [key in NonGrowthStat]: number;
};

export interface UnversionedStats
  extends UnversionedGrowthStats,
    UnversionedNonGrowthStats {}

export type VersionedGrowthStats = {
  [key in GrowthStat]: Versioned<number>;
};

export type VersionedNonGrowthStats = {
  [key in NonGrowthStat]: Versioned<number>;
};

export interface VersionedStats
  extends VersionedGrowthStats,
    VersionedNonGrowthStats {}

export type SupportBonuses = {
  [key in SupportLevel]: {
    [key in SupportBonusType]: number;
  };
};

export interface VersionedWeaponRange {
  min: Versioned<number>;
  max: Versioned<number>;
}

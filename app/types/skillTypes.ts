// docs/exalted-docs/app/types/skillTypes.ts

import { AffinityType, SkillAllocType, CooldownType } from "./enums";
import { SkillName, ItemName, Versioned } from "./baseTypes";

export interface SkillCombo {
  requiredSkills: [SkillName[], SkillName[]];
  description: string;
}

export interface Skill {
  name: SkillName;
  description: string;
  type: SkillAllocType;
  capacity: Versioned<number>;
  scroll: ItemName | null;
  classes?: string[];
  innateEffect?: string;
  affinity?: AffinityType;
  cooldown?: number;
  cooldownTypes?: CooldownType[];
  combos: SkillCombo[];
}

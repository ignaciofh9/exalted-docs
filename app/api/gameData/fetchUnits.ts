// docs/exalted-docs/app/api/gameData/fetchUnits.ts

import {
  UnitData,
  UnitName,
  ItemName,
  AffinityType,
  ClassType,
  SkillName,
  ItemSlot,
  Tier,
  WeaponRank,
  WeaponType,
  UnversionedStats,
  VersionedGrowthStats,
  VersionedStats,
  GrowthStat,
  NonGrowthStat,
  Version,
  Versioned,
  ChapterNumbering,
  createVersioned,
} from "@/app/types";
import { getAllRows, SheetRow } from "@/app/utils/sheets";
import { parseIntSafe, updateVersionedValue } from "./utils";

async function fetchUnits(): Promise<Record<UnitName, UnitData>> {
  const unitRows = await getAllRows("Units");
  const exaltedBonusRows = await getAllRows("Exalted-Bonuses");
  const secondaryExaltedRows = await getAllRows("Secondary-Exalted-Bonuses");
  const weaponRows = await getAllRows("Weapons");

  const preferredWeapons = processPreferredWeapons(weaponRows);
  const units: Record<UnitName, UnitData> = {};

  unitRows.forEach((row) => {
    const unitName = row.Name as UnitName;
    units[unitName] = processUnitRow(row, preferredWeapons[unitName] || []);
  });

  applyExaltedBonuses(units, exaltedBonusRows);
  applyExaltedBonuses(units, secondaryExaltedRows);

  return units;
}

function processPreferredWeapons(
  rows: SheetRow[]
): Record<UnitName, ItemName[]> {
  const preferences: Record<UnitName, ItemName[]> = {};

  rows.forEach((row) => {
    const weaponName = row.Name as ItemName;
    const preferredUsers = ((row["Prf-Users"] as string) || "")
      .split(",")
      .map((user) => user.trim() as UnitName);

    preferredUsers.forEach((user) => {
      if (!preferences[user]) {
        preferences[user] = [];
      }
      preferences[user].push(weaponName);
    });
  });

  return preferences;
}

function processUnitRow(row: SheetRow, preferredWeapons: ItemName[]): UnitData {
  const isLaguz = (row.Race as string).toLowerCase() === "laguz";

  return {
    name: row.Name as UnitName,
    growths: processGrowthStats(row, "", "-Growth"),
    baseStats: processBaseStats(row),
    tiers: processTiers(row, isLaguz),
    isLaguz,
    primaryAffinity: row["Affinity-1st"] as AffinityType,
    secondaryAffinity: row["Affinity-2nd"]
      ? (row["Affinity-2nd"] as AffinityType)
      : null,
    exaltedBonus: row["Exalted-Bonus"] as string,
    bonds: ((row.Bonds as string) || "")
      .split(",")
      .map((bond) => bond.trim() as UnitName)
      .filter(Boolean),
    preferredWeapons,
    shiftedMoveBonus: createVersioned({
      [Version.DEFAULT]: parseIntSafe(row["Shift-Mov-Bonus"] as string),
    }),
    authority: createVersioned({
      [Version.DEFAULT]: parseIntSafe(row.Authority as string),
    }),
    startingInventory: createVersioned({
      [Version.DEFAULT]: processStartingInventory(row),
    }),
    baseLevel: createVersioned({
      [Version.DEFAULT]: calculateLevel(
        parseIntSafe(row["Base"] as string) - 1,
        parseIntSafe(row.Level as string),
        isLaguz
      ),
    }),
    firstAppears: createVersioned({
      [Version.DEFAULT]: row["First-Appears"] as ChapterNumbering,
    }),
  };
}

function processGrowthStats(
  row: SheetRow,
  prefix: string = "",
  suffix: string = ""
): VersionedGrowthStats {
  const growthStats: VersionedGrowthStats = {} as VersionedGrowthStats;
  Object.values(GrowthStat).forEach((stat) => {
    growthStats[stat] = createVersioned({
      [Version.DEFAULT]: parseIntSafe(
        row[`${prefix}${stat}${suffix}`] as string
      ),
    });
  });
  return growthStats;
}

function processBaseStats(row: SheetRow): VersionedStats {
  const baseStats: VersionedStats = {} as VersionedStats;
  [...Object.values(GrowthStat), ...Object.values(NonGrowthStat)].forEach(
    (stat: GrowthStat | NonGrowthStat) => {
      baseStats[stat] = createVersioned({
        [Version.DEFAULT]: parseIntSafe(row[stat] as string),
      });
    }
  );
  return baseStats;
}

function processStatsPromo(row: SheetRow, tierName: string): VersionedStats {
  const statsPromo: VersionedStats = {} as VersionedStats;
  [...Object.values(GrowthStat), ...Object.values(NonGrowthStat)].forEach(
    (stat: GrowthStat | NonGrowthStat) => {
      statsPromo[stat] = createVersioned({
        [Version.DEFAULT]: parseIntSafe(
          row[`${tierName}-${stat}-Promo`] as string
        ),
      });
    }
  );
  return statsPromo;
}

function processTiers(row: SheetRow, isLaguz: boolean): Tier[] {
  const tierNames = ["T1", "T2", "T3", "T4"];
  return tierNames
    .map((tierName, index): Tier | null => {
      if (index < parseIntSafe(row.Base as string) - 1 || row[tierName] === "-")
        return null;

      const nextTierName =
        index < tierNames.length - 1 && row[tierNames[index + 1]] !== "-"
          ? tierNames[index + 1]
          : null;

      return {
        name: row[tierName] as string,
        tierIndex: index,
        caps: processGrowthStats(row, `${tierName}-`, "-Cap"),
        defaultPromoLevel: createVersioned({
          [Version.DEFAULT]: nextTierName
            ? calculateLevel(
                index,
                parseIntSafe(
                  row[`Default-${nextTierName}-Promo-Level`] as string,
                  null
                ),
                isLaguz
              )
            : null,
        }),
        statsPromo: nextTierName ? processStatsPromo(row, nextTierName) : null,
        skills: createVersioned({
          [Version.DEFAULT]: ((row[`${tierName}-Skills`] as string) || "")
            .split(",")
            .map((skill) => skill.trim() as SkillName)
            .filter(Boolean),
        }),
        classType: createVersioned({
          [Version.DEFAULT]: ((row[`${tierName}-Class-Type`] as string) || "")
            .split(",")
            .map((type) => type.trim() as ClassType)
            .filter(Boolean),
        }),
        minWeaponRanks: parseMinWeaponRanks(
          row[`${tierName}-Min-Weapon-Ranks`] as string
        ),
      };
    })
    .filter((tier): tier is Tier => tier !== null);
}

function parseMinWeaponRanks(
  rankString: string
): Record<WeaponType, Versioned<WeaponRank>> {
  const ranks: Record<WeaponType, Versioned<WeaponRank>> = {} as Record<
    WeaponType,
    Versioned<WeaponRank>
  >;

  if (!rankString) return ranks;

  const rankPairs = rankString.split(",");
  rankPairs.forEach((pair) => {
    const [weaponType, rank] = pair.trim().split(" ");
    if (
      weaponType &&
      rank &&
      Object.values(WeaponType).includes(weaponType as WeaponType) &&
      Object.values(WeaponRank).includes(rank as WeaponRank)
    ) {
      ranks[weaponType as WeaponType] = createVersioned({
        [Version.DEFAULT]: rank as WeaponRank,
      });
    }
  });

  return ranks;
}

function processStartingInventory(row: SheetRow): ItemSlot[] {
  return [
    ...(row["Starting-Inventory"]
      ? (row["Starting-Inventory"] as string)
          .split(",")
          .map((item) => ({ name: item.trim() as ItemName, locked: false }))
      : []),
    ...(row["Locked-Starting-Inventory"]
      ? (row["Locked-Starting-Inventory"] as string)
          .split(",")
          .map((item) => ({ name: item.trim() as ItemName, locked: true }))
      : []),
  ];
}

function calculateLevel(
  tierIndex: number,
  level: number,
  isLaguz: boolean
): number {
  // const baseTierIndex = parseIntSafe(row['Base'] as string) - 1;
  return level - 20 * tierIndex * +!isLaguz;
}

function applyExaltedBonuses(
  units: Record<UnitName, UnitData>,
  exaltedBonusRows: SheetRow[]
): void {
  exaltedBonusRows.forEach((row) => {
    const unitName = row.Name as UnitName;
    // const version = row['Affinity-1st'] as Version;
    // if Affinity-1st in the row use it, otherwise, if Affinity-2nd in the row use it, otherwise use DEFAULT
    const version = row["Affinity-1st"]
      ? (row["Affinity-1st"] as Version)
      : row["Affinity-2nd"]
      ? (row["Affinity-2nd"] as Version)
      : null;
    if (version && units[unitName] && version !== Version.DEFAULT) {
      applyExaltedBonusToUnit(units[unitName], row, version);
    }
  });
}

function mergeWithDefault<T>(
  versionedValue: Versioned<T[]>,
  newValueString: string | undefined,
  version: Version
): void {
  if (!newValueString) {
    // If no new value is provided, don't change anything
    return;
  }

  const defaultItems = versionedValue.get(Version.DEFAULT) || [];
  const newItems = newValueString.split(",").map((item) => item.trim());

  let resultItems: T[] = [];
  let defaultInserted = false;

  newItems.forEach((item) => {
    if (item === "DEFAULT") {
      // Insert default items here, but only if we haven't done so already
      if (!defaultInserted) {
        resultItems = [...resultItems, ...defaultItems];
        defaultInserted = true;
      }
    } else {
      // Add the new item if it's not already in the result
      const typedItem = item as T;
      if (!resultItems.includes(typedItem)) {
        resultItems.push(typedItem);
      }
    }
  });

  // Remove duplicates while preserving order
  resultItems = resultItems.filter(
    (item, index, self) => index === self.findIndex((t) => t === item)
  );

  // Update the versioned value
  updateVersionedValue(versionedValue, resultItems, version);
}

function applyExaltedBonusToUnit(
  unit: UnitData,
  row: SheetRow,
  version: Version
): void {
  // Apply growths bonuses
  Object.values(GrowthStat).forEach((stat) => {
    const key = `${stat}-Growth`;
    if (key in row) {
      updateVersionedValue(
        unit.growths[stat],
        parseIntSafe(row[key] as string),
        version
      );
    }
  });

  // Apply base stats bonuses
  [...Object.values(GrowthStat), ...Object.values(NonGrowthStat)].forEach(
    (stat: GrowthStat | NonGrowthStat) => {
      if (stat in row) {
        updateVersionedValue(
          unit.baseStats[stat],
          parseIntSafe(row[stat] as string),
          version
        );
      }
    }
  );

  // Apply other versioned properties
  const otherProperties: Array<{ 
    key: string; 
    property: Versioned<number> | Versioned<string>; 
    parser: (value: string) => number | string;
  }> = [
    { 
      key: "Shift-Mov-Bonus", 
      property: unit.shiftedMoveBonus, 
      parser: parseIntSafe 
    },
    { 
      key: "Authority", 
      property: unit.authority, 
      parser: parseIntSafe 
    },
    { 
      key: "Level", 
      property: unit.baseLevel, 
      parser: (value: string) => calculateLevel(
        parseIntSafe(row["Base"] as string) - 1,
        parseIntSafe(value),
        unit.isLaguz
      )
    },
    { 
      key: "First-Appears", 
      property: unit.firstAppears, 
      parser: (value: string) => value as ChapterNumbering 
    },
  ];

  otherProperties.forEach(({ key, property, parser }) => {
    if (key in row) {
      const value = parser(row[key] as string);
      if (typeof value === 'number' && typeof property.get(Version.DEFAULT) === 'number') {
        updateVersionedValue(property as Versioned<number>, value, version);
      } else if (typeof value === 'string' && typeof property.get(Version.DEFAULT) === 'string') {
        updateVersionedValue(property as Versioned<string>, value, version);
      }
    }
  });

  const tierNames = ["T1", "T2", "T3", "T4"];

  // Apply tier-specific bonuses
  unit.tiers.forEach((tier) => {
    const index = tier.tierIndex;
    const tierName = `T${index + 1}`;
    const existsNextTier =
      row[tierNames[index + 1]] && row[tierNames[index + 1]] !== "-";
    const nextTierName =
      index < tierNames.length - 1 && existsNextTier
        ? tierNames[index + 1]
        : null;
    const isLaguz = unit.isLaguz;

    if (nextTierName && `Default-${nextTierName}-Promo-Level` in row) {
      updateVersionedValue(
        tier.defaultPromoLevel,
        nextTierName
          ? calculateLevel(
              index,
              parseIntSafe(
                row[`Default-${nextTierName}-Promo-Level`] as string,
                null
              ),
              isLaguz
            )
          : null,
        version
      );
    }

    Object.values(GrowthStat).forEach((stat) => {
      const key = `${tierName}-${stat}-Cap`;
      if (key in row) {
        updateVersionedValue(
          tier.caps[stat],
          parseIntSafe(row[key] as string),
          version
        );
      }
    });

    if (tier.statsPromo) {
      [...Object.values(GrowthStat), ...Object.values(NonGrowthStat)].forEach(
        (stat: GrowthStat | NonGrowthStat) => {
          const key = `${nextTierName}-${stat}-Promo`;
          if (key in row) {
            updateVersionedValue(
              tier.statsPromo![stat],
              parseIntSafe(row[key] as string),
              version
            );
          }
        }
      );
    }

    const skillsKey = `${tierName}-Skills`;
    if (skillsKey in row) {
      mergeWithDefault<SkillName>(
        tier.skills,
        row[skillsKey] as string,
        version
      );
    }

    const classTypeKey = `${tierName}-Class-Type`;
    if (classTypeKey in row) {
      mergeWithDefault<ClassType>(
        tier.classType,
        row[classTypeKey] as string,
        version
      );
    }

    const weaponRanksKey = `${tierName}-Min-Weapon-Ranks`;
    if (weaponRanksKey in row) {
      const newWeaponRanks = parseMinWeaponRanks(row[weaponRanksKey] as string);
      Object.entries(newWeaponRanks).forEach(([weaponType, rank]) => {
        updateVersionedValue(
          tier.minWeaponRanks[weaponType as WeaponType],
          rank.get(Version.DEFAULT)!,
          version
        );
      });
    }
  });

  // Apply starting inventory changes
  const newStartingInventory = processStartingInventory(row);
  if (newStartingInventory.length > 0) {
    let resultInventory = [...newStartingInventory];
    if (newStartingInventory.some((item) => item.name === "DEFAULT")) {
      const defaultInventory =
        unit.startingInventory.get(Version.DEFAULT) || [];
      resultInventory = resultInventory.flatMap((item) =>
        item.name === "DEFAULT" ? defaultInventory : [item]
      );
    }
    // Remove duplicates while preserving order
    resultInventory = resultInventory.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.name === item.name && t.locked === item.locked)
    );
    updateVersionedValue(unit.startingInventory, resultInventory, version);
  }
}

export { fetchUnits };

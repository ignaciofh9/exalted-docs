import { 
  GameData, Versioned, Item, Weapon, UsableItem, Card, MiscItem, Equipment,
  ItemName, UnitName, AffinityType, ItemType, WeaponType, WeaponTrianglePosition, 
  WeaponRank, WeaponRankOrPrf, ClassType, VersionedStats, VersionedWeaponRange, ConsecutiveAttackType,
  createVersioned, Version, GrowthStat, NonGrowthStat
} from '@/app/types';
import { getAllRows, SheetRow } from '@/app/utils/sheets';
import { parseIntSafe } from './utils';

async function fetchItems(): Promise<Record<ItemName, Item>> {
  const itemsRows = await getAllRows('Items');
  const weaponsRows = await getAllRows('Weapons');
  const equipmentRows = await getAllRows('Equipment');

  // Sort rows by Version, ensuring DEFAULT comes first
  const sortRows = (rows: SheetRow[]) => 
    rows.sort((a, b) => (a.Version === Version.DEFAULT ? -1 : (b.Version === Version.DEFAULT ? 1 : 0)));

  const sortedItemsRows = sortRows(itemsRows);
  const sortedWeaponsRows = sortRows(weaponsRows);
  const sortedEquipmentRows = sortRows(equipmentRows);

  const gameItems: Record<ItemName, Item> = {};

  processWeaponsSheet(sortedWeaponsRows, gameItems);
  processEquipmentSheet(sortedEquipmentRows, gameItems);
  processItemsSheet(sortedItemsRows, gameItems);

  return gameItems;
}

function processWeaponsSheet(rows: SheetRow[], gameItems: Record<ItemName, Item>) {
  rows.forEach(row => {
    const itemName = row.Name as ItemName;
    if (!gameItems[itemName]) {
      gameItems[itemName] = createWeapon(row);
    } else {
      updateWeapon(gameItems[itemName] as Weapon, row);
    }
  });
}

function processEquipmentSheet(rows: SheetRow[], gameItems: Record<ItemName, Item>) {
  rows.forEach(row => {
    const itemName = row.Name as ItemName;
    if (!gameItems[itemName]) {
      gameItems[itemName] = createEquipment(row);
    } else {
      updateEquipment(gameItems[itemName] as Equipment, row);
    }
  });
}

function processItemsSheet(rows: SheetRow[], gameItems: Record<ItemName, Item>) {
  rows.forEach(row => {
    const itemName = row.Name as ItemName;
    const isCard = row['Is-Card'] === 'TRUE';
    const hasUses = row.Uses !== undefined && row.Uses !== null && row.Uses !== '';

    if (isCard) {
      if (!gameItems[itemName]) {
        gameItems[itemName] = createCard(row);
      } else {
        updateCard(gameItems[itemName] as Card, row);
      }
    } else if (hasUses) {
      if (!gameItems[itemName]) {
        gameItems[itemName] = createUsableItem(row);
      } else {
        updateUsableItem(gameItems[itemName] as UsableItem, row);
      }
    } else {
      if (!gameItems[itemName]) {
        gameItems[itemName] = createMiscItem(row);
      } else {
        updateMiscItem(gameItems[itemName] as MiscItem, row);
      }
    }
  });
}

function createVersionedValue<T>(value: T, version: Version): Versioned<T> {
  return createVersioned({ [version]: value });
}

function updateVersionedValue<T>(versioned: Versioned<T>, value: T, version: Version) {
  if (version === Version.DEFAULT || versioned.get(Version.DEFAULT) !== value) {
    versioned[version] = value;
  }
}

function processCommaSeparatedValues<T>(defaultValues: T[] | undefined, newValues: string, processFn: (value: string) => T): T[] {
  if (newValues.includes('DEFAULT')) {
    const otherValues = newValues.split(',')
      .filter(v => v.trim() !== 'DEFAULT')
      .map(v => processFn(v.trim()));
    return [...(defaultValues || []), ...otherValues];
  } else {
    return newValues.split(',').map(v => processFn(v.trim()));
  }
}

function createCard(row: SheetRow): Card {
  const version = row.Version as Version;
  return {
    name: row.Name as ItemName,
    type: ItemType.Card,
    description: createVersionedValue(row.Description as string, version),
    uses: createVersionedValue(parseIntSafe(row.Uses as string), version),
    worth: createVersionedValue(parseIntSafe(row.Worth as string), version),
    might: createVersionedValue(parseIntSafe(row.Might as string), version),
    hit: createVersionedValue(parseIntSafe(row.Hit as string), version),
    crit: createVersionedValue(parseIntSafe(row.Crit as string), version),
    range: {
      min: createVersionedValue(parseIntSafe(row['Min-Range'] as string), version),
      max: createVersionedValue(parseIntSafe(row.MaxRange as string), version)
    }
  };
}

function updateCard(card: Card, row: SheetRow) {
  const version = row.Version as Version;
  updateVersionedValue(card.description, row.Description as string, version);
  updateVersionedValue(card.uses, parseIntSafe(row.Uses as string), version);
  updateVersionedValue(card.worth, parseIntSafe(row.Worth as string), version);
  updateVersionedValue(card.might, parseIntSafe(row.Might as string), version);
  updateVersionedValue(card.hit, parseIntSafe(row.Hit as string), version);
  updateVersionedValue(card.crit, parseIntSafe(row.Crit as string), version);
  updateVersionedValue(card.range.min, parseIntSafe(row['Min-Range'] as string), version);
  updateVersionedValue(card.range.max, parseIntSafe(row.MaxRange as string), version);
}

function createUsableItem(row: SheetRow): UsableItem {
  const version = row.Version as Version;
  return {
    name: row.Name as ItemName,
    type: ItemType.Usable,
    description: createVersionedValue(row.Description as string, version),
    uses: createVersionedValue(parseIntSafe(row.Uses as string), version),
    worth: createVersionedValue(parseIntSafe(row.Worth as string), version)
  };
}

function updateUsableItem(item: UsableItem, row: SheetRow) {
  const version = row.Version as Version;
  updateVersionedValue(item.description, row.Description as string, version);
  updateVersionedValue(item.uses, parseIntSafe(row.Uses as string), version);
  updateVersionedValue(item.worth, parseIntSafe(row.Worth as string), version);
}

function createMiscItem(row: SheetRow): MiscItem {
  const version = row.Version as Version;
  return {
    name: row.Name as ItemName,
    type: ItemType.Misc,
    description: createVersionedValue(row.Description as string, version),
    uses: createVersionedValue(null, version),
    worth: createVersionedValue(parseIntSafe(row.Worth as string), version)
  };
}

function updateMiscItem(item: MiscItem, row: SheetRow) {
  const version = row.Version as Version;
  updateVersionedValue(item.description, row.Description as string, version);
  updateVersionedValue(item.worth, parseIntSafe(row.Worth as string), version);
}

function createWeapon(row: SheetRow): Weapon {
  const version = row.Version as Version;
  return {
    name: row.Name as ItemName,
    type: ItemType.Weapon,
    description: createVersionedValue(row.Description as string, version),
    uses: createVersionedValue(row.Uses ? parseIntSafe(row.Uses as string) : null, version),
    worth: createVersionedValue(parseIntSafe(row.Worth as string), version),
    weaponType: createVersionedValue(row['Equip-Type'] as WeaponType, version),
    trianglePosition: createVersionedValue(row['Triangle-Position'] as WeaponTrianglePosition, version),
    rank: createVersionedValue(row.Rank as WeaponRankOrPrf, version),
    might: createVersionedValue(parseIntSafe(row.Might as string), version),
    hit: createVersionedValue(parseIntSafe(row.Hit as string), version),
    crit: createVersionedValue(parseIntSafe(row.Crit as string), version),
    weight: createVersionedValue(parseIntSafe(row.Weight as string), version),
    range: createVersionedValue({
      min: createVersionedValue(parseIntSafe(row['Min-Range'] as string), version),
      max: createVersionedValue(parseIntSafe(row.MaxRange as string), version)
    }, version),
    aura: createVersionedValue((row.Aura as string).toLowerCase() === 'true', version),
    crossbow: createVersionedValue((row.Crossbow as string).toLowerCase() === 'true', version),
    effective: createVersionedValue(
      processCommaSeparatedValues(undefined, row.Effective as string, v => v as ClassType),
      version
    ),
    equipStatBonuses: createVersionedValue(createStatBonuses(row), version),
    weaponExp: createVersionedValue(parseIntSafe(row.Wex as string), version),
    consecutive: createVersionedValue((row['Consecutive-Attacks'] || 'Never') as ConsecutiveAttackType, version),
    recharge: createVersionedValue(row.Recharge ? parseIntSafe(row.Recharge as string) : null, version),
    preferredUsers: createVersionedValue(
      processCommaSeparatedValues(undefined, row['Prf-Users'] as string, v => v as UnitName),
      version
    )
  };
}

function updateWeapon(weapon: Weapon, row: SheetRow) {
  const version = row.Version as Version;
  updateVersionedValue(weapon.description, row.Description as string, version);
  updateVersionedValue(weapon.uses, row.Uses ? parseIntSafe(row.Uses as string) : null, version);
  updateVersionedValue(weapon.worth, parseIntSafe(row.Worth as string), version);
  updateVersionedValue(weapon.weaponType, row['Equip-Type'] as WeaponType, version);
  updateVersionedValue(weapon.trianglePosition, row['Triangle-Position'] as WeaponTrianglePosition, version);
  updateVersionedValue(weapon.rank, row.Rank as WeaponRankOrPrf, version);
  updateVersionedValue(weapon.might, parseIntSafe(row.Might as string), version);
  updateVersionedValue(weapon.hit, parseIntSafe(row.Hit as string), version);
  updateVersionedValue(weapon.crit, parseIntSafe(row.Crit as string), version);
  updateVersionedValue(weapon.weight, parseIntSafe(row.Weight as string), version);
  updateVersionedValue(weapon.range, {
    min: parseIntSafe(row['Min-Range'] as string),
    max: parseIntSafe(row.MaxRange as string)
  }, version);
  updateVersionedValue(weapon.aura, (row.Aura as string).toLowerCase() === 'true', version);
  updateVersionedValue(weapon.crossbow, (row.Crossbow as string).toLowerCase() === 'true', version);
  updateVersionedValue(weapon.effective, 
    processCommaSeparatedValues(
      weapon.effective.get(Version.DEFAULT),
      row.Effective as string,
      v => v as ClassType
    ),
    version
  );
  updateVersionedValue(weapon.equipStatBonuses, createStatBonuses(row), version);
  updateVersionedValue(weapon.weaponExp, parseIntSafe(row.Wex as string), version);
  updateVersionedValue(weapon.consecutive, (row['Consecutive-Attacks'] || 'Never') as ConsecutiveAttackType, version);
  updateVersionedValue(weapon.recharge, row.Recharge ? parseIntSafe(row.Recharge as string) : null, version);
  updateVersionedValue(weapon.preferredUsers, 
    processCommaSeparatedValues(
      weapon.preferredUsers.get(Version.DEFAULT),
      row['Prf-Users'] as string,
      v => v as UnitName
    ),
    version
  );
}

function createEquipment(row: SheetRow): Equipment {
  const version = row.Version as Version;
  return {
    name: row.Name as ItemName,
    type: ItemType.Equipment,
    description: createVersionedValue(row.Description as string, version),
    uses: createVersionedValue(null, version),
    worth: createVersionedValue(parseIntSafe(row.Worth as string), version),
    statBonuses: createStatBonuses(row)
  };
}

function updateEquipment(equipment: Equipment, row: SheetRow) {
  const version = row.Version as Version;
  updateVersionedValue(equipment.description, row.Description as string, version);
  updateVersionedValue(equipment.worth, parseIntSafe(row.Worth as string), version);
  updateStatBonuses(equipment.statBonuses, row);
}

function createStatBonuses(row: SheetRow): VersionedStats {
  const version = row.Version as Version;
  return {
    [GrowthStat.HP]: createVersionedValue(parseIntSafe(row['HP-Bonus'] as string) || 0, version),
    [GrowthStat.STR]: createVersionedValue(parseIntSafe(row['Str-Bonus'] as string) || 0, version),
    [GrowthStat.MAG]: createVersionedValue(parseIntSafe(row['Mag-Bonus'] as string) || 0, version),
    [GrowthStat.SKL]: createVersionedValue(parseIntSafe(row['Skl-Bonus'] as string) || 0, version),
    [GrowthStat.SPD]: createVersionedValue(parseIntSafe(row['Spd-Bonus'] as string) || 0, version),
    [GrowthStat.LCK]: createVersionedValue(parseIntSafe(row['Lck-Bonus'] as string) || 0, version),
    [GrowthStat.DEF]: createVersionedValue(parseIntSafe(row['Def-Bonus'] as string) || 0, version),
    [GrowthStat.RES]: createVersionedValue(parseIntSafe(row['Res-Bonus'] as string) || 0, version),
    [NonGrowthStat.MOVE]: createVersionedValue(parseIntSafe(row['Mov-Bonus'] as string) || 0, version),
    [NonGrowthStat.SHOVE]: createVersionedValue(parseIntSafe(row['Shove-Bonus'] as string) || 0, version),
    [NonGrowthStat.WEIGHT]: createVersionedValue(parseIntSafe(row['Weight-Bonus'] as string) || 0, version)
  };
}

function updateStatBonuses(statBonuses: VersionedStats, row: SheetRow) {
  const version = row.Version as Version;
  updateVersionedValue(statBonuses.HP, parseIntSafe(row['HP-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Str, parseIntSafe(row['Str-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Mag, parseIntSafe(row['Mag-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Skl, parseIntSafe(row['Skl-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Spd, parseIntSafe(row['Spd-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Lck, parseIntSafe(row['Lck-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Def, parseIntSafe(row['Def-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Res, parseIntSafe(row['Res-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Move, parseIntSafe(row['Mov-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Shove, parseIntSafe(row['Shove-Bonus'] as string) || 0, version);
  updateVersionedValue(statBonuses.Weight, parseIntSafe(row['Weight-Bonus'] as string) || 0, version);
}

// Export all necessary functions
export {
  fetchItems,
  createCard,
  updateCard,
  createUsableItem,
  updateUsableItem,
  createMiscItem,
  updateMiscItem,
  createWeapon,
  updateWeapon,
  createEquipment,
  updateEquipment,
  createStatBonuses,
  updateStatBonuses
};
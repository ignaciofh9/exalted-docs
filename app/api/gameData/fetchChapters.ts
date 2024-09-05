// docs/exalted-docs/app/api/gameData/fetchChapters.ts

import { ChapterName, AffinityType, DifficultyType, VersionedChapterData, Chapter, 
  Availability, AvailabilityType, ItemName, UnitName, Conversation, Versioned, 
  ChapterNumbering, Version, NonVersionedChapterData } from '@/app/types';
import { getAllRows, SheetRow } from '@/app/utils/sheets';
import { parseIntSafe } from './utils';
import { createVersioned } from '@/app/types/baseTypes';

export async function fetchChapters(): Promise<Record<ChapterNumbering, Chapter>> {
  const chapterRows = await getAllRows('Chapters');
  const conversationRows = await getAllRows('Conversations');
  const chapters: Record<ChapterNumbering, Chapter> = {};

  const conversationsByChapter = processConversations(conversationRows);

  const groupedByChapter: Record<ChapterNumbering, SheetRow[]> = {};
  chapterRows.forEach(row => {
    const numbering = row.Numbering as ChapterNumbering;
    if (!groupedByChapter[numbering]) groupedByChapter[numbering] = [];
    groupedByChapter[numbering].push(row);
  });

  Object.entries(groupedByChapter).forEach(([numbering, rows]) => {
    const firstRow = rows[0];
    chapters[numbering as ChapterNumbering] = {
      name: firstRow.Name as ChapterName,
      numbering: numbering as ChapterNumbering,
      indexing: {
        part: parseIntSafe(firstRow.Part as string),
        index: parseIntSafe(firstRow.Index as string)
      },
      perDifficultyData: {} as Record<DifficultyType, VersionedChapterData>
    };

    const groupedByDifficulty: Record<DifficultyType, SheetRow[]> = {
      [DifficultyType.Normal]: [],
      [DifficultyType.Hard]: [],
      [DifficultyType.Maniac]: []
    };

    rows.forEach(row => {
      if (!row.Difficulty) return;
      const difficulty = row.Difficulty as DifficultyType;
      groupedByDifficulty[difficulty].push(row);
    });

    Object.entries(groupedByDifficulty).forEach(([difficulty, difficultyRows]) => {
      const versionedData: Record<AffinityType, NonVersionedChapterData> = {} as Record<AffinityType, NonVersionedChapterData>;
      
      difficultyRows.forEach(row => {
        const version = row.Version as AffinityType;
        versionedData[version] = convertRowToChapterData(row, conversationsByChapter[numbering] || []);
      });

      chapters[numbering as ChapterNumbering].perDifficultyData[difficulty as DifficultyType] = {
        hasBase: createVersioned(createVersionedProperty(versionedData, 'hasBase', false)),
        hasSkills: createVersioned(createVersionedProperty(versionedData, 'hasSkills', false)),
        affinity: createVersioned(createVersionedProperty(versionedData, 'affinity', AffinityType.Fire)),
        commander: createVersioned(createVersionedProperty(versionedData, 'commander', '' as UnitName)),
        objective: createVersioned(createVersionedProperty(versionedData, 'objective', '')),
        bargains: createVersioned(createVersionedProperty(versionedData, 'bargains', [])),
        conversations: createVersioned(createVersionedProperty(versionedData, 'conversations', [])),
        startingNumUnits: createVersioned(createVersionedProperty(versionedData, 'startingNumUnits', 0)),
        unitsAvailable: createVersioned(createVersionedProperty(versionedData, 'unitsAvailable', {})),
        turnBonusExp: createVersioned(createVersionedProperty(versionedData, 'turnBonusExp', {})),
        otherBonusExp: createVersioned(createVersionedProperty(versionedData, 'otherBonusExp', {}))
      };
    });
  });

  return chapters;
}

function createVersionedProperty<T>(
  data: Record<AffinityType, NonVersionedChapterData>,
  key: keyof NonVersionedChapterData,
  defaultValue: T
): Record<AffinityType, T> {
  return Object.values(AffinityType).reduce((acc, affinity) => {
    acc[affinity] = (data[affinity] && data[affinity][key] as T) || defaultValue;
    return acc;
  }, {} as Record<AffinityType, T>);
}

function processConversations(rows: SheetRow[]): Record<ChapterNumbering, Conversation[]> {
  const conversations: Record<ChapterNumbering, Conversation[]> = {};

  rows.forEach(row => {
    const chapterNumbering = row['Chapter-Numbering'] as ChapterNumbering;
    const conversation: Conversation = {
      name: row.Name as string,
      requiredUnits: (row['Required-Units'] as string || '').split(',').map(unit => unit.trim() as UnitName),
      requiredEvents: (row['Required-Events'] as string || '').split(',').map(event => event.trim()),
      importance: parseIntSafe(row.Importance as string),
      description: row.Description as string,
      reward: parseConversationReward(row)
    };

    if (!conversations[chapterNumbering]) {
      conversations[chapterNumbering] = [];
    }
    conversations[chapterNumbering].push(conversation);
  });

  return conversations;
}

function parseConversationReward(row: SheetRow): ItemName | number | UnitName | string | null {
  if (row['Item-Gained']) return row['Item-Gained'] as ItemName;
  if (row['Gold-Gained']) return parseIntSafe(row['Gold-Gained'] as string);
  if (row['Units-Gained']) return row['Units-Gained'] as UnitName;
  if (row['Other-Gained']) return row['Other-Gained'] as string;
  return null;
}

function convertRowToChapterData(row: SheetRow, chapterConversations: Conversation[]): NonVersionedChapterData {
  return {
    hasBase: row['Has-Base'] === 'TRUE',
    hasSkills: row['Has-Skills'] === 'TRUE',
    affinity: row.Affinity as AffinityType,
    commander: row.Commander as UnitName,
    objective: row.Objective as string,
    bargains: (row.Bargains as string).split(',').map(item => item.trim() as ItemName),
    conversations: chapterConversations,
    startingNumUnits: parseIntSafe(row['Num-Start-Units'] as string),
    unitsAvailable: parseUnitsAvailability(row),
    turnBonusExp: parseTurnBonusExp(row),
    otherBonusExp: parseOtherBonusExp(row)
  };
}

function parseUnitsAvailability(row: SheetRow): Record<UnitName, Availability> {
  const unitsAvailable: Record<UnitName, Availability> = {};

  // Parse forced units
  (row['Forced-Units'] as string).split(',').forEach(unit => {
    unitsAvailable[unit.trim() as UnitName] = { type: AvailabilityType.Forced, appearanceTurn: null };
  });

  // Parse available units
  (row['Available-Units'] as string).split(',').forEach(unit => {
    if (unit.trim()) {
      unitsAvailable[unit.trim() as UnitName] = { type: AvailabilityType.Available, appearanceTurn: null };
    }
  });

  // Parse blocked units
  (row['Blocked-Units'] as string).split(',').forEach(unit => {
    if (unit.trim()) {
      unitsAvailable[unit.trim() as UnitName] = { type: AvailabilityType.Blocked, appearanceTurn: null };
    }
  });

  // Parse turn-based forced units
  const turnForcedUnits = row['Turn_Forced-Units'] as { [turn: string]: string };
  Object.entries(turnForcedUnits).forEach(([turn, units]) => {
    units.split(',').forEach(unit => {
      unitsAvailable[unit.trim() as UnitName] = { type: AvailabilityType.Forced, appearanceTurn: parseIntSafe(turn) };
    });
  });

  // Parse turn-based recruitable units
  const turnRecruitableUnits = row['Turn_Recruitable-Units'] as { [turn: string]: string };
  Object.entries(turnRecruitableUnits).forEach(([turn, units]) => {
    units.split(',').forEach(unit => {
      unitsAvailable[unit.trim() as UnitName] = { type: AvailabilityType.Recruited, appearanceTurn: parseIntSafe(turn) };
    });
  });

  return unitsAvailable;
}

function parseTurnBonusExp(row: SheetRow): Record<number, number> {
  const turnBonusExp: Record<number, number> = {};
  const turnBExpData = row['Turn_BExp'] as { [turn: string]: string };
  
  Object.entries(turnBExpData).forEach(([turn, exp]) => {
    turnBonusExp[parseIntSafe(turn)] = parseIntSafe(exp);
  });

  return turnBonusExp;
}

function parseOtherBonusExp(row: SheetRow): Record<string, number> {
  const otherBonusExp: Record<string, number> = {};
  const otherBExpData = row['BExp-Description_BExp'] as { [description: string]: string };
  
  Object.entries(otherBExpData).forEach(([description, exp]) => {
    otherBonusExp[description] = parseIntSafe(exp);
  });

  return otherBonusExp;
}
// app/utils/sheets.ts
import { google } from 'googleapis';

const sheets = google.sheets('v4');

export type NestedSheetValue = {
    [key: string]: string | NestedSheetValue;
};

export type SheetRow = {
    [key: string]: string | NestedSheetValue;
};

// Constants for group keys
const GROUP_KEYS = {
    TURN: 'Turn',
    BEXP_DESCRIPTION: 'BExp-Description'
} as const;

type GroupKey = typeof GROUP_KEYS[keyof typeof GROUP_KEYS];

async function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function fetchSheetData(sheetName: string): Promise<SheetRow[]> {
  const auth = await getAuthClient();
  const sheetsResponse = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A:ZZ`,
    majorDimension: 'ROWS',
  });

  const rows = sheetsResponse.data.values;
  if (!rows || rows.length === 0) {
    throw new Error('No data found');
  }

  const headers = rows[0] as string[];
  const groupedHeaders: { [key: string]: number[] } = {};
  const groupedColumns = new Set<number>();

  // Process headers
  headers.forEach((header, index) => {
    if (isGroupKey(header)) {
      const nextHeader = headers[index + 1];
      const groupKey = `${header}_${nextHeader}`;
      if (!groupedHeaders[groupKey]) {
        groupedHeaders[groupKey] = [];
      }
      groupedHeaders[groupKey].push(index + 1);
      groupedColumns.add(index + 1);
    }
  });

  // Process rows
  return rows.slice(1).map((row: string[]) => {
    const processedRow: SheetRow = {};

    // Process regular headers
    headers.forEach((header, index) => {
      if (!isGroupKey(header) && !groupedColumns.has(index)) {
        processedRow[header] = row[index] || '';
      }
    });

    // Process grouped headers
    Object.entries(groupedHeaders).forEach(([groupKey, indices]) => {
      processedRow[groupKey] = {};
      indices.forEach(index => {
        const key = row[index - 1] || '';
        const value = row[index] || '';
        if (key && value) {
          (processedRow[groupKey] as NestedSheetValue)[key] = value;
        }
      });
    });

    return processedRow;
  });
}

function isGroupKey(key: string): key is GroupKey {
  return Object.values(GROUP_KEYS).includes(key as GroupKey);
}

async function findRowsByPredicate(
  sheetName: string, 
  predicate: (row: SheetRow) => boolean = () => true,
  skipEmptyRows: boolean = true
): Promise<SheetRow[]> {
  try {
    const rows = await fetchSheetData(sheetName);
    return rows.filter(row => {
      if (skipEmptyRows && isRowEmpty(row)) {
        return false;
      }
      return predicate(row);
    });
  } catch (error) {
    console.error(`Error finding rows in sheet ${sheetName}:`, error);
    throw error;
  }
}

function isRowEmpty(row: SheetRow): boolean {
  return Object.values(row).every(value => 
    typeof value === 'string' ? value === '' : isRowEmpty(value as NestedSheetValue)
  );
}

async function findRowByPredicate(
  sheetName: string, 
  predicate: (row: SheetRow) => boolean
): Promise<SheetRow | undefined> {
  const rows = await findRowsByPredicate(sheetName, predicate);
  return rows[0];
}

async function getAllRows(sheetName: string, skipEmptyRows: boolean = true): Promise<SheetRow[]> {
  return findRowsByPredicate(sheetName, () => true, skipEmptyRows);
}

export { fetchSheetData, findRowsByPredicate, findRowByPredicate, getAllRows };
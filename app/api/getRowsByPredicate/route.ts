// docs/exalted-docs/app/api/getRowsByPredicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findRowsByPredicate } from '@/app/utils/sheets';
import { SheetRow } from '@/app/utils/sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetName, predicateFunction, skipEmptyRows = true } = body;

    if (!sheetName || typeof sheetName !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing sheetName' }, { status: 400 });
    }

    if (typeof predicateFunction !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing predicateFunction' }, { status: 400 });
    }

    // Convert the predicateFunction string to a function
    const predicate = new Function('row', `return ${predicateFunction}`) as (row: SheetRow) => boolean;

    const rows = await findRowsByPredicate(sheetName);

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error in getRowsByPredicate API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
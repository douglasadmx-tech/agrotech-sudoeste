import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'data_agrotech_safras.csv');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo sample não encontrado' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="data_agrotech_safras.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { generateBuyerCopilotInsights, CopilotAnalysisInput } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body: CopilotAnalysisInput = await req.json();

    if (!body.commodities || !body.totalRows) {
      return NextResponse.json(
        { error: 'Dados insuficientes para a geração da análise.' },
        { status: 400 }
      );
    }

    const insights = await generateBuyerCopilotInsights(body);

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro na rota /api/buyer-copilot:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao processar inteligência de compras.' },
      { status: 500 }
    );
  }
}

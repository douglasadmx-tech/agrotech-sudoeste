// Tipos e Interfaces do AgroTech Sudoeste

export interface CommodityQuote {
  id: string;
  name: string;
  source: string; // Ex: 'B3' | 'CEPEA/Esalq' | 'Conselei'
  unit: string;   // Ex: 'R$ / Saca 60kg' | 'R$ / @' | 'R$ / Litro'
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  sparkline: number[];
  categoryImpact: string; // Ex: 'Óleos vegetais e margarinas'
  semanticTag: string;    // Ex: 'Janela de Compra: Óleo de Soja'
  alertType: 'alta' | 'neutro' | 'queda' | 'pressao';
  lastUpdated: string;
}

export interface IngestedFileMeta {
  id: string;
  name: string;
  sizeBytes: number;
  totalRows: number;
  validRows: number;
  repairedRows: number;
  quarantinedRows: number;
  effectivePercent: number;
  status: 'reading' | 'annealing' | 'syncing' | 'completed' | 'error';
  speedRowsPerSec: number;
  uploadedAt: string;
}

export interface QuarantineRecord {
  fileId: string;
  fileName: string;
  rowNumber: number;
  rawContent: string;
  detectedError: string;
  actionTaken: 'repaired' | 'isolated';
  repairedValue?: string;
  timestamp: string;
}

export interface PurchaseRecord {
  talhao_id?: string;
  municipio?: string;
  cultura?: string;
  safra?: string;
  quantidade?: number;
  custo_unitario?: number;
  cotacao_mercado?: number;
  tendencia?: string;
  status_estoque?: string;
  raw?: Record<string, any>;
}

export interface CopilotRecommendation {
  commodity: string;
  action: 'COMPRA FORTE' | 'COMPRA MÍNIMA' | 'RENEGOCIAR FORNECEDOR' | 'NEUTRO';
  confidence: number;
  summary: string;
  tacticalAdvice: string;
  impactMetrics: {
    suggestedRenegotiation?: string;
    coverageDays?: number;
    priceDelta?: string;
  };
  generatedBy: 'Gemini 3.8 Flash' | 'Self-Annealing Engine';
  timestamp: string;
}

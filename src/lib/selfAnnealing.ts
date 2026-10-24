import { QuarantineRecord } from '@/types';

export interface AnnealingResult {
  cleanedRow: Record<string, any> | null;
  status: 'valid' | 'repaired' | 'quarantined';
  quarantineRecord?: QuarantineRecord;
}

// Mapeamento persistente de colunas (Aprendizado Persistente da Regra 3 do SOP)
export const COLUMN_SYNONYMS: Record<string, string> = {
  vlr_unit_compra: 'custo_unitario',
  custo_producao_ha_r$: 'custo_unitario',
  cotacao_saca_60kg_r$: 'cotacao_mercado',
  preco_unitario: 'custo_unitario',
  vlr_compra: 'custo_unitario',
  qtd_comprada: 'quantidade',
  producao_total_estimada_ton: 'quantidade',
  cultura: 'cultura',
  produto: 'cultura',
  item: 'cultura',
  municipio: 'municipio',
  cidade: 'municipio',
  safra_ciclo: 'safra',
  tendencia_mercado: 'tendencia',
};

/**
 * Normaliza valores monetários e numéricos (Trata "R$ 1.250,50", "1250,50", espaços e pontos)
 */
export function sanitizeNumeric(value: any): { val: number | null; repaired: boolean } {
  if (value === null || value === undefined || value === '') {
    return { val: null, repaired: false };
  }
  if (typeof value === 'number') {
    return { val: isNaN(value) ? null : value, repaired: false };
  }

  const str = String(value).trim();
  let cleaned = str.replace(/[R$\s]/g, '');

  let repaired = false;
  // Se possui vírgula como decimal (ex: 1250,50 ou 1.250,50)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Formato brasileiro com milhar 1.250,50
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    repaired = true;
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
    repaired = true;
  }

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    return { val: null, repaired: false };
  }

  return { val: parsed, repaired: repaired || str !== String(parsed) };
}

/**
 * Normaliza o cabeçalho da linha baseado no aprendizado de schemas
 */
export function normalizeHeaders(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase().trim();
    const mapped = COLUMN_SYNONYMS[lowerKey] || lowerKey;
    normalized[mapped] = row[key];
  }
  return normalized;
}

/**
 * Processador de linha única do Self-Annealing
 */
export function annealRow(
  rawRow: Record<string, any>,
  rowNumber: number,
  fileId: string,
  fileName: string
): AnnealingResult {
  // 1. Verificar se a linha é totalmente vazia
  const values = Object.values(rawRow).filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
  if (values.length === 0) {
    return {
      cleanedRow: null,
      status: 'quarantined',
      quarantineRecord: {
        fileId,
        fileName,
        rowNumber,
        rawContent: JSON.stringify(rawRow),
        detectedError: 'Linha completamente vazia no arquivo',
        actionTaken: 'isolated',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // 2. Normalizar cabeçalhos de colunas
  const normalized = normalizeHeaders(rawRow);
  let wasRepaired = false;
  const repairsLog: string[] = [];

  // 3. Validação e Reparo de Colunas Críticas
  // Custo / Preço
  if ('custo_unitario' in normalized) {
    const { val, repaired } = sanitizeNumeric(normalized['custo_unitario']);
    if (val === null || val < 0) {
      return {
        cleanedRow: null,
        status: 'quarantined',
        quarantineRecord: {
          fileId,
          fileName,
          rowNumber,
          rawContent: JSON.stringify(rawRow),
          detectedError: `Custo inválido ou negativo: "${normalized['custo_unitario']}"`,
          actionTaken: 'isolated',
          timestamp: new Date().toISOString(),
        },
      };
    }
    normalized['custo_unitario'] = val;
    if (repaired) {
      wasRepaired = true;
      repairsLog.push('Moeda/Decimal normalizado');
    }
  }

  // Cotação Mercado
  if ('cotacao_mercado' in normalized) {
    const { val, repaired } = sanitizeNumeric(normalized['cotacao_mercado']);
    if (val !== null) {
      normalized['cotacao_mercado'] = val;
      if (repaired) wasRepaired = true;
    }
  }

  // Quantidade
  if ('quantidade' in normalized) {
    const { val, repaired } = sanitizeNumeric(normalized['quantidade']);
    if (val !== null && val >= 0) {
      normalized['quantidade'] = val;
      if (repaired) wasRepaired = true;
    }
  }

  // Cultura/Produto
  if (normalized['cultura']) {
    normalized['cultura'] = String(normalized['cultura']).trim();
  }

  return {
    cleanedRow: normalized,
    status: wasRepaired ? 'repaired' : 'valid',
    quarantineRecord: wasRepaired
      ? {
          fileId,
          fileName,
          rowNumber,
          rawContent: JSON.stringify(rawRow),
          detectedError: 'Formatação atípica de caractere ou vírgula',
          actionTaken: 'repaired',
          repairedValue: repairsLog.join('; '),
          timestamp: new Date().toISOString(),
        }
      : undefined,
  };
}

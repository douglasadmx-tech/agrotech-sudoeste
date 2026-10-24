'use client';

import React, { useState } from 'react';
import { CommodityQuote, PurchaseRecord, IngestedFileMeta } from '@/types';
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

interface BuyerCopilotProps {
  commodities: CommodityQuote[];
  purchases: PurchaseRecord[];
  filesMeta: IngestedFileMeta[];
  onCloudSyncRequested?: () => void;
}

export function BuyerCopilot({
  commodities,
  purchases,
  filesMeta,
  onCloudSyncRequested,
}: BuyerCopilotProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  // Consolidação estatística dos dados importados para enviar ao Gemini
  const generateInsights = async () => {
    setLoading(true);

    try {
      // Agrupar dados por cultura
      const summaryByCommodity: Record<
        string,
        {
          avgCost: number;
          volumeTon: number;
          sampleCount: number;
          locations: string[];
        }
      > = {};

      purchases.forEach((p) => {
        const cultura = (p.cultura || 'Geral').toLowerCase();
        if (!summaryByCommodity[cultura]) {
          summaryByCommodity[cultura] = {
            avgCost: 0,
            volumeTon: 0,
            sampleCount: 0,
            locations: [],
          };
        }
        const custo = Number(p.custo_unitario) || 0;
        const volume = Number(p.quantidade) || 1;
        summaryByCommodity[cultura].avgCost += custo;
        summaryByCommodity[cultura].volumeTon += volume;
        summaryByCommodity[cultura].sampleCount++;
        if (p.municipio && !summaryByCommodity[cultura].locations.includes(p.municipio)) {
          summaryByCommodity[cultura].locations.push(p.municipio);
        }
      });

      // Calcular médias
      Object.keys(summaryByCommodity).forEach((k) => {
        const item = summaryByCommodity[k];
        if (item.sampleCount > 0) {
          item.avgCost = item.avgCost / item.sampleCount;
        }
      });

      const totalRows = purchases.length;
      const validRows = purchases.length;
      const effectivePercent =
        filesMeta.length > 0 && filesMeta[0].totalRows > 0
          ? (validRows / filesMeta.reduce((acc, f) => acc + f.totalRows, 0)) * 100
          : 100;

      const payload = {
        totalRows,
        effectivePercent,
        files: filesMeta.map((f) => f.name),
        commodities: commodities.map((c) => ({
          name: c.name,
          source: c.source,
          price: c.currentPrice,
          change: c.changePercent,
          impact: c.categoryImpact,
        })),
        summaryByCommodity,
      };

      const res = await fetch('/api/buyer-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.insights) {
        setReport(data.insights);
        setLastGenerated(new Date().toLocaleTimeString('pt-BR'));
        if (onCloudSyncRequested) {
          onCloudSyncRequested();
        }
      }
    } catch (e) {
      console.error('Falha ao gerar relatório:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col h-full">
      {/* Header do Copilot */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Buyer Copilot Agent
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Pareceres executivos de compra, estocagem e renegociação para o supermercado
            </p>
          </div>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading || purchases.length === 0}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            purchases.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analisando Mercado...' : 'Gerar Parecer Gemini'}
        </button>
      </div>

      {/* Conteúdo / Insights */}
      <div className="flex-1 mt-4">
        {purchases.length === 0 ? (
          <div className="h-64 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">
              Aguardando Ingestão de Dados
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Importe um arquivo de compras ou clique em &quot;Carregar Base Sudoeste SP&quot; na Central de Ingestão para habilitar a IA.
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200/80 rounded-md w-full" />
            <div className="h-4 bg-slate-200/80 rounded-md w-5/6" />
            <div className="h-20 bg-slate-100 rounded-xl w-full mt-4" />
          </div>
        ) : report ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Análise Concluída
              </span>
              <span>Gerado às {lastGenerated}</span>
            </div>

            {/* Renderização do Texto do Relatório */}
            <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed max-h-[480px] overflow-y-auto pr-2 space-y-3">
              {report.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('###') || paragraph.startsWith('####')) {
                  return (
                    <h4 key={index} className="text-sm font-bold text-slate-900 mt-3 mb-1">
                      {paragraph.replace(/#+\s*/g, '')}
                    </h4>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={index} className="list-disc pl-4 text-xs space-y-1">
                      {paragraph.split('\n').map((li, liIdx) => (
                        <li key={liIdx}>{li.replace(/^-\s*/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={index} className="text-xs text-slate-600">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">
              Dados Carregados e Prontos para IA
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {purchases.length.toLocaleString('pt-BR')} registros mapeados. Clique em &quot;Gerar Parecer Gemini&quot; acima para cruzar custos do ERP com B3 e CEPEA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

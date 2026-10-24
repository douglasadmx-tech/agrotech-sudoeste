'use client';

import React from 'react';
import { CommodityQuote } from '@/types';
import { TrendingUp, TrendingDown, Minus, Wheat, Beef, Coffee, Milk, ShoppingBag } from 'lucide-react';

interface CommodityTickerProps {
  commodities: CommodityQuote[];
  selectedCommodityId?: string;
  onSelectCommodity?: (id: string) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  soja: <Wheat className="w-5 h-5 text-emerald-600" />,
  milho: <Wheat className="w-5 h-5 text-amber-600" />,
  'boi-gordo': <Beef className="w-5 h-5 text-rose-600" />,
  'cafe-arabica': <Coffee className="w-5 h-5 text-amber-800" />,
  'leite-uht': <Milk className="w-5 h-5 text-sky-600" />,
};

function renderSparklineSVG(data: number[], isPositive: boolean) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 26;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function CommodityTicker({
  commodities,
  selectedCommodityId,
  onSelectCommodity,
}: CommodityTickerProps) {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-600">
            Cotações ao Vivo (B3 & CEPEA/Esalq)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Mercado Físico & Futuro • Atualização Automática
        </span>
      </div>

      {/* Grid Responsivo (Carrossel no Mobile, 5 colunas no Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {commodities.map((item) => {
          const isSelected = selectedCommodityId === item.id;
          const isPositive = item.changePercent >= 0;

          return (
            <div
              key={item.id}
              onClick={() => onSelectCommodity && onSelectCommodity(item.id)}
              className={`rounded-2xl border bg-white p-4 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    {ICONS_MAP[item.id] || <ShoppingBag className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {item.source}
                    </span>
                  </div>
                </div>

                {/* Variação Badge */}
                <div
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold tabular-nums ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Preço Atual */}
              <div className="mt-1 mb-2">
                <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900">
                  R$ {item.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {item.unit}
                </div>
              </div>

              {/* Sparkline & Fechamento */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">7 dias:</span>
                <div>{renderSparklineSVG(item.sparkline, isPositive)}</div>
              </div>

              {/* Tag Semântica para Compras */}
              <div className="mt-2.5">
                <span
                  className={`block text-[11px] font-semibold px-2 py-1 rounded-md text-center truncate ${
                    item.alertType === 'alta'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : item.alertType === 'pressao'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : item.alertType === 'queda'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.semanticTag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

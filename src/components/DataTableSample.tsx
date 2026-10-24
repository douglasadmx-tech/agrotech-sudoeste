'use client';

import React, { useState, useMemo } from 'react';
import { PurchaseRecord } from '@/types';
import { Search, Filter, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface DataTableSampleProps {
  records: PurchaseRecord[];
}

export function DataTableSample({ records }: DataTableSampleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cultureFilter, setCultureFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Culturas únicas para o filtro
  const uniqueCultures = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.cultura) set.add(r.cultura);
    });
    return Array.from(set);
  }, [records]);

  // Filtragem
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        (r.municipio && r.municipio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.cultura && r.cultura.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.talhao_id && r.talhao_id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCulture =
        cultureFilter === 'ALL' ||
        (r.cultura && r.cultura.toLowerCase() === cultureFilter.toLowerCase());

      return matchesSearch && matchesCulture;
    });
  }, [records, searchTerm, cultureFilter]);

  // Paginação
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentRecords = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      {/* Header & Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Registros Consolidados & Higienizados
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cruzamento do ERP com a cotação regional • {records.length.toLocaleString('pt-BR')} registros na base ativa
          </p>
        </div>

        {/* Busca e Filtro */}
        <div className="flex items-center gap-2">
          {/* Input de Busca */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar município, cultura..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-48 sm:w-56"
            />
          </div>

          {/* Filtro de Cultura */}
          <div className="relative">
            <select
              value={cultureFilter}
              onChange={(e) => {
                setCultureFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
            >
              <option value="ALL">Todas as Culturas</option>
              {uniqueCultures.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200/60">
            <tr>
              <th className="py-2.5 px-3">ID / Talhão</th>
              <th className="py-2.5 px-3">Município</th>
              <th className="py-2.5 px-3">Cultura / SKU</th>
              <th className="py-2.5 px-3 text-right">Custo Unitário</th>
              <th className="py-2.5 px-3 text-right">Cotação Mercado</th>
              <th className="py-2.5 px-3 text-center">Tendência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              currentRecords.map((r, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                    {r.talhao_id || `REG-${i + 1}`}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">{r.municipio || 'Sudoeste SP'}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">{r.cultura || 'Agrícola'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 font-bold">
                    {r.custo_unitario !== undefined
                      ? `R$ ${Number(r.custo_unitario).toFixed(2)}`
                      : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 font-bold">
                    {r.cotacao_mercado !== undefined
                      ? `R$ ${Number(r.cotacao_mercado).toFixed(2)}`
                      : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.tendencia?.toLowerCase().includes('alta')
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.tendencia?.toLowerCase().includes('queda')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.tendencia || 'Estável'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
        <span>
          Mostrando{' '}
          <strong className="text-slate-700 font-semibold">
            {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          a{' '}
          <strong className="text-slate-700 font-semibold">
            {Math.min(currentPage * pageSize, filtered.length)}
          </strong>{' '}
          de <strong className="text-slate-700 font-semibold">{filtered.length}</strong> registros
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold px-2 tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

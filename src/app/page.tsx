'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CommodityTicker } from '@/components/CommodityTicker';
import { FileIngestionCenter } from '@/components/FileIngestionCenter';
import { BuyerCopilot } from '@/components/BuyerCopilot';
import { DataTableSample } from '@/components/DataTableSample';
import { INITIAL_COMMODITIES } from '@/data/mockCommodities';
import { CommodityQuote, PurchaseRecord, IngestedFileMeta, QuarantineRecord } from '@/types';

export default function DashboardPage() {
  const [commodities, setCommodities] = useState<CommodityQuote[]>(INITIAL_COMMODITIES);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('soja');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [filesMeta, setFilesMeta] = useState<IngestedFileMeta[]>([]);
  const [quarantineLogs, setQuarantineLogs] = useState<QuarantineRecord[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<string>('Cloud Sync: Conectado (Firebase)');

  // Callback de dados ingeridos
  const handleDataIngested = (
    newPurchases: PurchaseRecord[],
    newFilesMeta: IngestedFileMeta[],
    newQuarantine: QuarantineRecord[]
  ) => {
    setPurchases(newPurchases);
    setFilesMeta(newFilesMeta);
    setQuarantineLogs(newQuarantine);
  };

  // Sincronização Cloud (Firebase)
  const handleCloudSync = async () => {
    setCloudStatus('Cloud Sync: Sincronizando...');
    try {
      const res = await fetch('/api/cloud-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileMeta: filesMeta,
          summary: {
            totalLines: purchases.length,
            quarantineCount: quarantineLogs.length,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCloudStatus('Cloud Sync: Ativo (Firestore Sincronizado)');
      } else {
        setCloudStatus('Cloud Sync: Buffer Local Seguro');
      }
    } catch {
      setCloudStatus('Cloud Sync: Buffer Local Seguro');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Header Fixo com Status */}
      <Header
        totalRecords={purchases.length}
        cloudStatus={cloudStatus}
        isStreaming={isStreaming}
      />

      {/* Conteúdo Principal do Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* 2. Ticker de Commodities B3 / CEPEA */}
        <CommodityTicker
          commodities={commodities}
          selectedCommodityId={selectedCommodityId}
          onSelectCommodity={(id) => setSelectedCommodityId(id)}
        />

        {/* 3. Grid Adaptativo (7 colunas Ingestão/Dados + 5 colunas IA Buyer Copilot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Central de Ingestão Massiva & Tabela de Registros */}
          <div className="lg:col-span-7 space-y-6">
            <FileIngestionCenter
              onDataIngested={handleDataIngested}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
            />

            {/* Tabela de Amostras de Registros */}
            {purchases.length > 0 && (
              <DataTableSample records={purchases} />
            )}
          </div>

          {/* Coluna Direita: Buyer Copilot Agent (Gemini 3.8 Flash) */}
          <div className="lg:col-span-5 sticky top-20">
            <BuyerCopilot
              commodities={commodities}
              purchases={purchases}
              filesMeta={filesMeta}
              onCloudSyncRequested={handleCloudSync}
            />
          </div>
        </div>
      </main>

      {/* Rodapé Corporativo Padrão SENAI & Google Antigravity */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>AgroTech Sudoeste</strong> • Arquitetura de 3 Camadas & Spec-Driven Development (SDD)
          </span>
          <span className="text-slate-400">
            Powered by <strong>Google Antigravity</strong> • Gemini 3.8 Flash • Firebase Firestore
          </span>
        </div>
      </footer>
    </div>
  );
}

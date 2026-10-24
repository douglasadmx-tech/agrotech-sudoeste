'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { IngestedFileMeta, QuarantineRecord, PurchaseRecord } from '@/types';
import { annealRow } from '@/lib/selfAnnealing';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Zap,
  PlayCircle,
  FileCheck,
} from 'lucide-react';

interface FileIngestionCenterProps {
  onDataIngested: (records: PurchaseRecord[], filesMeta: IngestedFileMeta[], quarantine: QuarantineRecord[]) => void;
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
}

export function FileIngestionCenter({
  onDataIngested,
  isStreaming,
  setIsStreaming,
}: FileIngestionCenterProps) {
  const [files, setFiles] = useState<IngestedFileMeta[]>([]);
  const [quarantineLogs, setQuarantineLogs] = useState<QuarantineRecord[]>([]);
  const [totalLines, setTotalLines] = useState<number>(0);
  const [validLines, setValidLines] = useState<number>(0);
  const [repairedLines, setRepairedLines] = useState<number>(0);
  const [quarantinedLines, setQuarantinedLines] = useState<number>(0);
  const [streamingSpeed, setStreamingSpeed] = useState<number>(0);
  const [allPurchases, setAllPurchases] = useState<PurchaseRecord[]>([]);
  const [showQuarantineModal, setShowQuarantineModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Percentual Efetivo Global
  const effectivePercent =
    totalLines > 0 ? ((validLines + repairedLines) / totalLines) * 100 : 0;

  // Processa arquivo CSV com streaming e PapaParse
  const processCSVFile = async (file: File) => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();

    const newFileMeta: IngestedFileMeta = {
      id: fileId,
      name: file.name,
      sizeBytes: file.size,
      totalRows: 0,
      validRows: 0,
      repairedRows: 0,
      quarantinedRows: 0,
      effectivePercent: 0,
      status: 'reading',
      speedRowsPerSec: 0,
      uploadedAt: new Date().toLocaleTimeString('pt-BR'),
    };

    setFiles((prev) => [...prev, newFileMeta]);
    setIsStreaming(true);

    const localPurchases: PurchaseRecord[] = [];
    const localQuarantine: QuarantineRecord[] = [];

    let fileRowCount = 0;
    let fileValidCount = 0;
    let fileRepairedCount = 0;
    let fileQuarantineCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: false,
      chunkSize: 1024 * 50, // 50KB chunks para velocidade
      chunk: (results) => {
        const rows = results.data as Record<string, any>[];

        for (const rawRow of rows) {
          fileRowCount++;
          const result = annealRow(rawRow, fileRowCount, fileId, file.name);

          if (result.status === 'valid' && result.cleanedRow) {
            fileValidCount++;
            localPurchases.push(result.cleanedRow);
          } else if (result.status === 'repaired' && result.cleanedRow) {
            fileRepairedCount++;
            localPurchases.push(result.cleanedRow);
            if (result.quarantineRecord) {
              localQuarantine.push(result.quarantineRecord);
            }
          } else {
            fileQuarantineCount++;
            if (result.quarantineRecord) {
              localQuarantine.push(result.quarantineRecord);
            }
          }
        }

        // Atualização de telemetria
        const elapsedSec = (performance.now() - startTime) / 1000 || 0.1;
        const currentSpeed = Math.round(fileRowCount / elapsedSec);
        setStreamingSpeed(currentSpeed);

        setTotalLines((prev) => prev + rows.length);
        setValidLines((prev) => prev + (fileValidCount - (newFileMeta.validRows || 0)));
        setRepairedLines((prev) => prev + (fileRepairedCount - (newFileMeta.repairedRows || 0)));
        setQuarantinedLines((prev) => prev + (fileQuarantineCount - (newFileMeta.quarantinedRows || 0)));

        newFileMeta.totalRows = fileRowCount;
        newFileMeta.validRows = fileValidCount;
        newFileMeta.repairedRows = fileRepairedCount;
        newFileMeta.quarantinedRows = fileQuarantineCount;
        newFileMeta.effectivePercent =
          fileRowCount > 0
            ? ((fileValidCount + fileRepairedCount) / fileRowCount) * 100
            : 0;
        newFileMeta.speedRowsPerSec = currentSpeed;
      },
      complete: () => {
        newFileMeta.status = 'completed';
        setIsStreaming(false);

        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...newFileMeta } : f))
        );

        setQuarantineLogs((prev) => [...prev, ...localQuarantine]);
        const updatedPurchases = [...allPurchases, ...localPurchases];
        setAllPurchases(updatedPurchases);

        // Notificar Dashboard
        onDataIngested(
          updatedPurchases,
          [...files, newFileMeta],
          [...quarantineLogs, ...localQuarantine]
        );
      },
      error: (err) => {
        console.error('Erro no parser CSV:', err);
        newFileMeta.status = 'error';
        setIsStreaming(false);
      },
    });
  };

  // Processa arquivo Excel (.xlsx)
  const processExcelFile = async (file: File) => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();

    setIsStreaming(true);
    const newFileMeta: IngestedFileMeta = {
      id: fileId,
      name: file.name,
      sizeBytes: file.size,
      totalRows: 0,
      validRows: 0,
      repairedRows: 0,
      quarantinedRows: 0,
      effectivePercent: 0,
      status: 'reading',
      speedRowsPerSec: 0,
      uploadedAt: new Date().toLocaleTimeString('pt-BR'),
    };

    setFiles((prev) => [...prev, newFileMeta]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      const localPurchases: PurchaseRecord[] = [];
      const localQuarantine: QuarantineRecord[] = [];

      let fileRowCount = 0;
      let fileValidCount = 0;
      let fileRepairedCount = 0;
      let fileQuarantineCount = 0;

      for (const rawRow of rows) {
        fileRowCount++;
        const result = annealRow(rawRow, fileRowCount, fileId, file.name);

        if (result.status === 'valid' && result.cleanedRow) {
          fileValidCount++;
          localPurchases.push(result.cleanedRow);
        } else if (result.status === 'repaired' && result.cleanedRow) {
          fileRepairedCount++;
          localPurchases.push(result.cleanedRow);
          if (result.quarantineRecord) {
            localQuarantine.push(result.quarantineRecord);
          }
        } else {
          fileQuarantineCount++;
          if (result.quarantineRecord) {
            localQuarantine.push(result.quarantineRecord);
          }
        }
      }

      const elapsedSec = (performance.now() - startTime) / 1000 || 0.1;
      const speed = Math.round(fileRowCount / elapsedSec);

      newFileMeta.totalRows = fileRowCount;
      newFileMeta.validRows = fileValidCount;
      newFileMeta.repairedRows = fileRepairedCount;
      newFileMeta.quarantinedRows = fileQuarantineCount;
      newFileMeta.effectivePercent =
        fileRowCount > 0
          ? ((fileValidCount + fileRepairedCount) / fileRowCount) * 100
          : 0;
      newFileMeta.speedRowsPerSec = speed;
      newFileMeta.status = 'completed';

      setTotalLines((prev) => prev + fileRowCount);
      setValidLines((prev) => prev + fileValidCount);
      setRepairedLines((prev) => prev + fileRepairedCount);
      setQuarantinedLines((prev) => prev + fileQuarantineCount);

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...newFileMeta } : f))
      );

      setQuarantineLogs((prev) => [...prev, ...localQuarantine]);
      const updatedPurchases = [...allPurchases, ...localPurchases];
      setAllPurchases(updatedPurchases);

      onDataIngested(
        updatedPurchases,
        [...files, newFileMeta],
        [...quarantineLogs, ...localQuarantine]
      );
    } catch (e) {
      console.error('Erro lendo XLSX:', e);
      newFileMeta.status = 'error';
    } finally {
      setIsStreaming(false);
    }
  };

  // Carregar dados de demonstração (data_agrotech_safras.csv)
  const handleLoadSampleData = async () => {
    try {
      setIsStreaming(true);
      const res = await fetch('/api/sample-data');
      if (!res.ok) {
        throw new Error('Falha ao obter dataset de exemplo');
      }
      const blob = await res.blob();
      const sampleFile = new File([blob], 'data_agrotech_safras_sudoeste.csv', {
        type: 'text/csv',
      });
      await processCSVFile(sampleFile);
    } catch (err) {
      console.error(err);
      alert('Não foi possível carregar a amostra direta. Utilize o botão de upload para selecionar o arquivo CSV.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        if (file.name.endsWith('.csv')) {
          processCSVFile(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          processExcelFile(file);
        } else {
          alert(`Formato de arquivo não suportado: ${file.name}`);
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        if (file.name.endsWith('.csv')) {
          processCSVFile(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          processExcelFile(file);
        }
      });
    }
  };

  const downloadQuarantineJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quarantineLogs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `quarantine_log_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      {/* Título & Header da Central */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Central de Ingestão & Telemetria Massiva
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming de planilhas ERP de compras com protocolo Self-Annealing e isolamento em <code className="font-mono text-slate-700">.tmp/</code>
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleData}
            disabled={isStreaming}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-200/60"
            title="Carrega o dataset regional de safras e compras do Sudoeste SP"
          >
            <PlayCircle className="w-4 h-4 text-emerald-600" />
            Carregar Base Sudoeste SP
          </button>

          {quarantineLogs.length > 0 && (
            <button
              onClick={() => setShowQuarantineModal(!showQuarantineModal)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition-colors border border-amber-200/60"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Ver Quarentena ({quarantineLogs.length})
            </button>
          )}
        </div>
      </div>

      {/* Big Numbers de Telemetria */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* Total Arquivos */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Arquivos na Fila
          </span>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
            {files.length}
          </div>
          <span className="text-[11px] text-slate-500">
            {files.filter((f) => f.status === 'completed').length} processados
          </span>
        </div>

        {/* Volume Total Registros */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Volume Mapeado
          </span>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
            {totalLines.toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-slate-500">linhas lidas</span>
        </div>

        {/* Velocidade de Streaming */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Velocidade Real
          </span>
          <div className="text-2xl font-extrabold text-sky-700 tabular-nums mt-0.5 flex items-center gap-1">
            <Zap className="w-5 h-5 text-sky-500" />
            {streamingSpeed > 0 ? streamingSpeed.toLocaleString('pt-BR') : '0'}
          </div>
          <span className="text-[11px] text-slate-500">reg / segundo</span>
        </div>

        {/* % Carregamento Efetivo */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Carregamento Efetivo
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-0.5">
            {effectivePercent.toFixed(2)}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {(validLines + repairedLines).toLocaleString('pt-BR')} persistidos
          </span>
        </div>
      </div>

      {/* Barra Dupla de Carregamento Efetivo */}
      <div className="my-4">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
          <span className="text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Registros Validados ({validLines.toLocaleString('pt-BR')})
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ml-2" />
            Reparados Self-Annealing ({repairedLines.toLocaleString('pt-BR')})
            {quarantinedLines > 0 && (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ml-2" />
                Quarentena ({quarantinedLines.toLocaleString('pt-BR')})
              </>
            )}
          </span>
          <span className="tabular-nums text-slate-900 font-bold">
            {totalLines > 0
              ? `${effectivePercent.toFixed(2)}% Efetivo`
              : 'Aguardando carga...'}
          </span>
        </div>

        {/* Progresso Visual Multi-Segmento */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {totalLines > 0 ? (
            <>
              <div
                style={{ width: `${(validLines / totalLines) * 100}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Válidos: ${validLines}`}
              />
              <div
                style={{ width: `${(repairedLines / totalLines) * 100}%` }}
                className="bg-amber-400 transition-all duration-300"
                title={`Reparados: ${repairedLines}`}
              />
              <div
                style={{ width: `${(quarantinedLines / totalLines) * 100}%` }}
                className="bg-rose-400 transition-all duration-300"
                title={`Quarentena: ${quarantinedLines}`}
              />
            </>
          ) : (
            <div className="w-full h-full bg-slate-200/60" />
          )}
        </div>
      </div>

      {/* Dropzone Inteligente de Arquivos */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        <div className="mx-auto w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-all">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-slate-800">
          Arraste e solte planilhas de compras do ERP aqui
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Suporte nativo a múltiplos arquivos <code className="text-slate-700 font-semibold">.CSV</code> e <code className="text-slate-700 font-semibold">.XLSX</code>. Streaming em memória com proteção contra congelamento de interface.
        </p>
      </div>

      {/* Lista de Arquivos Processados */}
      {files.length > 0 && (
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Arquivos na Central ({files.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-800 truncate block">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {file.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {file.totalRows.toLocaleString('pt-BR')} reg
                    </span>
                    <span className="block text-[11px] text-emerald-600 font-semibold tabular-nums">
                      {file.effectivePercent.toFixed(1)}% Efetivo
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      file.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : file.status === 'reading'
                        ? 'bg-sky-100 text-sky-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {file.status === 'completed' ? 'Concluído' : file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal / Gaveta de Quarentena */}
      {showQuarantineModal && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-amber-900">
                Log de Self-Annealing & Quarentena (.tmp/quarantine)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadQuarantineJSON}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100/50"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar JSON
              </button>
              <button
                onClick={() => setShowQuarantineModal(false)}
                className="text-xs text-amber-800 hover:underline ml-2"
              >
                Fechar
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
            {quarantineLogs.slice(0, 15).map((log, index) => (
              <div
                key={index}
                className="p-2.5 rounded-lg bg-white border border-amber-200/70 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Linha #{log.rowNumber} • {log.fileName}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.actionTaken === 'repaired'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {log.actionTaken === 'repaired' ? 'Corrigido Autônomo' : 'Isolado'}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 font-mono text-[11px]">
                  Erro: {log.detectedError}
                </p>
                {log.repairedValue && (
                  <p className="text-emerald-700 text-[11px] font-medium mt-0.5">
                    Ação: {log.repairedValue}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

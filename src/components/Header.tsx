'use client';

import React from 'react';
import { CloudCheck, ShieldAlert, Cpu, Sparkles, Database } from 'lucide-react';

interface HeaderProps {
  totalRecords: number;
  cloudStatus: string;
  isStreaming: boolean;
}

export function Header({ totalRecords, cloudStatus, isStreaming }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo & Título */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20">
            <span className="font-bold text-lg tracking-tight">AS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                AgroTech <span className="text-emerald-600 font-extrabold">Sudoeste</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                v2.0 • Sudoeste SP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Inteligência de Compras de Supermercados & Atacarejos • B3 & CEPEA
            </p>
          </div>
        </div>

        {/* Status Telemetria & Badges de Governança */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Buffer .tmp/ */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 text-slate-700 border border-slate-200/60">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">Buffer <code className="text-slate-800 font-mono text-[11px]">.tmp/</code>: Ativo</span>
          </div>

          {/* Cloud Sync Status */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/70">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="font-semibold">{cloudStatus}</span>
          </div>

          {/* Motor IA Gemini */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">Gemini 3.8 Flash</span>
          </div>

          {/* Atividade de Streaming */}
          {isStreaming && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold">Streaming Ativo</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

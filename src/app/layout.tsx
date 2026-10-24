import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgroTech Sudoeste | Inteligência de Compras & Commodities B3 / CEPEA',
  description:
    'Painel em tempo real de cotações B3/CEPEA e ingestão massiva de planilhas ERP com motor de Self-Annealing e Buyer Copilot com Gemini 3.8 Flash.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

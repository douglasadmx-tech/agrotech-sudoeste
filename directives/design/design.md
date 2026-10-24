# Guia de UI/UX e Design System: AgroTech Sudoeste
**Filosofia Visual:** Clean, Light, Modern, High-Precision Financial & Agritech  
**Abordagem de Desenvolvimento:** Mobile-First, Responsivo, Acessível (WCAG AA) e Orientado a Dados Massivos  
**Stack de Estilização:** Tailwind CSS + Shadcn/UI + Lucide Icons + Recharts / Tremor

---

## 1. Diretrizes Estéticas e Conceito Visual ("Clean & Light")

O **AgroTech Sudoeste** é uma ferramenta de trabalho diário para compradores e gestores de supermercados que tomam decisões financeiras críticas. A interface deve transmitir **clareza absoluta, leveza visual (zero fadiga ocular), velocidade e confiabilidade**.

* **Tema Exclusivo (Light Mode Premium):** Fundo claro com camadas sutis de profundidade, evitando contrastes agressivos (preto puro) e priorizando tons de ardósia (*Slate*) e verde agronegócio sofisticado (*Emerald/Teal*).
* **Interface Única (Single-Workspace Dashboard):** Zero recarregamento de página. Toda a operação — desde acompanhar o Boi Gordo na B3 até importar $4\text{ milhões}$ de linhas de planilhas do ERP e ler recomendações dos agentes — ocorre em uma única visão modular e fluida.

---

## 2. Paleta de Cores e Tokens (Tailwind CSS)

| Função | Cor / Token Tailwind | Hexadecimal | Aplicação na Interface |
| :--- | :--- | :--- | :--- |
| **Background Primário** | `bg-slate-50` | `#F8FAFC` | Fundo geral da aplicação (sensação arejada e limpa). |
| **Superfície (Cards)** | `bg-white` | `#FFFFFF` | Cards de cotações, painel de upload e tabelas (`border-slate-200/80`). |
| **Texto Principal** | `text-slate-900` | `#0F172A` | Títulos, valores de cotações e contadores de registros. |
| **Texto Secundário** | `text-slate-500` | `#64748B` | Rótulos, timestamps, legendas e metadados de arquivos. |
| **Brand Primária (Agro)** | `emerald-600` | `#059669` | Botões principais, barra de carregamento efetivo, destaques ativos. |
| **Acento Secundário (Tech)**| `sky-600` | `#0284C7` | Indicadores de agentes de IA, sincronização em nuvem e links. |
| **Status: Alta / Sucesso** | `emerald-500` (`bg-emerald-50`)| `#10B981` | Variação favorável de compra, upload $100\%$ concluído. |
| **Status: Alerta / Self-Annealing**| `amber-500` (`bg-amber-50`) | `#F59E0B` | Reprocessamento automático de linhas em quarentena (`.tmp/`). |
| **Status: Pressão de Custo** | `rose-500` (`bg-rose-50`) | `#F43F5E` | Disparada de preço da commodity (alerta de alta de custo para o mercado). |

---

## 3. Tipografia e Hierarquia de Dados

Em sistemas que exibem milhões de registros e variações de centavos em commodities, o alinhamento numérico é obrigatório:

* **Fonte Principal (UI e Texto):** `Inter` ou `Plus Jakarta Sans` (Sans-serif geométrica, limpa e altamente legível em telas pequenas).
* **Fonte de Dados e Telemetria:** `JetBrains Mono` ou aplicação obrigatória da classe `tabular-nums` (`font-variant-numeric: tabular-nums`) em **todos** os preços, porcentagens e contadores de linhas. Isso impede que a interface "trema" enquanto o contador sobe de $0$ para $4.000.000$ de registros em tempo real.

---

## 4. Arquitetura de Layout (Mobile-First & Responsivo)

O layout utiliza **CSS Grid (Bento Grid Adaptativo)** pensado primeiro para o celular do comprador (que pode estar no caminhão, centro de distribuição ou em reunião) e expandido para monitores ultrawide no escritório.

### 4.1. Breakpoints e Comportamento
* **Mobile (`< 768px`):**
  * Header compacto com status de conexão em nuvem.
  * Carrossel horizontal suave (*snap-scroll*) para os 5 Cards de Commodities (Soja, Milho, Boi, Café, Leite).
  * Pilha vertical única para o Módulo de Ingestão de Planilhas e o Assistente de Decisão de Compras.
* **Tablet (`768px - 1024px`):**
  * Grid de 2 colunas para cotações e painel de upload lado a lado com o resumo de IA.
* **Desktop (`> 1024px`):**
  * Grid de 12 colunas sem rolagem desnecessária:
    * **Topo:** Barra superior com os 5 cards de cotações B3/CEPEA lado a lado (`grid-cols-5`).
    * **Esquerda (7 colunas):** Central de Ingestão Massiva ($+4\text{M}$ registros) + Tabela Virtualizada de Cruzamento (Custo ERP vs. Commodity).
    * **Direita (5 colunas):** Painel do Agente de Compras (Recomendações acionáveis, gráficos de tendência e log de *Self-Annealing*).

---

## 5. Especificação Detalhada dos Componentes Críticos

### 5.1. Cards de Cotações Ao Vivo (Soja, Milho, Boi, Café, Leite)
Cada card deve ser minimalista (`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-md transition-all`):
* **Cabeçalho do Card:** Ícone sutil da commodity + Nome (ex: **Boi Gordo**) + Tag da Fonte (`B3 / CEPEA`).
* **Corpo:** Preço atual em destaque (`text-2xl font-bold tabular-nums text-slate-900`, ex: `R$ 318,50/@`).
* **Rodapé & Contexto para Compras:**
  * Badge de variação diária (`+1,45%` ou `-0,80%`).
  * Micro-gráfico *Sparkline* de 7 dias em SVG leve.
  * **Tag Semântica de Compras:** Uma pílula direta traduzindo o impacto para o supermercado (ex: `[Pressão no Açougue: Alta]` ou `[Janela de Compra: Óleo de Soja]`).

### 5.2. Central de Ingestão e Telemetria de Arquivos ($+4$ Milhões de Registros)
Este é o coração técnico da interface única. O usuário precisa ter visibilidade total e imediata sobre os arquivos importados e a saúde da carga:
* **Dropzone Inteligente:** Área tracejada limpa para arrastar múltiplos arquivos `.csv`, `.xlsx` ou `.parquet`.
* **Painel de Resumo Global da Carga (Big Numbers):**
  * **Total de Arquivos Importados:** Contador claro (ex: `6 arquivos processados`).
  * **Volume Total Mapeado:** Destaque visual para a escala massiva (ex: `4.382.910 registros`) com formatação de milhar em `tabular-nums`.
  * **Velocidade de Streaming:** Indicador técnico sutil (ex: `185.000 reg/s • Buffer .tmp/ ativo`).
* **Lista de Arquivos e Progresso Individual + Global:**
  * Cada arquivo importado aparece em uma linha compacta contendo:
    1. Nome do arquivo (`historico_compras_2025_2026.csv`).
    2. Quantidade exata de registros do arquivo (`1.850.400 registros`).
    3. Status do pipeline (`Lendo em .tmp/` $\rightarrow$ `Self-Annealing` $\rightarrow$ `Sincronizado na Nuvem`).
* **Barra Dupla de Carregamento e `% de Carregamento Efetivo`:**
  * Deve exibir com destaque o percentual com duas casas decimais (ex: **`99,84% de Carregamento Efetivo`**).
  * **Visualização da Barra:**
    * **Verde Esmeralda (`bg-emerald-500`):** Registros limpos, validados e prontos para análise.
    * **Âmbar (`bg-amber-400`):** Registros corrigidos automaticamente pelo motor de *Self-Annealing* (ex: formatação de moeda ajustada).
    * **Cinza/Rosa Sutil (`bg-rose-300`):** Registros descartados/isolados em quarentena por inconsistência grave (com botão rápido para baixar o log de rejeições).

### 5.3. Painel de Decisão do Setor de Compras (Agentes de IA)
* **Cards de Recomendação Acionável:** Em vez de um chat genérico, os agentes apresentam *Insights Estruturados*:
  * *Exemplo:* **"Alerta de Compra — Milho &Derivados / Aves"**: *"O indicador CEPEA subiu $3,2\%$ acumulados na semana. Cruzando com os $4,3\text{M}$ de registros importados, seu estoque regulador de itens correlatos no CD Sudoeste cobre apenas 8 dias ao custo antigo. Recomendação: Antecipar pedido com fornecedores antes do repasse de tabela."*
* **Tabela de Dados com Virtualização (Zero Lag):**
  * Para visualizar amostras ou filtrar os $+4\text{ milhões}$ de registros na mesma tela, **jamais renderizar milhares de nós no DOM**. Utilizar paginação via cursor no servidor combinada com *Virtual Scrolling* (`@tanstack/react-virtual`), mantendo a rolagem a $60\text{ FPS}$ mesmo em dispositivos móveis.

---

## 6. Padrões de Clean Code para o Front-end (Regras para o Agente)

1. **Componentização Atômica e Desacoplada:** Separe os componentes de apresentação (`CommodityCard.tsx`, `FileTelemetryRow.tsx`, `EffectiveProgressBar.tsx`) dos hooks de conexão de dados (`useCommodityStream.ts`, `useMassiveIngestionSSE.ts`).
2. **Estados de Carregamento Elegantes (Skeletons):** Nunca exiba telas em branco ou *spinners* bloqueantes. Utilize `animate-pulse` com `bg-slate-200/70` respeitando a geometria exata dos cards enquanto os dados da B3/CEPEA são carregados.
3. **Feedback de Nuvem vs. Local:** Inclua um indicador visual discreto no canto superior direito mostrando o ciclo de vida da regra 2 do SOP: `Buffer .tmp/ Limpo` e `Cloud Sync: Ativo`.
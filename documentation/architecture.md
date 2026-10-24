# Arquitetura do Sistema - AgroTech Sudoeste

> **Documento Arquitetural Técnico**  
> **Metodologia:** Spec-Driven Development (SDD) & Arquitetura de Agentes em 3 Camadas  
> **Ferramental:** Google Antigravity & Gemini 3.8 Flash  

---

## 1. Visão Geral da Arquitetura em 3 Camadas

O **AgroTech Sudoeste** foi construído sob um rigoroso padrão de separação entre estratégia probabilística e execução determinística:

```
+-------------------------------------------------------------------+
|               CAMADA 1: DIRETIVAS (ESTRATÉGIA)                    |
| - /directives/projeto.md (Regras de Domínio e Compras)            |
| - /directives/design/design.md (UI/UX Spec Clean & Light)          |
| - /directives/ideia-projeto.md (Gatilhos B3/CEPEA vs ERP)         |
+-------------------------------------------------------------------+
                                 │
                                 ▼
+-------------------------------------------------------------------+
|            CAMADA 2: ORQUESTRAÇÃO & DECISÃO (IA)                  |
| - Buyer Copilot Agent (Google Gemini 3.8 Flash)                   |
| - Agente de Governança e Roteamento de Schemas                    |
| - Diagnóstico de Inconsistências de Planilhas                     |
+-------------------------------------------------------------------+
                                 │
                                 ▼
+-------------------------------------------------------------------+
|            CAMADA 3: EXECUÇÃO (CÓDIGO DETERMINÍSTICO)             |
| - Next.js (App Router) + React 19 + TypeScript                    |
| - Tailwind CSS + Lucide Icons + Fontes Inter & JetBrains Mono     |
| - PapaParse Chunk Streaming (Streaming de Milhões de Linhas)     |
| - Motor de Self-Annealing com Quarentena e Reparo Autônomo        |
| - Conectores Firebase Firestore e Google GenAI                    |
+-------------------------------------------------------------------+
```

---

## 2. Protocolo de Self-Annealing (Auto-Cura em 4 Etapas)

1. **Detecção e Isolamento (Catch & Log):**
   - Registros com caracteres monetários (`R$`), inversão de vírgula e ponto decimal, ou colunas com sinônimos são identificados sem interromper o fluxo de ingestão.
   - Linhas irrecuperáveis são direcionadas para o buffer de quarentena.
2. **Diagnóstico Autônomo:**
   - O motor mapeia colunas como `vlr_unit_compra`, `custo_producao_ha_r$` para o campo padrão `custo_unitario`.
3. **Adaptação & Reparo (Heal):**
   - Strings monetárias são convertidas para ponto flutuante via `sanitizeNumeric`.
   - O percentual de carregamento efetivo é calculado em tempo real:
     $$\text{Carregamento Efetivo (\%)} = \left(\frac{\text{Válidos} + \text{Reparados}}{\text{Total de Linhas Mapeadas}}\right) \times 100$$
4. **Aprendizado Persistente:**
   - O mapa de sinônimos é preservado na camada de execução (`src/lib/selfAnnealing.ts`).

---

## 3. Integração de Nuvem (Cloud Sync & Firebase)

- Metadados de lotes de importação e resumos estatísticos são persistidos no **Firebase Firestore** na coleção `consolidated_batches`.
- O buffer de quarentena fica isolado e pode ser exportado em formato JSON para auditoria do setor de TI e compras.

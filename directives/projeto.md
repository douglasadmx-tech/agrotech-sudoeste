# SOP & Especificação Técnica: AgroTech Sudoeste
**Metodologia:** Spec-Driven Development (SDD) & Arquitetura de Agentes em 3 Camadas  
**Motor de IA Alvo:** Antigravity + Gemini 3.8 Flash High  
**Domínio:** Inteligência de Compras para Supermercados e Atacarejos (Commodities B3/CEPEA + Big Data de Planilhas)

---

## 1. Visão Geral do Sistema (System Prompt de Inicialização)
> **Instrução para o Agente Antigravity:** Você atuará como o Engenheiro Full-Stack Principal na construção do sistema web **AgroTech Sudoeste**. Este documento é a sua Fonte Única da Verdade (Single Source of Truth). Antes de gerar qualquer código na Camada 3, valide as regras de negócio na Camada 1 e estruture os fluxos na Camada 2. Todo o código deve seguir princípios estritos de *Clean Code*, *SOLID* e arquitetura *Mobile-First* (conforme detalhado em `design.md`).

O objetivo do **AgroTech Sudoeste** é fornecer ao setor de compras de uma rede de supermercados um painel em tempo real das cotações de commodities (Soja, Milho, Boi Gordo, Café Arábica/Conilon e Leite) via B3 e CEPEA/Esalq, cruzando esses indicadores com o histórico de compras, estoque e sell-out da empresa importado via planilhas massivas (Volume $> 4.000.000$ de registros).

---

## 2. Arquitetura de 3 Camadas (SOP - Standard Operating Procedure)

Para garantir que o LLM não sofra alucinações ao manipular milhões de linhas e mantenha a estabilidade do código, o projeto separa estritamente a **Intenção (Layer 1)**, a **Decisão (Layer 2)** e o **Código Determinístico (Layer 3)**.

### Camada 1: Diretivas (Lógica de Negócio e Regras de Domínio)
*Esta camada define "O QUE" deve ser feito e as regras de negócio do setor de compras. Nenhum código de infraestrutura reside aqui.*

1. **Monitoramento de CommoditiesAlvo:**
   - **Soja e Milho:** Impacto direto em óleos vegetais, rações e cadeia de proteínas (aves/suínos).
   - **Boi Gordo (`BGI` na B3 / Indicador CEPEA):** Impacto direto na compra de cortes bovinos para o açougue.
   - **Café:** Impacto direto na categoria de mercearia matinal (torrado e moído).
   - **Leite (CEPEA/Conselei):** Impacto em laticínios, UHT, queijos e manteiga.
2. **Heurística de Apoio à Decisão (Compras):**
   - **Sinal de Compra Antecipada (Estocagem):** Se a tendência de 7 dias na B3/CEPEA for de alta ($> +2,5\%$) e o custo médio da planilha interna ainda não refletiu o repasse do fornecedor.
   - **Sinal de Retenção (Compra Spot/Mínima):** Se a commodity apresentar queda nos contratos futuros ou pico histórico com expectativa de safra entrando no mercado.
3. **Regra de Governança de Dados:**
   - Todo processamento bruto de planilhas ou *scraping* temporário deve ocorrer exclusivamente no diretório local `.tmp/`.
   - Os dados consolidados, relatórios executivos e *datasets* limpos (Parquet/JSON otimizado) são entregáveis finais e devem ser sincronizados em **Nuvem** (Cloud Storage / Banco de Dados Cloud como Supabase/PostgreSQL ou AWS S3).

---

### Camada 2: Orquestração (Roteamento, Estado e Agentes de IA)
*Esta camada define "QUEM" coordena o fluxo e "QUANDO" acionar cada ferramenta determinística.*

1. **Agente Coletor de Mercado (Market Watcher Agent):**
   - **Gatilho:** Cronjob a cada 15 minutos (horário comercial B3) ou requisição manual via UI.
   - **Ação:** Aciona scripts determinísticos da Camada 3 para buscar dados da B3 e CEPEA, salva o payload bruto em `.tmp/raw_quotes/`, valida o schema e publica na Nuvem.
2. **Agente Orquestrador de Ingestão (Big Data Ingestion Manager):**
   - **Gatilho:** Upload de arquivos CSV/XLSX/Parquet na interface única pelo comprador.
   - **Ação:** Recebe a lista de arquivos, calcula o total estimado de linhas ($N > 4.000.000$), inicia um *Worker* assíncrono na Camada 3 e abre um canal **SSE (Server-Sent Events)** ou **WebSocket** com o Front-end para transmitir o estado exato: `Arquivo Atual`, `Registros Lidos`, `Registros Validados` e `% de Carregamento Efetivo`.
3. **Agente Analista de Compras (Buyer Copilot Agent):**
   - **Gatilho:** Conclusão da ingestão de dados ou consulta do usuário no painel.
   - **Ação:** Lê apenas as agregações estatísticas (nunca as 4 milhões de linhas brutas no prompt!) geradas pelo motor da Camada 3, cruza com as cotações do dia e gera recomendações táticas de negociação para os compradores do mercado.

---

### Camada 3: Execução (Código Determinístico e Stack Tecnológica)
*Esta camada contém scripts puros, rápidos, testáveis e determinísticos. O LLM escreve e mantém este código, mas a execução em produção é 100% algorítmica.*

* **Stack Tecnológica Recomendada:**
  * **Front-end:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query (gerenciamento de estado assíncrono) e TanStack Table / Virtual (para virtualização de listas massivas).
  * **Back-end & Motor de Dados (Alta Performance):** Python (FastAPI) utilizando **DuckDB** ou **Polars** para processamento *out-of-core* (em streaming) dos $+4$ milhões de registros sem estourar a memória RAM.
  * **Armazenamento:**
    * `.tmp/uploads/` e `.tmp/chunks/`: Buffer local de leitura em disco (ignorado no `.gitignore`).
    * **Cloud:** PostgreSQL (Supabase/Neon) para metadados e séries temporais + Cloud Object Storage (S3/R2) para arquivos Parquet processados.

* **Módulos Determinísticos (`src/execution/`):**
  1. `scraper_cepea_b3.py`: Script isolado com `httpx` / `BeautifulSoup` / APIs financeiras para extração exata de preços e variações diárias.
  2. `stream_processor.py`: Motor em Polars/DuckDB que lê múltiplos arquivos em *chunks* de $100.000$ linhas, calcula o progresso real:
     $$\text{Progresso Efetivo (\%)} = \left( \frac{\text{Registros Válidos Persistidos}}{\text{Total de Registros Brutos Mapeados}} \right) \times 100$$
  3. `cloud_sync.py`: Conector responsável por enviar os dados consolidados para a nuvem e limpar a pasta `.tmp/` após confirmação de *checksum*.

---

## 3. Protocolo de Self-Annealing (Auto-Cura e Resiliência)

Sistemas que dependem de dados externos (B3/CEPEA) e planilhas massivas de ERPs de supermercados estão sujeitos a falhas constantes de formato e rede. O sistema implementa o ciclo de **Self-Annealing** em 4 etapas:

1. **Detecção e Isolamento (Catch & Log):**
   - Se um lote de registros dentro dos 4 milhões apresentar corrupção (ex: CNPJ inválido, preço negativo, encoding `latin1` misturado com `utf-8`), o motor determinístico **não aborta a carga inteira**. Ele isola as linhas defeituosas em `.tmp/quarantine/erro_lote_X.json`.
2. **Diagnóstico Autônomo:**
   - O Agente Orquestrador analisa a amostra do erro (ex: mudança na nomenclatura de uma coluna do ERP do mercado ou alteração no seletor HTML do site do CEPEA).
3. **Adaptação e Correção (Heal):**
   - **Em Planilhas:** O motor aplica regras de fallback automáticas (conversão de tipos, remoção de caracteres especiais de moeda `R$`, inferência de datas) e reprocessa apenas os itens em quarentena, atualizando a `% de Carregamento Efetivo` na interface.
   - **Em Cotações:** Se a fonte primária (ex: endpoint B3) falhar com timeout ou HTTP 429/503, o sistema aciona *Exponential Backoff*, alterna automaticamente para a fonte secundária (Yahoo Finance / Investing / Cache Cloud do último fechamento) e sinaliza na UI com um badge discreto: *"Dados em Cache Resiliente"*.
4. **Aprendizado Persistente:**
   - O mapeamento corrigido de colunas (ex: `"VLR_UNIT_COMPRA"` $\rightarrow$ `unit_cost`) é salvo no arquivo de configuração de schemas para que futuras importações não sofram o mesmo atrito.

---

## 4. Plano de Implementação Orquestrado (Passo a Passo para o Antigravity)

Execute a construção do projeto seguindo rigorosamente estas fases sequenciais:

### Fase 1: Fundação e Infraestrutura de Diretórios
- [ ] Inicializar estrutura do repositório separando `/directives` (documentação de regras), `/orchestration` (agentes e rotas de estado) e `/execution` (serviços determinísticos e UI).
- [ ] Configurar `.gitignore` para bloquear `.tmp/` e variáveis de ambiente `.env`.
- [ ] Criar script de inicialização que garante a existência de `.tmp/uploads`, `.tmp/chunks` e `.tmp/quarantine`.

### Fase 2: Motor de Ingestão de Alta Escala ($+4$ Milhões de Registros)
- [ ] Implementar endpoint de upload multipart/streaming e leitor de metadados rápidos (contagem de linhas instantânea via buffer binário ou Polars lazy frame).
- [ ] Implementar o processador em *chunks* com emissão de eventos via Server-Sent Events (SSE) a cada $0,5\text{s}$, reportando: lista de arquivos na fila, quantidade de registros por arquivo, velocidade de leitura ($\text{linhas/seg}$) e `% de carregamento efetivo`.
- [ ] Implementar a rotina de limpeza automática de `.tmp/` após o envio do consolidado para o banco em Nuvem.

### Fase 3: Pipeline de Cotações B3 / CEPEA
- [ ] Construir conectores determinísticos para Soja, Milho, Boi Gordo, Café e Leite.
- [ ] Implementar camada de resiliência (*Self-Annealing*) com fallback e validação de dados numéricos.

### Fase 4: Interface Única Clean & Light (Front-end)
- [ ] Desenvolver a Single-Page Application seguindo fielmente o arquivo `design.md`.
- [ ] Construir o **Ticker / Painel de Commodities Ao Vivo** no topo.
- [ ] Construir a **Central de Ingestão e Telemetria de Arquivos** (exibindo os $+4\text{M}$ de registros, barra de progresso dupla: *Leitura Bruta* vs *Carregamento Efetivo*).
- [ ] Construir o **Painel de Inteligência de Compras** (cruzamento das cotações com o histórico importado + assistente de IA para recomendação de compra).

### Fase 5: Testes de Estresse e Validação
- [ ] Gerar script sintético em `.tmp/seed_4m.py` que cria 3 arquivos CSV totalizando $4.500.000$ registros de compras de supermercado (incluindo $2\%$ de linhas com erro proposital para testar o *Self-Annealing* e a métrica de carregamento efetivo).
- [ ] Validar responsividade Mobile-First em viewports de `375px` (Mobile) até `1920px` (Desktop).
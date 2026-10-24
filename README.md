# 🌱 AgroTech Sudoeste

[![Google Antigravity](https://img.shields.io/badge/Powered%20By-Google%20Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://antigravity.google)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React%2019-UI%20Library-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini 3.8 Flash](https://img.shields.io/badge/AI%20Engine-Gemini%203.8%20Flash-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev)
[![SENAI Ourinhos](https://img.shields.io/badge/SENAI-Ourinhos%20SP-ED1C24?style=for-the-badge)](https://sp.senai.br)

> **Plataforma de Inteligência de Compras de Supermercados & Atacarejos**  
> *Cruzamento em tempo real de Commodities B3/CEPEA com Big Data de ERPs ($+4\text{ Milhões}$ de registros), motor de Self-Annealing e recomendações estratégicas via Gemini 3.8 Flash.*

---

## 🇧🇷 Português (Brasil)

### 🎯 Sobre o Projeto
O **AgroTech Sudoeste** é uma solução corporativa desenvolvida para compradores e diretores de suprimentos de redes de supermercados no Sudoeste Paulista. Ele resolve a assimetria de preços entre os reajustes da indústria alimentícia e as cotações agrícolas reais da **B3** e **CEPEA/Esalq**, cruzando esses dados com o histórico de notas fiscais e entradas de compras da empresa através de uma interface web única, leve, rápida e moderna.

### 🌟 Principais Funcionalidades
1. **Painel de Cotações B3 & CEPEA ao Vivo:**
   - Monitoramento de 5 commodities estratégicas: **Soja Grão**, **Milho Safrinha**, **Boi Gordo (@)**, **Café Arábica** e **Leite (Média Brasil)**.
   - Micrográficos *Sparklines* de 7 dias e tags semânticas de ação de compra (*"Janela de Compra"*, *"Pressão no Açougue"*, *"Exigir Desconto"*).
2. **Central de Ingestão Massiva & Telemetria:**
   - Streaming em chunks de múltiplos arquivos `.csv` e `.xlsx`.
   - Big numbers de telemetria em tempo real com `tabular-nums` (Linhas lidas, Velocidade em reg/s e percentual efetivo).
3. **Protocolo de Self-Annealing (Auto-Cura):**
   - Normalização autônoma de moedas (`R$`), inversões numéricas e sinônimos de colunas.
   - Isolamento de inconsistências severas em quarentena (`.tmp/quarantine`) com download imediato de log para auditoria.
   - **% de Carregamento Efetivo:** Métrica transparente de integridade dos dados gravados.
4. **Buyer Copilot Agent (Google Gemini 3.8 Flash):**
   - Pareceres executivos táticos de compra, estocagem e renegociação com fornecedores gerados por IA avançada.
5. **Sincronização em Nuvem (Cloud Sync):**
   - Persistência e auditoria de lotes no **Firebase Firestore**.

### 🤖 Agentes e Skills do Google Antigravity
* **Agentes Utilizados:**
  * `@agente-orquestrador`: Coordenação da Camada 2 (Orquestração e Decisão).
  * `project-planner`: Planejamento e validação de requisitos Spec-Driven.
  * `frontend-specialist`: Arquitetura visual Clean & Light, Mobile-First.
* **Skill Packs Integrados:**
  * `@[skills/clean-code]`: Padrões estritos de código legível, testável e sem complexidade desnecessária.
  * `@[skills/app-builder]`: Engenharia de software fullstack moderna.
  * `@[skills/brainstorming]`: Alinhamento interativo `/grill-me`.

### 🚀 Como Executar Localmente
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Acessar no navegador
http://localhost:3000
```

---

## 🇺🇸 English

### 🎯 About the Project
**AgroTech Sudoeste** is an enterprise procurement intelligence system built for supermarket and wholesale buyers in the Southwest region of São Paulo, Brazil. It eliminates pricing asymmetry between food manufacturers and real agricultural market benchmarks (**B3** and **CEPEA/Esalq**), cross-referencing market indicators with massive ERP purchase history ($+4\text{M}$ records) in a single, ultra-fast, and responsive web workspace.

### 🌟 Key Features
1. **Live B3 & CEPEA Commodities Ticker:**
   - Real-time monitoring of Soybean, Corn, Live Cattle, Arabica Coffee, and Milk.
   - 7-day SVG sparkline graphs and semantic procurement badges.
2. **Massive Data Streaming & Ingestion Center:**
   - Client-side chunk streaming for `.csv` and `.xlsx` files without UI freezing.
   - Live telemetry counters formatted with `tabular-nums`.
3. **Self-Annealing Protocol (Autonomous Data Healing):**
   - Automatic currency cleaning, decimal normalization, and schema mapping.
   - Quarantine buffer with downloadable audit logs.
   - **Effective Ingestion Rate (%)**: Transparent metric of validated vs. corrupted records.
4. **Buyer Copilot Agent (Powered by Google Gemini 3.8 Flash):**
   - Strategic and actionable procurement recommendations for negotiation, forward-buying, and stock coverage.
5. **Cloud Sync & Persistence:**
   - Real-time batch synchronization with **Firebase Firestore**.

### 🛠️ Architecture: 3-Layer Design
- **Layer 1 (Directives):** Business domain rules in `/directives/projeto.md` and UI spec in `/directives/design/design.md`.
- **Layer 2 (Orchestration):** LLM decision routing with Gemini 3.8 Flash.
- **Layer 3 (Deterministic Execution):** Next.js App Router, React 19, Tailwind CSS, PapaParse, and Firebase Firestore.

---

*Desenvolvido com o ecossistema Google Antigravity & SENAI Ourinhos Edition.*

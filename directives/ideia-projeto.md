# Concepção do Projeto e Regras de Negócio: AgroTech Sudoeste
**Documento Base de Domínio:** `ideia_projeto.md`  
**Setor Alvo:** Diretoria de Suprimentos e Setor de Compras (Rede de Supermercados / Atacarejo)  
**Objetivo Central:** Transformar cotações agropecuárias ao vivo (B3/CEPEA) e históricos massivos de compras ($+4\text{ milhões}$ de registros) em inteligência acionável de negociação e formação de estoque.

---

## 1. O Problema de Negócio
No setor de compras de um supermercado de médio/grande porte, os compradores negociam diariamente milhares de SKUs (itens) diretamente impactados por commodities agrícolas. Atualmente, existem dois grandes gargalos:
1. **Assimetria de Informação com a Indústria:** Quando o comprador vai negociar óleo de soja, carnes, café ou leite UHT com a indústria, o fornecedor muitas vezes alega alta na matéria-prima para inflar o preço, ou omite uma queda recente na bolsa (B3/CEPEA) para reter margem.
2. **Volume Massivo de Dados Internos (Planilhas Pesadas):** O histórico de notas fiscais de entrada, movimentação de estoque e *sell-out* (giro de caixa) da rede ultrapassa facilmente **4 milhões de registros**. O Excel tradicional trava ao tentar abrir ou cruzar esses arquivos, impedindo que o comprador veja rapidamente seu custo médio histórico e sua cobertura de estoque no momento da cotação.

O **AgroTech Sudoeste** nasce para resolver ambos os problemas em uma **interface web única, leve, rápida e inteligente**.

---

## 2. Escopo das Commodities Monitoradas e Correlação com o Supermercado

O sistema monitora em tempo real 5 pilares de commodities e os vincula automaticamente às famílias de produtos das planilhas importadas:

| Commodity (Fonte B3 / CEPEA) | Unidade Padrão | Categorias do Supermercado Impactadas (SKUs) | Regra de Gatilho para o Comprador |
| :--- | :--- | :--- | :--- |
| **1. Soja** *(Indicador Esalq/Paranaguá & Contratos B3)* | $\text{R\$ / Saca } 60\text{kg}$ | Óleo de soja (PET $900\text{ml}$), margarinas, maioneses e base de ração (impacto indireto em aves/ovos). | Alta acumulada $> 3\%$ na semana sinaliza repasse iminente das refinarias em $7\text{ a }10\text{ dias}$. |
| **2. Milho** *(Indicador CEPEA/Campinas & Futuro `CCM` B3)* | $\text{R\$ / Saca } 60\text{kg}$ | Frango resfriado/congelado, cortes suínos, ovos brancos/vermelhos, fubá e derivados de milho. | Queda forte no milho reduz o custo de produção de granjas; comprador deve exigir desconto em aves e ovos. |
| **3. Boi Gordo** *(Indicador CEPEA & Futuro `BGI` B3)* | $\text{R\$ / Arroba (@)}$ | Açougue completo: traseiro, dianteiro, ponta de agulha, cortes maturados e carnes a vácuo. | Correlação imediata ($24\text{h a }48\text{h}$). Se o futuro na B3 despencar, segurar pedidos grandes com frigoríficos. |
| **4. Café** *(Arábica e Conilon CEPEA / `ICF` B3)* | $\text{R\$ / Saca } 60\text{kg}$ | Café torrado e moído ($500\text{g}$), café em grãos, solúveis e cápsulas (alto valor agregado no carrinho). | Alta volatilidade cambial e climática. Identificar janelas de compra antes de reajustes de tabelas das torrefadoras. |
| **5. Leite** *(CEPEA "Média Brasil" / Conselei)* | $\text{R\$ / Litro}$ | Leite UHT (Integral/Desnatado), creme de leite, leite condensado, queijos (mussarela/prato) e manteiga. | Produto gerador de tráfego no mercado. Cruzar período de safra/entressafra com o estoque atual das lojas. |

---

## 3. Funcionalidades Essenciais do Sistema

### 3.1. Leitura e Processamento de Planilhas Massivas ($+4$ Milhões de Registros)
O comprador ou analista de dados poderá importar múltiplos arquivos simultaneamente (ex: `compras_2024.csv`, `compras_2025.csv`, `entradas_nf_2026.csv`, `cadastro_skus.xlsx`).
* **Transparência de Importação:** A interface única deve listar claramente **quais arquivos foram importados** e a **quantidade exata de registros de cada arquivo**.
* **Métrica de Carregamento e % de Carregamento Efetivo:**
  * Como bases de ERP de supermercados frequentemente possuem linhas em branco, códigos EAN inválidos ou erros de digitação, o sistema não pode simplesmente mostrar "100% enviado".
  * Ele deve exibir o **Carregamento Bruto** (bytes/linhas lidas em `.tmp/`) e a **% de Carregamento Efetivo** (percentual de registros reais, higienizados pelo protocolo de *Self-Annealing* e gravados com sucesso na Nuvem prontos para análise).

### 3.2. Agentes Inteligentes para Tomada de Decisão
1. **Agente de Paridade e Custo (Parity Analyzer):**
   - Calcula se o preço que o fornecedor está cobrando na última planilha importada está coerente com a cotação da commodity na B3/CEPEA.
   - *Exemplo de Alerta:* *"O Leite no CEPEA caiu $-6,2\%$ no último mês, mas o seu custo médio do Leite UHT nas planilhas subiu $+1,5\%$. Há espaço para renegociação imediata de $\text{R\$ } 0,28/\text{litro}$."*
2. **Agente Recomendador de Estoque (Smart Stock Buyer):**
   - Avalia o giro dos $+4\text{ milhões}$ de registros e sugere:
     - **COMPRA FORTE (Estocagem Tática):** Commodity em início de ciclo de alta + Estoque interno baixo.
     - **COMPRA MÍNIMA (Manutenção de Gôndola):** Commodity em pico histórico ou início de queda na B3.
     - **RENEGOCIAÇÃO FORNECEDOR:** Queda consolidada na matéria-prima ainda não repassada nos pedidos do mercado.

---

## 4. Requisitos Não-Funcionais e Critérios de Aceite

1. **Performance sob Carga Extrema:** A importação de arquivos que somam mais de $4.000.000$ de linhas não deve congelar a thread principal da interface web; o feedback visual de progresso deve atualizar suavemente a cada meio segundo.
2. **Isolamento de Dados Temporários:** Nenhum arquivo pesado bruto deve poluir o repositório principal; tudo é processado na pasta `.tmp/` e os consolidados otimizados são salvos na nuvem.
3. **Resiliência (Self-Annealing):** Caso um arquivo de $1.500.000$ linhas tenha $500$ linhas corrompidas, o sistema deve corrigir automaticamente o que for possível (formatação de moeda, datas, encoding), colocar o restante em log de quarentena e concluir os $99,96\%$ de carregamento efetivo sem interromper o trabalho do comprador.
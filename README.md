# Meu Controle Financeiro 💰

Um web app responsivo, elegante e funcional projetado com **React + TypeScript + Tailwind CSS** para controle de finanças pessoais. Projetado no conceito de privacidade integral, o aplicativo opera 100% offline salvando todos os seus lançamentos diretamente no seu navegador através de persistência local em `localStorage`.

---

## 🎨 Identidade Visual Premium

O aplicativo foi desenvolvido utilizando um **Tema Escuro Moderno** inspirado nos melhores dashboards de tecnologia financeira:
*   **Fundo de Tela e Cards**: Tons luxuosos de azul escuro e violeta profundo, promovendo leitura confortável aos olhos.
*   **Hierarquia de Cores**:
    *   🟢 **Verde Esmeralda** para Entradas de capital e superávits históricos.
    *   🔴 **Vermelho Coral** para Saídas, juros e limites superados.
    *   🟡 **Dourado/Âmbar** para alertas inteligentes ou contas vencidas.
    *   🟣 **Violeta/Indigo** para demarcação de metas e investimentos em andamento.
*   **Responsividade Fluida**: Menu lateral ergonômico no desktop e barra de guias tátil na área inferior em smartphones.

---

## 🔥 Funcionalidades Integradas

### 1. Dashboard Inicial Inteligente
*   **Saldo Geral Acumulado**: Métrica viva baseada em todas as suas entradas históricas líquidos de saídas.
*   **Gráficos no Mês**: Leituras de total arrecadado, total de despesas, taxa de comprometimento e faturas acumuladas.
*   **Smart Alerts (Notificações)**: O aplicativo calcula padrões automaticamente para gerar lembretes vitais:
    *   *“Você gastou mais do que recebeu este mês.”*
    *   *“Sua renda está muito comprometida (acima de 75%).”*
    *   *“Você possui 3 dívidas vencidas.”*
    *   *“Sua meta Viagem está quase sendo alcançada!”*

### 2. Lançamento e Livro de Movimentações
*   Formulário para inclusão e edição de logs.
*   Filtros inteligentes combinados: por tipo, categoria de entradas/saídas, e selector de meses específicos.
*   Barra de busca em tempo real com leitura de descrições e notas opcionais.

### 3. Gerenciador de Dívidas e Amortizações
*   Diferencial interativo: registre faturas parceladas e veja o progresso de quitação em tempo real em barras coloridas.
*   Atalho de quitação rápida: mude o status para liquidada total com um só toque!

### 4. Metas de Economia Cofrinho
*   Crie alvos por prazos pré-determinados.
*   Caixa de depósito rápido: poupe e acrescente moedas no cofre diretamente do card, sem a necessidade de preencher formulários inteiros.

### 5. Relatórios Visuais e Comparativos
*   Gráfico de barras vertical interativo medindo entradas vs saídas.
*   Distribuição percentual categorizada.
*   Ranking dinâmico das 5 maiores despesas do mês selecionado.

### 6. Sistema Integrado de Backup
*   **Exportar Backup**: Transforma suas finanças em um arquivo estruturado `.json` para salvar no seu computador ou celular.
*   **Importar Backup**: Recarregue seus dados de um backup anterior em segundos.
*   **Destruição Segura**: Mecanismo de redefinição de fábrica com confirmação dupla para limpar todos os dados.

---

## 📁 Estrutura de Arquivos Organizada

```text
/
├── .env.example          # Exemplo de variáveis de ambiente
├── index.html            # Ponto de montagem principal
├── package.json          # Manifesto de pacotes e scripts do app
├── README.md             # Instruções de instalação e uso
├── setup.sh              # Arquivo de configuração inicial automatizado
├── src/
│   ├── main.tsx          # Ponto de inicialização do React
│   ├── index.css         # Configuração de temas e estilos de fontes globais
│   ├── types.ts          # Definições estritas de interfaces TypeScript e sementes
│   ├── App.tsx           # Orquestrador de fluxo de estados e modais de diálogo
│   ├── utils/
│   │   └── finance.ts    # Operações matemáticas financeiras e geradores de alertas
│   └── components/
│       ├── Navigation.tsx # Sidebar de navegação e guias mobiles
│       ├── Dashboard.tsx  # Visão geral de saldo e atalhos rápidos
│       ├── Transactions.tsx # Tabela inteligente e visualizadores de registros
│       ├── Debts.tsx      # Central de faturas e barras de amortizações
│       ├── Goals.tsx      # Cofre organizador de metas para poupança rápida
│       ├── Reports.tsx    # Estatísticas comparativas e logs dos maiores gastos
│       ├── SettingsPage.tsx # Perfil do investidor, backup e factory reseter
│       ├── Modal.tsx      # Diálogo popup adaptado com foco acessível
│       ├── TransactionForm.tsx # Formulário modular de transações
│       ├── DebtForm.tsx   # Formulário modular de débitos
│       └── GoalForm.tsx   # Formulário modular de metas
```

---

## 🚀 Como Executar e Hospedar Localmente

O projeto já vem pronto para funcionar imediatamente no navegador, sem a necessidade de configurar bancos de dados ou conexões externas!

### 📦 Instalação Padrão Manual
1.  Garanta que possui o **Node.js** (versão 18+) instalado.
2.  Instale os pacotes principais na raiz do projeto:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Abra o navegador em `http://localhost:3000`.

### ⚡ Instalação Automatizada (via Script)
Para facilitar ainda mais, você pode rodar o executável automatizado `setup.sh`:
```bash
chmod +x setup.sh
./setup.sh
```
*Este utilitário realizará a varredura das dependências obsoletas, fará o download seguro dos pacotes e iniciará automaticamente as portas de visualização local.*

---

## 💾 Segurança e Armazenamento Off-grid
Os seus dados não passam por servidores ou redes externas, garantindo que suas notas, dívidas e salários continuem **100% confidenciais e privados**. Recomenda-se realizar a exportação do arquivo JSON de backup semanalmente através da guia "Configurações" antes de limpar caches do celular ou computador.

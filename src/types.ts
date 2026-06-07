/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'entrada' | 'saída';

export type PaymentMethod = 'dinheiro' | 'Pix' | 'cartão de débito' | 'cartão de crédito' | 'boleto' | 'outro';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type DebtStatus = 'pendente' | 'parcial' | 'paga';

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: DebtStatus;
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
}

export interface Settings {
  userName: string;
  estimatedMonthlyIncome: number;
  defaultMonthlySavingsGoal: number;
  theme: 'dark' | 'light';
  currency: 'BRL';
}

export const INCOME_CATEGORIES = [
  'Salário',
  'Serviço extra',
  'Venda',
  'Presente',
  'Outro'
];

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Internet',
  'Moradia',
  'Lazer',
  'Saúde',
  'Projeto pessoal',
  'Assinaturas',
  'Cartão de crédito',
  'Outro'
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'dinheiro',
  'Pix',
  'cartão de débito',
  'cartão de crédito',
  'boleto',
  'outro'
];

export const DEFAULT_SETTINGS: Settings = {
  userName: 'Investidor Inteligente',
  estimatedMonthlyIncome: 4500,
  defaultMonthlySavingsGoal: 800,
  theme: 'dark',
  currency: 'BRL'
};

// Mock records to populate initial use state so the app works beautifully right from the start
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'entrada',
    description: 'Salário Mensal',
    amount: 4500,
    category: 'Salário',
    date: '2026-06-01',
    paymentMethod: 'Pix',
    notes: 'Salário fixo CLT'
  },
  {
    id: 't2',
    type: 'entrada',
    description: 'Frila de Site Institucional',
    amount: 1200,
    category: 'Serviço extra',
    date: '2026-06-03',
    paymentMethod: 'Pix',
    notes: 'Desenvolvimento Web'
  },
  {
    id: 't3',
    type: 'saída',
    description: 'Supermercado Mensal',
    amount: 680.50,
    category: 'Alimentação',
    date: '2026-06-02',
    paymentMethod: 'cartão de crédito',
    notes: 'Compras de mercearia e higiene'
  },
  {
    id: 't4',
    type: 'saída',
    description: 'Aluguel do Apartamento',
    amount: 1500,
    category: 'Moradia',
    date: '2026-06-05',
    paymentMethod: 'Pix',
    notes: 'Aluguel + condomínio inclusos'
  },
  {
    id: 't5',
    type: 'saída',
    description: 'Assinatura Streaming Netflix e Spotify',
    amount: 74.80,
    category: 'Assinaturas',
    date: '2026-06-04',
    paymentMethod: 'cartão de crédito',
    notes: 'Cobrança recorrente'
  },
  {
    id: 't6',
    type: 'saída',
    description: 'Combustível Posto Ipiranga',
    amount: 120,
    category: 'Transporte',
    date: '2026-06-06',
    paymentMethod: 'cartão de débito'
  },
  {
    id: 't7',
    type: 'saída',
    description: 'Consulta Odonto Preventiva',
    amount: 180,
    category: 'Saúde',
    date: '2026-06-06',
    paymentMethod: 'Pix'
  }
];

export const INITIAL_DEBTS: Debt[] = [
  {
    id: 'd1',
    name: 'Parcelamento Laptop Novo',
    totalAmount: 3200,
    paidAmount: 800,
    dueDate: '2026-06-15',
    status: 'parcial',
    notes: 'Faltam 6 parcelas de R$400'
  },
  {
    id: 'd2',
    name: 'Empréstimo Familiar',
    totalAmount: 500,
    paidAmount: 500,
    dueDate: '2026-06-10',
    status: 'paga',
    notes: 'Pago antes do vencimento'
  },
  {
    id: 'd3',
    name: 'Fatura Boleto Seguro Automotivo',
    totalAmount: 250,
    paidAmount: 0,
    dueDate: '2026-06-12',
    status: 'pendente'
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    name: 'Reserva de Emergência',
    targetAmount: 10000,
    currentAmount: 6200,
    deadline: '2026-12-31'
  },
  {
    id: 'g2',
    name: 'Viagem de Fim de Ano',
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: '2026-11-30'
  }
];

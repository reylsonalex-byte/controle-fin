/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Info, 
  Coins, 
  DollarSign, 
  Award,
  ArrowDownCircle,
  ShoppingBag
} from 'lucide-react';
import { Transaction, Settings } from '../types';
import { formatCurrency, calculateMonthlyTotals, translateMonth, getMonthList, formatDate } from '../utils/finance';

interface ReportsProps {
  transactions: Transaction[];
  settings: Settings;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export default function Reports({
  transactions,
  settings,
  selectedMonth,
  setSelectedMonth
}: ReportsProps) {

  // List of unique months with transactions
  const monthsList = useMemo(() => getMonthList(transactions), [transactions]);

  // Current active month metrics
  const monthlyTotals = useMemo(() => {
    return calculateMonthlyTotals(transactions, selectedMonth, settings.estimatedMonthlyIncome);
  }, [transactions, selectedMonth, settings.estimatedMonthlyIncome]);

  // 1. Calculate Expenses by category for this month
  const categoryExpenses = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'saída' && t.date.substring(0, 7) === selectedMonth)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    // Translate to sorted array
    return Object.entries(categories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: monthlyTotals.expenses > 0 ? Math.round((amount / monthlyTotals.expenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedMonth, monthlyTotals.expenses]);

  // 2. Largest individual expenses of the month
  const topExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'saída' && t.date.substring(0, 7) === selectedMonth)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, selectedMonth]);

  // Comparative bar totals calculation
  const maxBarValue = Math.max(monthlyTotals.income, monthlyTotals.expenses, 1000);
  const incomeBarHeight = monthlyTotals.income > 0 ? (monthlyTotals.income / maxBarValue) * 100 : 0;
  const expenseBarHeight = monthlyTotals.expenses > 0 ? (monthlyTotals.expenses / maxBarValue) * 100 : 0;

  // Savings rate calculation
  const savingsRate = monthlyTotals.income > 0 
    ? Math.max(0, Math.round(((monthlyTotals.income - monthlyTotals.expenses) / monthlyTotals.income) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header and selector */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white">Relatórios Financeiros</h2>
          <p className="mt-1 text-xs text-gray-400">
            Análises visuais de suas fontes de renda e pesos de canais de consumo.
          </p>
        </div>

        {/* Month Dropdown Filter */}
        <div className="flex items-center gap-2 self-start rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-sm">
          <BarChart3 className="h-4 w-4 text-brand-primary" />
          <span className="text-gray-300 font-medium">Analisar mês:</span>
          <select
            id="reports-month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer font-semibold"
          >
            {monthsList.map(month => (
              <option key={month} value={month} className="bg-dark-card text-white">
                {translateMonth(month)} / {month.split('-')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Block 1: Comparisons Graphics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Comparison: Entradas vs Saídas Column Chart (5 of 12) */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-gray-300 flex items-center gap-2 mb-1.5">
              <BarChart3 className="h-4 w-4 text-brand-primary" />
              Comparativo Mensal
            </h3>
            <p className="text-xs text-gray-400">Proporção líquida de entradas vs saídas de dinheiro.</p>
          </div>

          {/* Handcrafted double-column chart */}
          <div className="my-8 flex justify-around items-end h-56 px-4 relative border-b border-dark-border/40 pb-2">
            
            {/* Background alignment lines */}
            <div className="absolute inset-x-0 bottom-2 top-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
              <div className="border-t border-white w-full h-0" />
              <div className="border-t border-white w-full h-0" />
              <div className="border-t border-white w-full h-0" />
              <div className="border-t border-white w-full h-0" />
            </div>

            {/* Column 1: Entradas */}
            <div className="flex flex-col items-center gap-2.5 w-1/3">
              <div className="relative w-full flex justify-center group">
                <div 
                  className="w-12 sm:w-16 rounded-t-xl bg-linear-to-t from-emerald-600/65 to-success transition-all duration-700 relative shadow-md shadow-success/10 group-hover:brightness-110"
                  style={{ height: `${Math.max(8, incomeBarHeight * 1.8)}px` }}
                >
                  {/* Tooltip value */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dark-card-lighter border border-dark-border px-2 py-0.5 rounded-md text-[10px] font-mono text-success font-bold scale-90 md:scale-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(monthlyTotals.income)}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400 text-center flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Entradas
              </span>
              <span className="font-mono text-xs text-gray-300 font-bold">{formatCurrency(monthlyTotals.income)}</span>
            </div>

            {/* Column 2: Saídas */}
            <div className="flex flex-col items-center gap-2.5 w-1/3">
              <div className="relative w-full flex justify-center group flex-end">
                <div 
                  className="w-12 sm:w-16 rounded-t-xl bg-linear-to-t from-red-600/65 to-danger transition-all duration-700 relative shadow-md shadow-danger/10 group-hover:brightness-110"
                  style={{ height: `${Math.max(8, expenseBarHeight * 1.8)}px` }}
                >
                  {/* Tooltip value */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-dark-card-lighter border border-dark-border px-2 py-0.5 rounded-md text-[10px] font-mono text-danger font-bold scale-90 md:scale-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(monthlyTotals.expenses)}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-red-400 text-center flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Saídas
              </span>
              <span className="font-mono text-xs text-gray-300 font-bold">{formatCurrency(monthlyTotals.expenses)}</span>
            </div>

          </div>

          {/* Quick statement details */}
          <div className="bg-dark-bg/30 border border-dark-border/40 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-gray-400">Rendimento Líquido:</span>
            <span className={`font-mono font-bold ${monthlyTotals.balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {monthlyTotals.balance >= 0 ? '+' : ''}{formatCurrency(monthlyTotals.balance)}
            </span>
          </div>
        </div>

        {/* Expenses categories distribution rows (7 of 12) */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-5 lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-gray-300 flex items-center gap-2 mb-1.5">
              <PieChart className="h-4 w-4 text-brand-primary" />
              Despesas por Categoria
            </h3>
            <p className="text-xs text-gray-400">Classificação de gastos ordenados por fatia de participação financeira.</p>
          </div>

          <div className="my-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {categoryExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <Coins className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-sm font-medium">Nenhum gasto registrado neste mês</p>
                <p className="text-xs text-gray-500 mt-0.5">Adicione saídas do mês para mapear as proporções.</p>
              </div>
            ) : (
              categoryExpenses.map((cat, idx) => {
                // Color cycling
                const colors = [
                  'bg-brand-primary',
                  'bg-brand-secondary',
                  'bg-indigo-400',
                  'bg-teal-400',
                  'bg-amber-400',
                  'bg-pink-400',
                  'bg-emerald-400'
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-300 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${colorClass}`} />
                        {cat.name}
                      </span>
                      <span className="text-gray-400 font-medium">
                        <span className="font-mono text-gray-200 font-bold">{formatCurrency(cat.amount)}</span> ({cat.percentage}%)
                      </span>
                    </div>
                    {/* Progress representation */}
                    <div className="h-2 w-full rounded-full bg-dark-card-lighter overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-dark-border/40 pt-3 relative text-center">
            <p className="text-[11px] text-gray-500">Mapeamento dinâmico calculado sobre gastos reais do mês selecionado.</p>
          </div>
        </div>
      </div>

      {/* Grid Block 2: Largest Expenses & Summary metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Column 1: Largest individual expenses (Top 5) */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
          <h3 className="font-display text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <ArrowDownCircle className="h-4.5 w-4.5 text-danger" />
            Maiores Despesas de {translateMonth(selectedMonth)}
          </h3>

          {topExpenses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400">
              <ShoppingBag className="h-8 w-8 text-gray-600 mb-2" />
              <p className="text-xs font-semibold">Nenhuma despesa registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((expense, idx) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between rounded-xl border border-dark-border/30 bg-dark-bg/20 p-3 hover:border-dark-border/65 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 font-mono text-xs font-bold text-gray-500 bg-dark-card-lighter h-6 w-6 rounded-full flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{expense.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {expense.category} • {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-danger leading-none whitespace-nowrap">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Dashboard summaries */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
              <Award className="h-4.5 w-4.5 text-amber-500" />
              Resumo Financeiro Consolidado
            </h3>

            <div className="space-y-4">
              {/* Metric 1: Renda estimada comparativo */}
              <div className="flex justify-between items-center text-xs pb-3 border-b border-dark-border/30">
                <div>
                  <p className="text-gray-300 font-semibold">Eficiência no Orçamento</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Comparação de gasto sobre renda fixada.</p>
                </div>
                <span className={`rounded-lg px-2 py-1 font-mono font-bold ${
                  monthlyTotals.committedPercent < 50 ? 'bg-success/10 text-success' :
                  monthlyTotals.committedPercent < 75 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                }`}>
                  {monthlyTotals.committedPercent}% Comprometida
                </span>
              </div>

              {/* Metric 2: Taxa de poupança líquida */}
              <div className="flex justify-between items-center text-xs pb-3 border-b border-dark-border/30">
                <div>
                  <p className="text-gray-300 font-semibold">Taxa de Poupança Líquida</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Percentual de renda guardada no mês.</p>
                </div>
                <span className={`rounded-lg px-2 py-1 font-mono font-bold ${
                  savingsRate >= 20 ? 'bg-success/10 text-success' :
                  savingsRate > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-danger/10 text-danger'
                }`}>
                  {savingsRate}% Poupado
                </span>
              </div>

              {/* Metric 3: Balanço Líquido do Mês */}
              <div className="flex justify-between items-center text-xs pb-3">
                <div>
                  <p className="text-gray-300 font-semibold">Superavit Financeiro</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Saldo acumulado livre gerado.</p>
                </div>
                <span className={`font-mono text-sm font-semibold ${monthlyTotals.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(monthlyTotals.balance)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-brand-primary/5 border border-brand-primary/10 p-3.5 flex gap-3 text-xs text-indigo-200">
            <Info className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Conselho financeiro: Esforce-se para manter pelo menos <strong className="text-white">20%</strong> de sua renda convertida em investimento líquido ou meta mensal de economia recorrente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

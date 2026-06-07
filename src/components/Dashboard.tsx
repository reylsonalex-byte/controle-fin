/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertOctagon, 
  Target, 
  Percent, 
  Calendar, 
  PlusCircle, 
  CheckCircle, 
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Transaction, Debt, Goal, Settings } from '../types';
import { 
  formatCurrency, 
  calculateMonthlyTotals, 
  calculateDebtSummary, 
  generateSmartAlerts, 
  translateMonth, 
  getMonthList,
  formatDate
} from '../utils/finance';
import { motion } from 'motion/react';

interface DashboardProps {
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
  settings: Settings;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onAddTransactionClick: () => void;
  onAddDebtClick: () => void;
  onTabChange: (tab: string) => void;
}

export default function Dashboard({
  transactions,
  debts,
  goals,
  settings,
  selectedMonth,
  setSelectedMonth,
  onAddTransactionClick,
  onAddDebtClick,
  onTabChange
}: DashboardProps) {
  
  // Calculate totals for active selected month
  const monthlyTotals = calculateMonthlyTotals(transactions, selectedMonth, settings.estimatedMonthlyIncome);
  
  // Overall aggregates
  const debtSummary = calculateDebtSummary(debts);
  
  // Calculate general net worth (all time)
  const totalAllTimeIncome = transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
  const totalAllTimeExpenses = transactions.filter(t => t.type === 'saída').reduce((sum, t) => sum + t.amount, 0);
  const currentNetWorth = totalAllTimeIncome - totalAllTimeExpenses;

  // Active month savings goal progress
  const currentMonthSaving = Math.max(0, monthlyTotals.income - monthlyTotals.expenses);
  const savingsGoalValue = settings.defaultMonthlySavingsGoal;
  const savingsProgressPercent = savingsGoalValue > 0 
    ? Math.min(100, Math.round((currentMonthSaving / savingsGoalValue) * 100))
    : 0;
  const savingsMissing = Math.max(0, savingsGoalValue - currentMonthSaving);

  // Generate local warnings
  const smartAlerts = generateSmartAlerts(transactions, debts, goals, settings, selectedMonth);

  // Available months filter
  const monthsList = getMonthList(transactions);

  // Filter 4 recent transactions for current month
  const recentTransactions = transactions
    .filter(t => t.date.substring(0, 7) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Olá, <span className="text-brand-primary">{settings.userName}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Acompanhe seu saldo e progresso financeiro de forma inteligente.
          </p>
        </div>

        {/* Month Selector dropdown */}
        <div className="flex items-center gap-2 self-start rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-sm">
          <Calendar className="h-4 w-4 text-brand-primary" />
          <span className="text-gray-300 font-medium">Mês de Referência:</span>
          <select
            id="dashboard-month-select"
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

      {/* Top Aggregated Cards Block */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Saldo Líquido Geral */}
        <div 
          id="card-net-worth" 
          className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg transition-transform hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Saldo Geral Líquido</span>
            <div className="rounded-xl bg-brand-primary/10 p-2.5 text-brand-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold tracking-tight text-white">
              {formatCurrency(currentNetWorth)}
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
              Saldo acumulado de todos os registros
            </p>
          </div>
          <div className="absolute top-0 left-0 h-[3px] w-full bg-linear-to-r from-brand-primary to-brand-secondary" />
        </div>

        {/* Card 2: Entradas Mensais */}
        <div 
          id="card-monthly-income" 
          className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg transition-transform hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Entradas de {translateMonth(selectedMonth)}</span>
            <div className="rounded-xl bg-success/10 p-2.5 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold tracking-tight text-success">
              {formatCurrency(monthlyTotals.income)}
            </h3>
            <p className="mt-1.5 text-xs text-gray-400">
              Renda mensal estimada configurada: <span className="font-mono text-gray-300">{formatCurrency(settings.estimatedMonthlyIncome)}</span>
            </p>
          </div>
          <div className="absolute top-0 left-0 h-[3px] w-full bg-success" />
        </div>

        {/* Card 3: Saídas Mensais */}
        <div 
          id="card-monthly-expenses" 
          className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg transition-transform hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gastos de {translateMonth(selectedMonth)}</span>
            <div className="rounded-xl bg-danger/10 p-2.5 text-danger">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold tracking-tight text-danger">
              {formatCurrency(monthlyTotals.expenses)}
            </h3>
            <p className="mt-1.5 text-xs text-gray-400">
              Saldo líquido mensal: <span className={`font-mono font-medium ${monthlyTotals.balance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(monthlyTotals.balance)}</span>
            </p>
          </div>
          <div className="absolute top-0 left-0 h-[3px] w-full bg-danger" />
        </div>

        {/* Card 4: Dívidas Pendentes */}
        <div 
          id="card-pending-debts" 
          className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg transition-transform hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dívidas Pendentes</span>
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold tracking-tight text-amber-500">
              {formatCurrency(debtSummary.pendingAmount)}
            </h3>
            <div className="mt-1.5 flex justify-between text-xs text-gray-400">
              <span>Atrasadas: <span className="font-mono text-danger font-bold">{debtSummary.overdueCount}</span></span>
              <span>Totais: <span className="font-mono text-gray-300">{debtSummary.totalDebts}</span></span>
            </div>
          </div>
          <div className="absolute top-0 left-0 h-[3px] w-full bg-amber-500" />
        </div>

        {/* Card 5: Meta de Economia */}
        <div 
          id="card-savings-goal" 
          className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg transition-transform hover:translate-y-[-2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Meta de Economia Mensal</span>
            <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-400">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-2xl font-bold tracking-tight text-teal-400">
                {formatCurrency(currentMonthSaving)}
              </h3>
              <span className="text-xs font-semibold text-gray-400">
                Alvo: {formatCurrency(savingsGoalValue)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-dark-card-lighter overflow-hidden">
              <div 
                className="h-full rounded-full bg-teal-400 transition-all duration-500" 
                style={{ width: `${savingsProgressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
              <span>{savingsProgressPercent}% alcançado</span>
              <span>
                {savingsMissing > 0 ? `Falta ${formatCurrency(savingsMissing)}` : 'Meta batida! 🎉'}
              </span>
            </div>
          </div>
          <div className="absolute top-0 left-0 h-[3px] w-full bg-teal-400" />
        </div>

        {/* Card 6: Compromisso de Renda */}
        <div 
          id="card-income-commitment" 
          className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg transition-transform hover:translate-y-[2px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">% de Renda Comprometida</span>
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className={`font-mono text-2xl font-bold tracking-tight ${
                monthlyTotals.committedPercent >= 75 ? 'text-danger' : 
                monthlyTotals.committedPercent >= 50 ? 'text-orange-400' : 'text-success'
              }`}>
                {monthlyTotals.committedPercent}%
              </h3>
              <span className="text-xs font-semibold text-gray-400">
                Estimativa Base
              </span>
            </div>

            {/* Micro bar indicator */}
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-dark-card-lighter overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  monthlyTotals.committedPercent >= 75 ? 'bg-danger' : 
                  monthlyTotals.committedPercent >= 50 ? 'bg-orange-400' : 'bg-success'
                }`}
                style={{ width: `${monthlyTotals.committedPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Razão de despesas sobre entradas registradas ou estimadas
            </p>
          </div>
          <div className="absolute top-0 left-0 h-[3px] w-full bg-indigo-500" />
        </div>
      </div>

      {/* Grid: Alerts + Quick Actions & Recent movements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Column 1: Smart Alerts List & Actions (8 of 12) */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Action Quick triggers */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
            <h3 className="font-display text-base font-semibold text-white mb-4">Atalhos Rápidos</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                id="btn-quick-transaction"
                onClick={onAddTransactionClick}
                className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform focus:outline-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="h-5 w-5" />
                Lançar Nova Movimentação
              </button>
              <button
                id="btn-quick-debt"
                onClick={onAddDebtClick}
                className="flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-card-lighter px-4 py-3.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-[#252a42] hover:text-white cursor-pointer"
              >
                <AlertOctagon className="h-5 w-5 text-amber-500" />
                Cadastrar Nova Dívida
              </button>
            </div>
          </div>

          {/* Alert Alerts Section */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-white">Alertas Inteligentes</h3>
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary font-mono select-none">
                {smartAlerts.length} ativo{smartAlerts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {smartAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-success/10 p-3 text-success mb-2">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-300">Sua saúde financeira está excelente!</p>
                <p className="text-xs text-gray-400 mt-1">Nenhum alerta crítico ativo para o mês selecionado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {smartAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`flex gap-3 rounded-xl border p-4 text-sm transition-all ${
                      alert.type === 'danger' ? 'border-danger/20 bg-danger/5 text-red-200' :
                      alert.type === 'warning' ? 'border-warning/20 bg-warning/5 text-amber-200' :
                      alert.type === 'success' ? 'border-success/20 bg-success/5 text-emerald-200' :
                      'border-indigo-500/20 bg-indigo-500/5 text-indigo-200'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {alert.type === 'danger' && <AlertTriangle className="h-5 w-5 text-danger" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-warning" />}
                      {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-success" />}
                      {alert.type === 'info' && <Info className="h-5 w-5 text-indigo-400" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{alert.title}</h4>
                      <p className="mt-1 text-xs text-gray-300 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Recent Transactions (4 of 12) */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-dark-border bg-dark-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-white">Lançamentos Recentes</h3>
              <button
                id="btn-view-all-movements"
                onClick={() => onTabChange('transactions')}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-gray-400">
                <FileText className="h-10 w-10 text-gray-600 mb-2.5" />
                <p className="text-sm font-medium">Nenhum lançamento</p>
                <p className="text-xs text-gray-500 mt-1 px-4">Cadastre entradas ou saídas para visualizá-las aqui.</p>
              </div>
            ) : (
              <div className="space-y-3.5 flex-1">
                {recentTransactions.map(t => (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between rounded-xl border border-dark-border/40 bg-dark-card-lighter/25 p-3 hover:border-dark-border/100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Typology Badge Icon */}
                      <span className={`shrink-0 flex items-center justify-center rounded-lg p-2 ${
                        t.type === 'entrada' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                      }`}>
                        {t.type === 'entrada' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{t.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                          {t.category} • {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                    <span className={`font-mono text-xs font-bold leading-none ${
                      t.type === 'entrada' ? 'text-success' : 'text-danger'
                    }`}>
                      {t.type === 'entrada' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

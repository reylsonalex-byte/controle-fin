/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Debt, Goal, Settings } from '../types';

/**
 * Formats a numeric value to Brazilian Real (BRL) currency format: R$ 1.250,55
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formats a dates string (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Strips the year-month from YYYY-MM-DD
 */
export function getYearMonth(dateString: string): string {
  if (!dateString) return '';
  return dateString.substring(0, 7); // Returns "YYYY-MM"
}

/**
 * Safe local storage fetch and persistence
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Erro ao carregar do localStorage (${key}):`, error);
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar no localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Financial metrics calculation for a target month (format YYYY-MM)
 */
export interface MonthlyTotals {
  income: number;
  expenses: number;
  balance: number;
  committedPercent: number; // Percent of income or estimated income committed to expense
}

export function calculateMonthlyTotals(
  transactions: Transaction[],
  targetYearMonth: string,
  estimatedIncome: number
): MonthlyTotals {
  let income = 0;
  let expenses = 0;

  transactions.forEach(t => {
    if (getYearMonth(t.date) === targetYearMonth) {
      if (t.type === 'entrada') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    }
  });

  const baseIncome = income > 0 ? income : (estimatedIncome > 0 ? estimatedIncome : 1);
  const committedPercent = Math.min(100, Math.round((expenses / baseIncome) * 100));

  return {
    income,
    expenses,
    balance: income - expenses,
    committedPercent
  };
}

/**
 * Debt overview aggregates
 */
export interface DebtSummary {
  totalDebts: number;
  pendingAmount: number;
  paidAmount: number;
  overdueCount: number;
  upcomingCount: number; // Due in next 5 days and unpaid
}

export function calculateDebtSummary(debts: Debt[]): DebtSummary {
  let pendingAmount = 0;
  let paidAmount = 0;
  let overdueCount = 0;
  let upcomingCount = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTime = new Date(todayStr).getTime();
  const fiveDaysLaterTime = todayTime + 5 * 24 * 60 * 60 * 1000;

  debts.forEach(d => {
    const remaining = d.totalAmount - d.paidAmount;
    paidAmount += d.paidAmount;
    if (d.status !== 'paga') {
      pendingAmount += remaining;

      const dueTime = new Date(d.dueDate).getTime();
      if (dueTime < todayTime) {
        overdueCount++;
      } else if (dueTime <= fiveDaysLaterTime) {
        upcomingCount++;
      }
    }
  });

  return {
    totalDebts: debts.length,
    pendingAmount,
    paidAmount,
    overdueCount,
    upcomingCount
  };
}

/**
 * Dynamic Smart Alerts generator
 */
export interface FinancialAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
}

export function generateSmartAlerts(
  transactions: Transaction[],
  debts: Debt[],
  goals: Goal[],
  settings: Settings,
  currentYearMonth: string
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  const totals = calculateMonthlyTotals(transactions, currentYearMonth, settings.estimatedMonthlyIncome);
  const debtSum = calculateDebtSummary(debts);

  // Alert 1: Budget negative
  if (totals.expenses > totals.income && totals.income > 0) {
    alerts.push({
      id: 'alert_negative_month',
      type: 'danger',
      title: 'Atenção ao Orçamento',
      message: `Você já gastou mais do que recebeu neste mês de ${translateMonth(currentYearMonth)}. Procure frear saídas não essenciais.`
    });
  }

  // Alert 2: Highly committed income (> 75%)
  if (totals.committedPercent >= 75) {
    alerts.push({
      id: 'alert_highly_committed',
      type: 'warning',
      title: 'Renda Muito Comprometida',
      message: `Sua taxa de comprometimento mensal está em ${totals.committedPercent}%. Você está usando quase todo seu orçamento principal.`
    });
  }

  // Alert 3: Overdue debts
  if (debtSum.overdueCount > 0) {
    alerts.push({
      id: 'alert_overdue_debts',
      type: 'danger',
      title: 'Dívidas Atrasadas',
      message: `Você possui ${debtSum.overdueCount} ${debtSum.overdueCount === 1 ? 'dívida vencida' : 'dívidas vencidas'}. Organize seus pagamentos para evitar juros.`
    });
  }

  // Alert 4: Debts coming up
  if (debtSum.upcomingCount > 0) {
    alerts.push({
      id: 'alert_upcoming_debts',
      type: 'warning',
      title: 'Vencimentos Próximos',
      message: `Existem ${debtSum.upcomingCount} contas com vencimento nos próximos 5 dias. Lembre-se de agendar o pagamento.`
    });
  }

  // Alert 5: Goals progress reward
  goals.forEach(g => {
    const percent = Math.round((g.currentAmount / g.targetAmount) * 100);
    if (percent >= 85 && percent < 100) {
      alerts.push({
        id: `alert_goal_near_${g.id}`,
        type: 'success',
        title: 'Meta Quase Batida!',
        message: `Sua meta "${g.name}" está com ${percent}% de progresso! Falta muito pouco para alcançar seu objetivo.`
      });
    }
  });

  // Alert 6: High Monthly Saving default alert
  const currentActualSaved = totals.income > totals.expenses ? totals.income - totals.expenses : 0;
  if (currentActualSaved >= settings.defaultMonthlySavingsGoal && settings.defaultMonthlySavingsGoal > 0) {
    alerts.push({
      id: 'alert_target_reached',
      type: 'success',
      title: 'Meta de Poupança Alcançada',
      message: `Parabéns! Sua economia acumulada este mês (${formatCurrency(currentActualSaved)}) bateu seu objetivo mensal padrão de (${formatCurrency(settings.defaultMonthlySavingsGoal)}).`
    });
  } else if (currentActualSaved > 0 && currentActualSaved < settings.defaultMonthlySavingsGoal) {
    const remaining = settings.defaultMonthlySavingsGoal - currentActualSaved;
    if (remaining < 250) {
      alerts.push({
        id: 'alert_saving_close',
        type: 'info',
        title: 'Meta de Poupança Próxima',
        message: `Faltam apenas ${formatCurrency(remaining)} de economia líquida para você atingir seu objetivo padrão do mês.`
      });
    }
  }

  return alerts;
}

/**
 * Month translation from YYYY-MM descriptor
 */
export function translateMonth(yearMonth: string): string {
  if (!yearMonth) return '';
  const [_, month] = yearMonth.split('-');
  const months: { [key: string]: string } = {
    '01': 'Janeiro',
    '02': 'Fevereiro',
    '03': 'Março',
    '04': 'Abril',
    '05': 'Maio',
    '06': 'Junho',
    '07': 'Julho',
    '08': 'Agosto',
    '09': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro'
  };
  return months[month] || yearMonth;
}

export function getMonthList(transactions: Transaction[]): string[] {
  const months = new Set<string>();
  
  // Add current month in any case
  const today = new Date();
  const currentMonth = today.toISOString().substring(0, 7);
  months.add(currentMonth);

  transactions.forEach(t => {
    const ym = getYearMonth(t.date);
    if (ym) months.add(ym);
  });

  return Array.from(months).sort((a, b) => b.localeCompare(a)); // Newest first
}

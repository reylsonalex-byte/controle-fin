/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  CheckCircle, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Edit3, 
  HelpCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Debt, DebtStatus } from '../types';
import { formatCurrency, formatDate, calculateDebtSummary } from '../utils/finance';
import ConfirmModal from './ConfirmModal';

interface DebtsProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onEditDebt: (id: string, updated: Partial<Debt>) => void;
  onDeleteDebt: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (d: Debt) => void;
}

export default function Debts({
  debts,
  onAddDebt,
  onEditDebt,
  onDeleteDebt,
  onOpenAddModal,
  onOpenEditModal
}: DebtsProps) {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Debt | null>(null);
  
  // Calculate statistics using our utility
  const summary = calculateDebtSummary(debts);

  // Quick Action: Mark as Paid
  const handleMarkAsFullyPaid = (debt: Debt) => {
    onEditDebt(debt.id, {
      paidAmount: debt.totalAmount,
      status: 'paga'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Trigger Add */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white">Gestão de Dívidas</h2>
          <p className="mt-1 text-xs text-gray-400">
            Gerencie contas parceladas, faturas de cartão de crédito e lembretes de devedores.
          </p>
        </div>

        <button
          id="btn-regist-debt"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:outline-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Nova Dívida
        </button>
      </div>

      {/* Grid: Stats Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total debts registered */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total de Dívidas</p>
            <h4 className="font-mono text-lg font-bold text-white mt-0.5">{summary.totalDebts} registradas</h4>
          </div>
        </div>

        {/* Total Pending Value */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-amber-500/10 p-3 text-amber-500">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total a Pagar</p>
            <h4 className="font-mono text-lg font-bold text-amber-500 mt-0.5">{formatCurrency(summary.pendingAmount)}</h4>
          </div>
        </div>

        {/* Vencidas */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-danger/10 p-3 text-danger">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Vencidas (Atrasadas)</p>
            <h4 className="font-mono text-lg font-bold text-danger mt-0.5">{summary.overdueCount} {summary.overdueCount === 1 ? 'pendente' : 'pendentes'}</h4>
          </div>
        </div>

        {/* Upcoming Count */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Vence nos próx. 5 dias</p>
            <h4 className="font-mono text-lg font-bold text-indigo-400 mt-0.5">{summary.upcomingCount} fatura{summary.upcomingCount !== 1 ? 's' : ''}</h4>
          </div>
        </div>
      </div>

      {/* Grid List view */}
      {debts.length === 0 ? (
        <div className="rounded-2xl border border-dark-border bg-dark-card py-16 flex flex-col items-center justify-center text-center px-4">
          <HelpCircle className="h-12 w-12 text-gray-600 mb-2.5" />
          <p className="text-base font-semibold text-gray-200">Nenhuma dívida cadastrada</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Clique em "Nova Dívida" para manter seus credores e faturas sob vigilância inteligente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {debts.map(d => {
            const paidPercent = d.totalAmount > 0 
              ? Math.min(100, Math.round((d.paidAmount / d.totalAmount) * 100))
              : 0;
            const remainingValue = Math.max(0, d.totalAmount - d.paidAmount);
            
            // Check expiry
            const todayStr = new Date().toISOString().split('T')[0];
            const isOverdue = d.status !== 'paga' && d.dueDate < todayStr;

            return (
              <div 
                key={d.id}
                className="relative rounded-2xl border border-dark-border bg-dark-card p-5 shadow-sm hover:border-dark-border/100 transition-colors flex flex-col justify-between"
              >
                {/* Upper row: Name & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-white/95 leading-tight truncate max-w-[150px]">
                      {d.name}
                    </h3>
                    
                    {/* Expiry / status label */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${
                        d.status === 'paga' ? 'bg-success/15 text-success' :
                        d.status === 'parcial' ? 'bg-indigo-500/15 text-indigo-300' :
                        isOverdue ? 'bg-danger/20 text-danger' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {d.status === 'paga' ? 'paga' :
                         isOverdue ? 'atrasada' : 
                         d.status === 'parcial' ? 'parcial' : 'pendente'}
                      </span>
                      
                      <span className="text-[10px] text-gray-500 font-mono">
                         Vence em {formatDate(d.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {d.notes && (
                    <p className="mt-2 text-xs text-gray-400 line-clamp-2 bg-dark-bg/30 p-2 rounded-lg border border-dark-border/20 italic">
                      {d.notes}
                    </p>
                  )}

                  {/* Financial Breakdown */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium text-gray-400 bg-dark-bg/20 p-2.5 rounded-xl border border-dark-border/10">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500">Valor Total</p>
                      <p className="font-mono text-gray-200 mt-0.5 font-bold">{formatCurrency(d.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500">Pendente</p>
                      <p className={`font-mono mt-0.5 font-bold ${remainingValue > 0 ? 'text-amber-500' : 'text-success'}`}>
                        {formatCurrency(remainingValue)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar info */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Total Pago: <span className="font-mono text-gray-200 font-semibold">{formatCurrency(d.paidAmount)}</span></span>
                      <span className="font-mono text-brand-primary font-bold">{paidPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-dark-card-lighter overflow-hidden border border-dark-border/20">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          d.status === 'paga' ? 'bg-success' : 'bg-brand-primary'
                        }`}
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom row actions panel */}
                <div className="mt-5 border-t border-dark-border/40 pt-3.5 flex items-center justify-between gap-1 select-none">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-edit-debt-${d.id}`}
                      onClick={() => onOpenEditModal(d)}
                      className="rounded-lg p-2 text-xs font-semibold text-gray-400 hover:bg-dark-card-lighter hover:text-white transition-colors cursor-pointer"
                      title="Editar débito"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-delete-debt-${d.id}`}
                      onClick={() => setDeleteConfirmTarget(d)}
                      className="rounded-lg p-2 text-xs font-semibold text-gray-400 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                      title="Excluir dívida"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {d.status !== 'paga' && (
                    <button
                      id={`btn-pay-debt-${d.id}`}
                      onClick={() => handleMarkAsFullyPaid(d)}
                      className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-bold text-success hover:bg-success/20 transition-all cursor-pointer active:scale-95"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Marcar paga
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmTarget !== null}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={() => {
          if (deleteConfirmTarget) {
            onDeleteDebt(deleteConfirmTarget.id);
          }
        }}
        title="Apagar Lançamento de Dívida"
        message={`Tem certeza que deseja remover permanentemente o registro de dívida ou conta "${deleteConfirmTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, Remover"
        cancelText="Voltar"
        variant="danger"
      />
    </div>
  );
}

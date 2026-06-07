/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  PiggyBank, 
  Trash2, 
  Edit3, 
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Goal } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';
import ConfirmModal from './ConfirmModal';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onEditGoal: (id: string, updated: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (g: Goal) => void;
}

export default function Goals({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenAddModal,
  onOpenEditModal
}: GoalsProps) {
  
  // Local state for fast deposit click
  const [fastDepositAmount, setFastDepositAmount] = useState<{[key: string]: string}>({});
  const [isDepositing, setIsDepositing] = useState<{[key: string]: boolean}>({});
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Goal | null>(null);
  const [fastDepositErrors, setFastDepositErrors] = useState<{[key: string]: string}>({});

  // Trigger fast deposit callback
  const handleFastSavingDeposit = (goalId: string, currentVal: number, targetVal: number) => {
    const inputStr = fastDepositAmount[goalId];
    if (!inputStr) return;
    const amountVal = parseFloat(inputStr);

    if (isNaN(amountVal) || amountVal <= 0) {
      setFastDepositErrors(prev => ({ ...prev, [goalId]: 'Insira um valor positivo válido.' }));
      return;
    }

    const newVal = Math.min(targetVal, currentVal + amountVal);
    onEditGoal(goalId, {
      currentAmount: newVal
    });

    // Clear inputs and errors
    setFastDepositErrors(prev => ({ ...prev, [goalId]: '' }));
    setFastDepositAmount(prev => ({ ...prev, [goalId]: '' }));
    setIsDepositing(prev => ({ ...prev, [goalId]: false }));
  };

  return (
    <div className="space-y-6">
      {/* Header and trigger */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white">Metas de Economia</h2>
          <p className="mt-1 text-xs text-gray-400">
            Crie cofres de poupança dedicados para viagens, reservas de segurança e sonhos de consumo.
          </p>
        </div>

        <button
          id="btn-regist-goal"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:outline-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Nova Meta
        </button>
      </div>

      {/* Grid: Goals Listing */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dark-border bg-dark-card py-16 flex flex-col items-center justify-center text-center px-4">
          <PiggyBank className="h-12 w-12 text-gray-600 mb-2.5" />
          <p className="text-base font-semibold text-gray-200">Nenhuma meta configurada</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Defina o que você quer conquistar e poupe consistentemente para atingir suas metas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map(g => {
            const percent = g.targetAmount > 0 
              ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
              : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const isCompleted = g.currentAmount >= g.targetAmount;
            const isClose = percent >= 85 && !isCompleted;

            return (
              <div 
                key={g.id}
                className="relative rounded-2xl border border-dark-border bg-dark-card p-5 shadow-sm hover:border-dark-border/100 transition-colors flex flex-col justify-between"
              >
                {/* Upper Details */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-white/95 leading-tight truncate max-w-[150px]">
                      {g.name}
                    </h3>
                    
                    {/* Status Badge */}
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${
                      isCompleted ? 'bg-success/15 text-success' :
                      isClose ? 'bg-indigo-500/15 text-indigo-300' : 'bg-brand-primary/10 text-brand-primary'
                    }`}>
                      {isCompleted ? 'Alcançada' :
                       isClose ? 'Quase lá' : 'Em progresso'}
                    </span>
                  </div>

                  {/* Deadline info code */}
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2 font-mono">
                    <Calendar className="h-3 w-3 text-gray-600" />
                    <span>Prazo final: {formatDate(g.deadline)}</span>
                  </div>

                  {/* Financial Metrics breakdowns */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium text-gray-400 bg-dark-bg/25 p-3 rounded-xl border border-dark-border/10">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500">Valor Almejado</p>
                      <p className="font-mono text-gray-200 mt-0.5 font-bold">{formatCurrency(g.targetAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-500">Falta Poupar</p>
                      <p className={`font-mono mt-0.5 font-bold ${remaining > 0 ? 'text-brand-primary' : 'text-success'}`}>
                        {remaining > 0 ? formatCurrency(remaining) : 'Concluído! 🏆'}
                      </p>
                    </div>
                  </div>

                  {/* Progress meter */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Poupado: <span className="font-mono text-gray-200 font-semibold">{formatCurrency(g.currentAmount)}</span></span>
                      <span className={`font-mono font-bold ${isCompleted ? 'text-success' : 'text-brand-primary'}`}>{percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-dark-card-lighter overflow-hidden border border-dark-border/20">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-success' : 'bg-brand-primary'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Micro savings deposits interaction */}
                <div className="mt-5 border-t border-dark-border/30 pt-3 flex flex-col gap-3">
                  {isDepositing[g.id] ? (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-brand-primary font-bold">R$</span>
                          <input
                            id={`input-saving-fast-${g.id}`}
                            type="number"
                            placeholder="Quantia"
                            min="0.01"
                            step="0.01"
                            value={fastDepositAmount[g.id] || ''}
                            onChange={(e) => {
                              setFastDepositErrors(prev => ({ ...prev, [g.id]: '' }));
                              setFastDepositAmount(prev => ({...prev, [g.id]: e.target.value}));
                            }}
                            className="w-full rounded-lg border border-dark-border bg-dark-bg py-1.5 pl-7 pr-2 text-xs text-white focus:outline-none focus:border-brand-primary placeholder-gray-600 font-mono"
                          />
                        </div>
                        {fastDepositErrors[g.id] && (
                          <p className="text-[10px] text-red-400 mt-1 pl-1">
                            {fastDepositErrors[g.id]}
                          </p>
                        )}
                      </div>
                      <button
                        id={`btn-confirm-save-fast-${g.id}`}
                        onClick={() => handleFastSavingDeposit(g.id, g.currentAmount, g.targetAmount)}
                        className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
                      >
                        Salvar
                      </button>
                      <button
                        id={`btn-cancel-save-fast-${g.id}`}
                        onClick={() => setIsDepositing(prev => ({ ...prev, [g.id]: false }))}
                        className="rounded-lg bg-dark-card-lighter px-2 py-1.5 text-xs text-gray-400 font-medium transition-colors hover:text-white cursor-pointer"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-edit-goal-${g.id}`}
                          onClick={() => onOpenEditModal(g)}
                          className="rounded-lg p-2 text-xs font-semibold text-gray-400 hover:bg-dark-card-lighter hover:text-white transition-colors cursor-pointer"
                          title="Editar meta"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          id={`btn-delete-goal-${g.id}`}
                          onClick={() => setDeleteConfirmTarget(g)}
                          className="rounded-lg p-2 text-xs font-semibold text-gray-400 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                          title="Excluir meta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {!isCompleted && (
                        <button
                          id={`btn-deposit-goal-${g.id}`}
                          onClick={() => setIsDepositing(prev => ({ ...prev, [g.id]: true }))}
                          className="flex items-center gap-1 rounded-lg bg-brand-primary/10 px-2.5 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/20 transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Aportar valor
                        </button>
                      )}
                    </div>
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
            onDeleteGoal(deleteConfirmTarget.id);
          }
        }}
        title="Excluir Cofrinho de Meta"
        message={`Tem certeza que deseja excluir o cofrinho de economias "${deleteConfirmTarget?.name}"? Todo o progresso poupado será removido.`}
        confirmText="Sim, Excluir"
        cancelText="Voltar"
        variant="danger"
      />
    </div>
  );
}

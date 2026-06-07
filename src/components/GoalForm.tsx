/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Goal } from '../types';

interface GoalFormProps {
  initialData?: Goal | null;
  onSubmit: (data: Omit<Goal, 'id'>) => void;
  onCancel: () => void;
}

export default function GoalForm({
  initialData,
  onSubmit,
  onCancel
}: GoalFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount ? initialData.targetAmount.toString() : '');
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount !== undefined ? initialData.currentAmount.toString() : '0');
  const [deadline, setDeadline] = useState(initialData?.deadline || new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const targetVal = parseFloat(targetAmount);
    const currVal = parseFloat(currentAmount) || 0;

    if (!cleanName) {
      setError('Por favor insira um nome de identificação para a meta.');
      return;
    }

    if (isNaN(targetVal) || targetVal <= 0) {
      setError('O valor desejado (alvo) precisa ser maior que zero.');
      return;
    }

    if (isNaN(currVal) || currVal < 0) {
      setError('O valor guardado não pode ser menor que zero.');
      return;
    }

    if (currVal > targetVal) {
      setError('O valor guardado não pode ser maior que o valor total de sua meta.');
      return;
    }

    if (!deadline) {
      setError('Selecione uma data limite válida.');
      return;
    }

    onSubmit({
      name: cleanName,
      targetAmount: targetVal,
      currentAmount: currVal,
      deadline
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-300">
      {/* Inline Error Message */}
      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-xs text-red-200 flex items-center gap-2 animate-fade-in-down">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
          <span>{error}</span>
        </div>
      )}

      {/* Name representation */}
      <div className="space-y-1.5">
        <label htmlFor="goal-name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Identificação da Meta</label>
        <input
          id="goal-name"
          type="text"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Compra do Carro, Viagem Disney, Fundo emergencial..."
          className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Target value */}
        <div className="space-y-1.5">
          <label htmlFor="goal-target" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor total desejado (R$)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500">R$</span>
            <input
              id="goal-target"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-dark-border bg-dark-bg pl-9 pr-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none font-mono font-semibold"
            />
          </div>
        </div>

        {/* Current amount saved */}
        <div className="space-y-1.5">
          <label htmlFor="goal-current" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor poupado até agora (R$)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500">R$</span>
            <input
              id="goal-current"
              type="number"
              min="0"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-dark-border bg-dark-bg pl-9 pr-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none font-mono font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Deadline field */}
      <div className="space-y-1.5">
        <label htmlFor="goal-deadline" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Prazo final estimado</label>
        <input
          id="goal-deadline"
          type="date"
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none cursor-pointer"
        />
      </div>

      {/* Control panel */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/40 font-semibold select-none">
        <button
          id="goal-cancel-btn"
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-dark-border bg-dark-bg/40 px-4 py-2.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          id="goal-save-btn"
          type="submit"
          className="rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-5 py-2.5 text-xs text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {initialData ? 'Atualizar Meta' : 'Salvar Meta'}
        </button>
      </div>
    </form>
  );
}

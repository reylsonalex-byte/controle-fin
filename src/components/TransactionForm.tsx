/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, PaymentMethod, TransactionType } from '../types';

interface TransactionFormProps {
  initialData?: Transaction | null;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

export default function TransactionForm({
  initialData,
  onSubmit,
  onCancel
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'saída');
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toString() : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'Pix');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState<string | null>(null);

  // Reset category lists if switching from entry (income) to output (expense)
  useEffect(() => {
    if (!initialData) {
      if (type === 'entrada') {
        setCategory(INCOME_CATEGORIES[0]);
      } else {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  }, [type, initialData]);

  // Handle submit action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDescription = description.trim();
    const amountVal = parseFloat(amount);

    if (!cleanDescription) {
      setError('Por favor, informe uma descrição.');
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      setError('Por favor, informe um valor positivo maior que zero.');
      return;
    }

    if (!date) {
      setError('Por favor, selecione uma data válida.');
      return;
    }

    onSubmit({
      type,
      description: cleanDescription,
      amount: amountVal,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined
    });
  };

  const categoriesToUse = type === 'entrada' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-300">
      {/* Inline Error Message */}
      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-xs text-red-200 flex items-center gap-2 animate-fade-in-down">
          <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
          <span>{error}</span>
        </div>
      )}

      {/* Transaction Type selection bar */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo de Movimentação</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="form-type-entrada"
            type="button"
            onClick={() => setType('entrada')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              type === 'entrada' 
                ? 'bg-success/10 border-success text-success' 
                : 'bg-dark-bg border-dark-border text-gray-400 hover:text-gray-300'
            }`}
          >
            Entrada (Rendimento)
          </button>
          <button
            id="form-type-saida"
            type="button"
            onClick={() => setType('saída')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              type === 'saída' 
                ? 'bg-danger/10 border-danger text-danger' 
                : 'bg-dark-bg border-dark-border text-gray-400 hover:text-gray-300'
            }`}
          >
            Saída (Gasto)
          </button>
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <label htmlFor="form-description" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</label>
        <input
          id="form-description"
          type="text"
          required
          maxLength={80}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Aluguel, Supermercado, Almoço..."
          className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Value Field */}
        <div className="space-y-1.5">
          <label htmlFor="form-amount" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor (R$)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500">R$</span>
            <input
              id="form-amount"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-dark-border bg-dark-bg pl-9 pr-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none font-mono font-semibold"
            />
          </div>
        </div>

        {/* Date Field */}
        <div className="space-y-1.5">
          <label htmlFor="form-date" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Data do Registro</label>
          <input
            id="form-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Category Field */}
        <div className="space-y-1.5">
          <label htmlFor="form-category" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</label>
          <select
            id="form-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-bg px-3 py-2.5 text-white focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            {categoriesToUse.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Payment Method Field */}
        <div className="space-y-1.5">
          <label htmlFor="form-payment" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Forma de Pagamento</label>
          <select
            id="form-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full rounded-xl border border-dark-border bg-dark-bg px-3 py-2.5 text-white focus:border-brand-primary focus:outline-none cursor-pointer capitalize"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Observation optional note */}
      <div className="space-y-1.5">
        <label htmlFor="form-notes" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Observações/Notas (Opcional)</label>
        <textarea
          id="form-notes"
          maxLength={200}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Comentário sobre a movimentação..."
          className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2 text-white focus:border-brand-primary focus:outline-none resize-none"
        />
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/40">
        <button
          id="form-cancel-btn"
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-dark-border bg-dark-bg/40 px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          id="form-save-btn"
          type="submit"
          className="rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {initialData ? 'Atualizar Registro' : 'Salvar Lançamento'}
        </button>
      </div>
    </form>
  );
}

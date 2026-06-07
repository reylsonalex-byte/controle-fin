/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Debt, DebtStatus } from '../types';

interface DebtFormProps {
  initialData?: Debt | null;
  onSubmit: (data: Omit<Debt, 'id'>) => void;
  onCancel: () => void;
}

export default function DebtForm({
  initialData,
  onSubmit,
  onCancel
}: DebtFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount ? initialData.totalAmount.toString() : '');
  const [paidAmount, setPaidAmount] = useState(initialData?.paidAmount !== undefined ? initialData.paidAmount.toString() : '0');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState<string | null>(null);
  
  // Local state status derived or manually chosen
  const [status, setStatus] = useState<DebtStatus>(initialData?.status || 'pendente');

  // Automatically adjust status as a nice user experience helper
  useEffect(() => {
    const tot = parseFloat(totalAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;

    if (tot > 0) {
      if (paid >= tot) {
        setStatus('paga');
      } else if (paid > 0) {
        setStatus('parcial');
      } else {
        setStatus('pendente');
      }
    }
  }, [totalAmount, paidAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const totVal = parseFloat(totalAmount);
    const paidVal = parseFloat(paidAmount) || 0;

    if (!cleanName) {
      setError('Por favor insira um nome descritivo para a dívida.');
      return;
    }

    if (isNaN(totVal) || totVal <= 0) {
      setError('O valor total da dívida precisa ser maior que zero.');
      return;
    }

    if (isNaN(paidVal) || paidVal < 0) {
      setError('O valor já pago não pode ser menor que zero.');
      return;
    }

    if (paidVal > totVal) {
      setError('O valor já pago não pode exceder o valor total da dívida.');
      return;
    }

    if (!dueDate) {
      setError('Selecione uma data de vencimento válida.');
      return;
    }

    onSubmit({
      name: cleanName,
      totalAmount: totVal,
      paidAmount: paidVal,
      dueDate,
      status,
      notes: notes.trim() || undefined
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

      {/* Name of Debt Field */}
      <div className="space-y-1.5">
        <label htmlFor="debt-name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Identificação do Débito / Credor</label>
        <input
          id="debt-name"
          type="text"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Banco Itaú, Fatura Wi-Fi, Parcela notebook..."
          className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total Value Field */}
        <div className="space-y-1.5">
          <label htmlFor="debt-total" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor Total (R$)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500">R$</span>
            <input
              id="debt-total"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-dark-border bg-dark-bg pl-9 pr-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none font-mono font-semibold"
            />
          </div>
        </div>

        {/* Paid Value Field */}
        <div className="space-y-1.5">
          <label htmlFor="debt-paid" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor já Pago (R$)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500">R$</span>
            <input
              id="debt-paid"
              type="number"
              min="0"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-dark-border bg-dark-bg pl-9 pr-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none font-mono font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date Expiry field */}
        <div className="space-y-1.5">
          <label htmlFor="debt-due" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Data do Vencimento</label>
          <input
            id="debt-due"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2.5 text-white focus:border-brand-primary focus:outline-none cursor-pointer"
          />
        </div>

        {/* Status display label (readonly based on mathematical derivation) */}
        <div className="space-y-1.5 select-none">
          <label htmlFor="debt-status" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Gerado</label>
          <div className="w-full rounded-xl border border-dark-border/40 bg-dark-card-lighter/45 px-3.5 py-2.5 text-white font-semibold">
            {status === 'paga' && <span className="text-success font-bold font-mono">🏆 Totalmente Quitada (PAGA)</span>}
            {status === 'parcial' && <span className="text-indigo-400 font-bold font-mono">⚡ Amortização Parcial</span>}
            {status === 'pendente' && <span className="text-amber-500 font-bold font-mono">⏳ Aguardando Pagamento (PENDENTE)</span>}
          </div>
        </div>
      </div>

      {/* Observation notes */}
      <div className="space-y-1.5">
        <label htmlFor="debt-notes" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Observações/Notas (Opcional)</label>
        <textarea
          id="debt-notes"
          maxLength={200}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Comentário sobre juros, parcelas ou número do contrato..."
          className="w-full rounded-xl border border-dark-border bg-dark-bg px-3.5 py-2 text-white focus:border-brand-primary focus:outline-none resize-none"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/40">
        <button
          id="debt-cancel-btn"
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-dark-border bg-dark-bg/40 px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          id="debt-save-btn"
          type="submit"
          className="rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-5 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {initialData ? 'Atualizar Dívida' : 'Salvar Dívida'}
        </button>
      </div>
    </form>
  );
}

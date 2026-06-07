/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  Coins, 
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, PaymentMethod, TransactionType } from '../types';
import { formatCurrency, formatDate, translateMonth, getMonthList } from '../utils/finance';
import ConfirmModal from './ConfirmModal';

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (t: Transaction) => void;
  selectedMonth: string;
}

export default function Transactions({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  onOpenEditModal,
  selectedMonth
}: TransactionsProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'todos'>('todos');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Transaction | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterMonth, setFilterMonth] = useState<string>(selectedMonth);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('todos');
    setFilterCategory('todos');
    setFilterMonth('todos');
  };

  // Build months listing dynamically for dropdown
  const monthsList = useMemo(() => getMonthList(transactions), [transactions]);

  // Combine categories for standard filter list
  const allCategories = useMemo(() => {
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, []);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Matches text keyword
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Matches ledger type
      const matchesType = filterType === 'todos' || t.type === filterType;
      
      // 3. Matches category
      const matchesCategory = filterCategory === 'todos' || t.category === filterCategory;
      
      // 4. Matches target yearMonth (or 'todos' to list all history)
      const matchesMonth = filterMonth === 'todos' || t.date.substring(0, 7) === filterMonth;

      return matchesSearch && matchesType && matchesCategory && matchesMonth;
    }).sort((a, b) => b.date.localeCompare(a.date)); // Newest first
  }, [transactions, searchTerm, filterType, filterCategory, filterMonth]);

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white">Movimentações</h2>
          <p className="mt-1 text-xs text-gray-400">
            Filtre, pesquise e faça a gestão de seus rendimentos e despesas mensais.
          </p>
        </div>

        <button
          id="btn-regist-move"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:outline-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Nova Movimentação
        </button>
      </div>

      {/* Grid: Filters Box */}
      <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-gray-300 mb-4">
          <Filter className="h-4 w-4 text-brand-primary" />
          Filtros de Busca
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Keyword search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="filter-search-input"
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-dark-border bg-dark-bg py-2.5 pl-9 pr-4 text-sm text-white focus:border-brand-primary focus:outline-none placeholder-gray-500"
            />
          </div>

          {/* 2. Month Selector */}
          <div>
            <select
              id="filter-month-select"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full rounded-xl border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-gray-300 focus:border-brand-primary focus:outline-none cursor-pointer"
            >
              <option value="todos" className="bg-dark-card text-white">Todos os meses</option>
              {monthsList.map(month => (
                <option key={month} value={month} className="bg-dark-card text-white">
                  {translateMonth(month)} / {month.split('-')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Type Selector */}
          <div>
            <select
              id="filter-type-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType | 'todos')}
              className="w-full rounded-xl border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-gray-300 focus:border-brand-primary focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os tipos (Entradas/Saídas)</option>
              <option value="entrada">Entradas (Rendimento)</option>
              <option value="saída">Saídas (Despesas)</option>
            </select>
          </div>

          {/* 4. Category Selector */}
          <div>
            <select
              id="filter-category-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full rounded-xl border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-gray-300 focus:border-brand-primary focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas as categorias</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters status and reset */}
        {(searchTerm || filterType !== 'todos' || filterCategory !== 'todos' || filterMonth !== 'todos') && (
          <div className="mt-4 flex items-center justify-between border-t border-dark-border/40 pt-4">
            <span className="text-xs text-gray-400">
              Mostrando <strong className="text-gray-200">{filteredTransactions.length}</strong> de <strong className="text-gray-200">{transactions.length}</strong> lançamentos encontrados.
            </span>
            <button
              id="btn-clear-filters"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-danger hover:underline cursor-pointer"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* List Container */}
      <div className="rounded-2xl border border-dark-border bg-dark-card overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 px-6">
            <Coins className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-base font-semibold text-gray-200">Nenhum lançamento encontrado</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
              Tente redefinir seus filtros acima ou adicione novos lançamentos clicando em "Nova Movimentação".
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-gray-300">
                <thead className="bg-[#121420] text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-dark-border">
                  <tr>
                    <th scope="col" className="px-6 py-4">Descrição</th>
                    <th scope="col" className="px-6 py-4">Categoria</th>
                    <th scope="col" className="px-6 py-4">Data</th>
                    <th scope="col" className="px-6 py-4">Forma de Pagto.</th>
                    <th scope="col" className="px-6 py-4 text-right">Valor</th>
                    <th scope="col" className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/55">
                  {filteredTransactions.map((t) => (
                    <tr 
                      key={t.id} 
                      className="hover:bg-dark-card-lighter/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center justify-center rounded-lg p-2 ${
                            t.type === 'entrada' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                          }`}>
                            {t.type === 'entrada' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{t.description}</p>
                            {t.notes && <p className="text-xs text-gray-500 mt-0.5 italic max-w-xs truncate">{t.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-dark-bg border border-dark-border px-2.5 py-1 text-xs text-gray-300 font-medium font-mono">
                          <Tag className="h-3 w-3 text-brand-primary" />
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-medium">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap capitalize">
                        {t.paymentMethod}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold whitespace-nowrap text-base ${
                        t.type === 'entrada' ? 'text-success' : 'text-danger'
                      }`}>
                        {t.type === 'entrada' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-edit-transaction-${t.id}`}
                            onClick={() => onOpenEditModal(t)}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-dark-card-lighter hover:text-white cursor-pointer"
                            title="Editar lançamento"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-delete-transaction-${t.id}`}
                            onClick={() => setDeleteConfirmTarget(t)}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack View */}
            <div className="block md:hidden divide-y divide-dark-border/40 select-none">
              {filteredTransactions.map((t) => (
                <div 
                  key={t.id} 
                  className="p-4 space-y-3 hover:bg-dark-card-lighter/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`shrink-0 flex items-center justify-center rounded-lg p-2.5 ${
                        t.type === 'entrada' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                      }`}>
                        {t.type === 'entrada' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white/95 text-sm sm:text-base truncate">{t.description}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 rounded-md bg-dark-bg px-2 py-0.5 text-[10px] text-gray-300 font-mono">
                            {t.category}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {formatDate(t.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`font-mono text-sm sm:text-base font-bold whitespace-nowrap shrink-0 ${
                      t.type === 'entrada' ? 'text-success' : 'text-danger'
                    }`}>
                      {t.type === 'entrada' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>

                  {t.notes && (
                    <p className="text-xs text-gray-400 bg-dark-bg/40 p-2 rounded-lg italic border border-dark-border/20">
                      {t.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-dark-border/30 pt-2 text-xs">
                    <span className="text-gray-400">
                      Modalidade: <strong className="text-gray-300 capitalize">{t.paymentMethod}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        id={`btn-mob-edit-${t.id}`}
                        onClick={() => onOpenEditModal(t)}
                        className="flex items-center gap-1 font-semibold text-brand-primary active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        id={`btn-mob-delete-${t.id}`}
                        onClick={() => setDeleteConfirmTarget(t)}
                        className="flex items-center gap-1 font-semibold text-danger active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirmTarget !== null}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={() => {
          if (deleteConfirmTarget) {
            onDeleteTransaction(deleteConfirmTarget.id);
          }
        }}
        title="Excluir Lançamento"
        message={`Tem certeza que deseja apagar permanentemente o lançamento "${deleteConfirmTarget?.description}" no valor de ${deleteConfirmTarget ? formatCurrency(deleteConfirmTarget.amount) : ''}?`}
        confirmText="Sim, Excluir"
        cancelText="Voltar"
        variant="danger"
      />
    </div>
  );
}

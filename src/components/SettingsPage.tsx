/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  DollarSign, 
  Target, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  Moon,
  Sun,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { Settings } from '../types';
import { formatCurrency } from '../utils/finance';
import ConfirmModal from './ConfirmModal';

interface SettingsPageProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<boolean>;
  onClearAllData: () => void;
}

export default function SettingsPage({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearAllData
}: SettingsPageProps) {
  // Temporary state for the form fields
  const [userName, setUserName] = useState(settings.userName);
  const [estimatedIncome, setEstimatedIncome] = useState(settings.estimatedMonthlyIncome.toString());
  const [savingsGoal, setSavingsGoal] = useState(settings.defaultMonthlySavingsGoal.toString());
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [backupStatusMsg, setBackupStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Submit preferences setting state
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('idle');
    setValidationError(null);

    const incomeVal = parseFloat(estimatedIncome);
    const goalVal = parseFloat(savingsGoal);

    // Validation
    if (!userName.trim()) {
      setValidationError('Por favor insira um nome de usuário válido.');
      setSaveStatus('error');
      return;
    }

    if (isNaN(incomeVal) || incomeVal < 0) {
      setValidationError('A renda mensal estimada não pode ser negativa.');
      setSaveStatus('error');
      return;
    }

    if (isNaN(goalVal) || goalVal < 0) {
      setValidationError('A meta de economia padrão não pode ser negativa.');
      setSaveStatus('error');
      return;
    }

    onUpdateSettings({
      userName: userName.trim(),
      estimatedMonthlyIncome: incomeVal,
      defaultMonthlySavingsGoal: goalVal,
      theme,
      currency: 'BRL'
    });

    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // Trigger import click
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupStatusMsg(null);
    try {
      const success = await onImportData(file);
      if (success) {
        setBackupStatusMsg({
          text: 'Dados importados com sucesso! O seu histórico financeiro foi restaurado.',
          type: 'success'
        });
      } else {
        setBackupStatusMsg({
          text: 'Falha ao auditar arquivo JSON de importação. Verifique se o formato está íntegro.',
          type: 'error'
        });
      }
    } catch {
      setBackupStatusMsg({
        text: 'Erro desconhecido ao processar o arquivo de backup.',
        type: 'error'
      });
    }

    // Reset input
    e.target.value = '';
    setTimeout(() => setBackupStatusMsg(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header text */}
      <div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-white">Configurações Gerais</h2>
        <p className="mt-1 text-xs text-gray-400">
          Personalize seus limites de referência e faça backup de seus dados locais de forma simples.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Card: Configuration inputs */}
        <form onSubmit={handleSaveSettings} className="rounded-2xl border border-dark-border bg-dark-card p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-gray-300 flex items-center gap-2 pb-2 border-b border-dark-border/40 mb-2">
            <User className="h-4 w-4 text-brand-primary" />
            Perfil e Limites Mensais
          </h3>

          {/* Validation Alert */}
          {validationError && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-xs text-red-200 flex items-center gap-2 animate-fade-in-down">
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Field: User Name */}
            <div className="space-y-1.5 animate-fade-in">
              <label htmlFor="settings-username" className="block text-xs font-semibold text-gray-400">Nome de Identificação</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="settings-username"
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-dark-border bg-dark-bg py-2.5 pl-9 pr-4 text-sm text-white focus:border-brand-primary focus:outline-none"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            {/* Field: Theme Select representation (simple toggle UI) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400">Visual do Tema</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-settings-theme-dark"
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                      : 'bg-dark-bg border-dark-border text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Escuro Premium
                </button>
                <button
                  id="btn-settings-theme-light"
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                    theme === 'light' 
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                      : 'bg-dark-bg border-dark-border text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Claro (Adaptado)
                </button>
              </div>
            </div>

            {/* Field: Estimated Income */}
            <div className="space-y-1.5">
              <label htmlFor="settings-income" className="block text-xs font-semibold text-gray-400">Renda Mensal Estimada (R$)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold text-xs select-none">
                  R$
                </span>
                <input
                  id="settings-income"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={estimatedIncome}
                  onChange={(e) => setEstimatedIncome(e.target.value)}
                  className="w-full rounded-xl border border-dark-border bg-dark-bg py-2.5 pl-9 pr-4 text-sm text-white focus:border-brand-primary focus:outline-none font-mono"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Field: Savings Goal Default */}
            <div className="space-y-1.5">
              <label htmlFor="settings-savings" className="block text-xs font-semibold text-gray-400">Objetivo de Poupança Padrão (R$)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold text-xs select-none">
                  R$
                </span>
                <input
                  id="settings-savings"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="w-full rounded-xl border border-dark-border bg-dark-bg py-2.5 pl-9 pr-4 text-sm text-white focus:border-brand-primary focus:outline-none font-mono"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-end pt-3 border-t border-dark-border/30">
            <button
              id="btn-settings-save"
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Check className="h-4 w-4" />
              Salvar Preferências
            </button>
            
            {saveStatus === 'success' && (
              <span className="text-xs text-success font-semibold flex items-center gap-1 ml-2 animate-pulse">
                ✓ Configurações gravadas!
              </span>
            )}
          </div>
        </form>

        {/* Card: Export, Backup and Restore controls */}
        <div className="rounded-2xl border border-dark-border bg-dark-card p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-gray-300 flex items-center gap-2 pb-2 border-b border-dark-border/40">
            <Download className="h-4 w-4 text-brand-primary" />
            Backup de Dados (JSON / Portabilidade)
          </h3>
          <p className="text-xs text-gray-400">
            Por funcionar inteiramente offline, suas finanças residem unicamente nesta máquina. Garanta a segurança de seus logs exportando backups periódicos.
          </p>

          {/* Backup Import status message */}
          {backupStatusMsg && (
            <div className={`rounded-xl border p-3.5 text-xs flex items-center gap-2 ${
              backupStatusMsg.type === 'success' 
                ? 'border-success/20 bg-success/10 text-emerald-200' 
                : 'border-danger/20 bg-danger/10 text-red-200'
            }`}>
              <AlertTriangle className={`h-4 w-4 shrink-0 ${backupStatusMsg.type === 'success' ? 'text-success' : 'text-danger'}`} />
              <span>{backupStatusMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            
            {/* Export trigger */}
            <button
              id="btn-settings-export"
              onClick={onExportData}
              className="flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-bg/50 px-4 py-3 text-xs font-bold text-gray-200 hover:bg-[#252a42] hover:text-white transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-brand-primary" />
              Exportar Arquivo de Backup (.json)
            </button>

            {/* Import Trigger wrapper */}
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-bg/50 px-4 py-3 text-xs font-bold text-gray-200 hover:bg-[#252a42] hover:text-white transition-colors cursor-pointer">
              <Upload className="h-4 w-4 text-brand-secondary" />
              <span>Importar Arquivo de Backup (.json)</span>
              <input
                id="file-input-backup"
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
              />
            </label>
            
          </div>
        </div>

        {/* Card: Danger zone destruction */}
        <div className="rounded-2xl border border-red-900/40 bg-red-950/5 p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-red-400 flex items-center gap-2 pb-2 border-b border-red-900/30">
            <ShieldAlert className="h-4.5 w-4.5 text-danger" />
            Zona de Segurança (Destruição)
          </h3>
          <p className="text-xs text-red-300/80 leading-relaxed">
            A ação abaixo é permanente. Ela apagará todas as transações, listas de dívidas recorrentes, metas de investimento e configurações salvas no navegador.
          </p>

          <div className="pt-2">
            <button
              id="btn-settings-factory-reset"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-danger/10 border border-danger/30 text-danger hover:bg-danger hover:text-white transition-all font-bold text-xs px-4 py-3 cursor-pointer active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Formatar Aplicativo (Limpar Todo Histórico)
            </button>
          </div>
        </div>

      </div>

      {/* Confirm modal for factory reset */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          onClearAllData();
          setBackupStatusMsg({
            text: 'Todos os logs e configurações do aplicativo foram eliminados e redefinidos para os valores padrão.',
            type: 'success'
          });
          setTimeout(() => setBackupStatusMsg(null), 5000);
        }}
        title="Formatar Aplicativo e Limpar Dados"
        message="ATENÇÃO TOTAL! Esta ação apagará permanentemente todas as suas movimentações financeiras, dívidas e metas acumuladas salvas no navegador. Deseja prosseguir?"
        confirmText="Sim, Formatar Tudo"
        cancelText="Não, Cancelar"
        variant="danger"
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  FolderLock, 
  Target, 
  BarChart, 
  Settings as SettingsIcon,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
  Menu
} from 'lucide-react';
import { Settings, Transaction } from '../types';
import { formatCurrency, calculateMonthlyTotals } from '../utils/finance';
import { User } from 'firebase/auth';
import { Cloud, CloudOff, LogOut } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  settings: Settings;
  transactions: Transaction[];
  selectedMonth: string;
  user: User | null;
  onLogout: () => void;
}

export default function Navigation({
  activeTab,
  onTabChange,
  settings,
  transactions,
  selectedMonth,
  user,
  onLogout
}: NavigationProps) {

  // Menu item structure
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Movimentações', icon: ArrowLeftRight },
    { id: 'debts', label: 'Dívidas', icon: FolderLock },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'reports', label: 'Relatórios', icon: BarChart },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon }
  ];

  // Calculate current active month balance to display in the Desktop Sidebar
  const totals = calculateMonthlyTotals(transactions, selectedMonth, settings.estimatedMonthlyIncome);

  return (
    <>
      {/* 1. Desktop Left Sidebar */}
      <aside 
        id="desktop-sidebar" 
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 border-r border-dark-border bg-dark-card flex-col justify-between z-30"
      >
        {/* Upper Sidebar Brand & Navigation Links */}
        <div className="p-6 space-y-6">
          {/* Logo / Title brand */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-tr from-brand-primary to-brand-secondary p-2.5 text-white shadow-md shadow-brand-primary/10">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-sm font-extrabold tracking-tight text-white uppercase leading-none">
                Meu Controle
              </h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Financeiro</span>
            </div>
          </div>

          {/* User Micro Info Card */}
          <div className="rounded-xl bg-dark-bg p-3 border border-dark-border/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Logado como</span>
              {user ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                  <Cloud className="h-2.5 w-2.5" /> Nuvem
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">
                  <CloudOff className="h-2.5 w-2.5" /> Local
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-white truncate block">
              {user ? (user.displayName || user.email) : settings.userName}
            </span>
            
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400 border-t border-dark-border/30 pt-2">
              <span>Balanço {selectedMonth.split('-')[1]}/26:</span>
              <span className={`font-mono font-bold ${totals.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(totals.balance)}
              </span>
            </div>
          </div>

          {/* Items link list */}
          <nav className="space-y-1.5 select-none">
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  id={`sidebar-tab-${item.id}`}
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10' 
                      : 'text-gray-400 hover:bg-[#1b1e2f]/50 hover:text-white'
                  }`}
                >
                  <IconComp className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Sidebar Settings Footer */}
        <div className="p-4 border-t border-dark-border/45 space-y-3 select-none text-center">
          {user ? (
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white py-2 px-3 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair da Conta Google</span>
            </button>
          ) : (
            <button
              id="sidebar-signin-btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white py-2 px-3 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Conectar à Nuvem</span>
            </button>
          )}
          <div className="text-[10px] text-gray-600 font-mono">
            <p>© 2026 Meu Controle</p>
            <p className="mt-0.5">Versão v1.1.0 Cloud</p>
          </div>
        </div>
      </aside>

      {/* 2. Top Header Utility for Mobile Panel view */}
      <header 
        id="mobile-utility-header" 
        className="md:hidden sticky top-0 left-0 right-0 h-16 border-b border-dark-border bg-dark-card flex items-center justify-between px-4 z-20"
      >
        <div className="flex items-center gap-2 max-w-[65%]">
          <div className="rounded-lg bg-linear-to-tr from-brand-primary to-brand-secondary p-1.5 text-white shrink-0">
            <PiggyBank className="h-4.5 w-4.5" />
          </div>
          <span className="font-display font-bold text-white text-sm truncate">Meu Controle</span>
          {user ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-medium text-emerald-400 shrink-0">
              Nuvem
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-medium text-amber-500 shrink-0">
              Local
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-fast-tab-settings-mob"
            onClick={() => onTabChange('settings')}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-dark-card-lighter hover:text-white cursor-pointer"
            title="Configurações"
          >
            <SettingsIcon className="h-4.5 w-4.5" />
          </button>
          <button
            id="btn-logout-mob"
            onClick={onLogout}
            className={`rounded-lg p-2 transition-colors cursor-pointer ${
              user ? 'text-red-400 hover:bg-[#1b1e2f]/50' : 'text-brand-primary hover:bg-[#1b1e2f]/50'
            }`}
            title={user ? 'Sair da Conta' : 'Conectar à Nuvem'}
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* 3. Mobile Sticky Bottom Tab Bar */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-dark-border bg-dark-card flex items-center justify-around px-2 z-30 select-none pb-safe"
      >
        {menuItems.slice(0, 5).map(item => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              id={`mob-bottom-tab-${item.id}`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors cursor-pointer ${
                isActive ? 'text-brand-primary' : 'text-gray-500'
              }`}
            >
              <IconComp className="h-5 w-5 mb-1" />
              <span className="text-[9px] font-bold tracking-tight truncate max-w-[65px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  googleProvider, 
  auth 
} from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { 
  TrendingUp, 
  Wallet, 
  Cloud, 
  ShieldCheck, 
  UserPlus, 
  AlertTriangle 
} from 'lucide-react';

interface LoginProps {
  onContinueOffline: () => void;
}

export default function Login({ onContinueOffline }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Erro de login no Firebase:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('O pop-up de login foi fechado antes da conclusão. Tente novamente.');
      } else {
        setError('Falha de login ou conexão com os serviços Firebase. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen-view" className="min-h-screen bg-dark-bg text-gray-200 flex flex-col justify-center items-center px-4 py-12">
      {/* Background radial accent flare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Branding Brand logo header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 p-3 text-brand-primary shadow-xl shadow-brand-primary/5">
            <Wallet className="h-9 w-9 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-medium tracking-tight text-white select-none">
              Meu Controle <span className="text-brand-primary">Financeiro</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1.5 font-sans">
              Gerencie seus lançamentos, dívidas e metas na nuvem
            </p>
          </div>
        </div>

        {/* Core explanation cards (bento columns list) */}
        <div className="bg-dark-card border border-dark-border/60 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/40">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-dark-border/40 pb-2.5">
            Recursos Disponíveis
          </h2>

          <div className="space-y-4">
            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-1.5 text-success shrink-0">
                <Cloud className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Armazenamento em Nuvem</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                  Seus dados financeiros são salvos de forma segura e sincronizados em tempo real.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-500/10 p-1.5 text-brand-secondary shrink-0">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Autenticação Segura</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                  Acesse instantaneamente usando sua Conta Google com um único clique.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-1.5 text-brand-primary shrink-0">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Gestão Financeira Completa</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                  Fluxo de caixa completo, cálculo automático de saldos e controle de metas poupadas.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-xs text-red-200 flex items-center gap-2 animate-fade-in-down">
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
              <span>{error}</span>
            </div>
          )}

          {/* Action trigger group */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-4 shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  {/* Custom inline Google icon */}
                  <svg className="h-4.5 w-4.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Entrar com o Google</span>
                </>
              )}
            </button>

            <button
              onClick={onContinueOffline}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-dark-bg border border-dark-border py-3 px-4 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Continuar sem cadastro (Modo Local)</span>
            </button>
          </div>
        </div>

        {/* Footer info text */}
        <div className="text-center">
          <p className="text-[11px] text-gray-500">
            Meu Controle Financeiro — Proteção e transparência para o seu saldo.
          </p>
        </div>
      </div>
    </div>
  );
}

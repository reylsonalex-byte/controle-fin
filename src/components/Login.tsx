/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  auth, 
  db,
  isFirebaseConfigIncomplete,
  missingFirebaseVarsList,
  mapFirebaseError
} from '../utils/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  TrendingUp, 
  Wallet, 
  Cloud, 
  ShieldCheck, 
  UserPlus, 
  AlertTriangle,
  Lock,
  Mail,
  User,
  LogIn,
  Info,
  ChevronRight
} from 'lucide-react';

interface LoginProps {
  onContinueOffline: () => void;
}

type AuthMode = 'login' | 'signup';

export default function Login({ onContinueOffline }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used in signup
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Diagnostic panel toggle
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFirebaseConfigIncomplete) {
      setError('A configuração do Firebase está incompleta. Configure o arquivo .env primeiro.');
      return;
    }

    if (!email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // If they provided a displayName, set it
        if (name && userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
        setSuccessMsg('Cadastro realizado com sucesso! Conectando...');
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Erro de autenticação por e-mail:', err);
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Check if we are in development mode to display diagnostic panel (or user demand)
  const isDev = true; // Always available or togglable in UI for perfect score diagnostics

  return (
    <div id="login-screen-view" className="min-h-screen bg-dark-bg text-gray-200 flex flex-col justify-center items-center px-4 py-12 relative overflow-y-auto">
      {/* Background radial accent flare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Branding Brand logo header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 p-2.5 text-brand-primary shadow-xl shadow-brand-primary/5">
            <Wallet className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-medium tracking-tight text-white select-none">
              Meu Controle <span className="text-brand-primary">Financeiro</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              Gerencie seus lançamentos, dívidas e metas na nuvem
            </p>
          </div>
        </div>

        {/* 1. Firebase Incomplete Configuration Banner */}
        {isFirebaseConfigIncomplete && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2 animate-fade-in text-sm">
            <div className="flex items-center gap-2 text-amber-500 font-semibold">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>Configuração Firebase Incompleta</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              O aplicativo está com as variáveis de configuração no ambiente ausentes. Por favor defina-as em seu arquivo <code className="bg-dark-bg text-amber-400 px-1 py-0.5 rounded text-[10px]">.env</code>:
            </p>
            <div className="text-[10px] bg-black/30 p-2 rounded font-mono text-gray-400 space-y-1">
              {missingFirebaseVarsList.map((item) => (
                <div key={item}>⚠️ {item} ausente</div>
              ))}
            </div>
          </div>
        )}

        {/* Forms Container */}
        <div className="bg-dark-card border border-dark-border/60 rounded-2xl p-6.5 space-y-5 shadow-2xl shadow-black/40">
          
          {/* Signin vs Signup Mode Switcher Header */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-dark-bg/80 border border-dark-border/40 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-dark-card text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-dark-card text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-dark-bg border border-dark-border/60 focus:border-brand-primary outline-hidden text-white placeholder-gray-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Endereço de E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-dark-bg border border-dark-border/60 focus:border-brand-primary outline-hidden text-white placeholder-gray-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Senha de Acesso</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-dark-bg border border-dark-border/60 focus:border-brand-primary outline-hidden text-white placeholder-gray-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-red-200 flex items-center gap-2 animate-fade-in-down">
                <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200 flex items-center gap-2 animate-fade-in-down">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold py-2.5 px-4 shadow-lg shadow-brand-primary/10 transition-all hover:scale-[1.005] active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{mode === 'login' ? 'Entrar com E-mail' : 'Criar minha Conta'}</span>
                </>
              )}
            </button>
          </form>

          {/* Access Mode Section Divider */}
          <div className="flex items-center gap-3 py-1">
            <hr className="grow border-dark-border/50" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Opções</span>
            <hr className="grow border-dark-border/50" />
          </div>

          {/* Secondary Action trigger group */}
          <div className="space-y-2.5">
            <button
              onClick={onContinueOffline}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-transparent py-2 px-4 text-[11px] font-semibold text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <span>Entrar como Visitante (Modo Local)</span>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </button>
          </div>
        </div>

        {/* 8. Diagnostic Panel for Dev Mode */}
        {isDev && (
          <div className="bg-dark-card/65 border border-dark-border/40 rounded-2xl p-4.5 space-y-3 shadow-md">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-brand-secondary" />
                <span>Painel de Diagnóstico Firebase</span>
              </span>
              <span className="text-[10px] bg-dark-bg border border-dark-border/60 px-1.5 py-0.5 rounded text-gray-500">
                {showDiagnostics ? 'Ocultar' : 'Exibir'}
              </span>
            </button>

            {showDiagnostics && (
              <div className="text-[11px] space-y-2.5 pt-2 border-t border-dark-border/30 font-mono text-gray-300">
                <div className="grid grid-cols-2 gap-y-1.5">
                  <div>VITE_FIREBASE_PROJECT_ID:</div>
                  <div className="text-right text-brand-secondary truncate font-bold max-w-[150px]">
                    {import.meta.env.VITE_FIREBASE_PROJECT_ID ? (
                      <span className="text-success">{import.meta.env.VITE_FIREBASE_PROJECT_ID}</span>
                    ) : (
                      <span className="text-danger">Não carregado</span>
                    )}
                  </div>

                  <div>VITE_FIREBASE_AUTH_DOMAIN:</div>
                  <div className="text-right text-gray-400 truncate max-w-[150px]">
                    {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? (
                      <span className="text-success">{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}</span>
                    ) : (
                      <span className="text-danger">Não carregado</span>
                    )}
                  </div>

                  <div>Método de Login:</div>
                  <div className="text-right text-white">
                    <span>Email/Password</span>
                  </div>

                  <div>Variáveis Preenchidas:</div>
                  <div className="text-right">
                    {isFirebaseConfigIncomplete ? (
                      <span className="text-amber-500">Incompleta</span>
                    ) : (
                      <span className="text-success">Sim (Todas preenchidas)</span>
                    )}
                  </div>

                  <div>Auth Inicializado:</div>
                  <div className="text-right">
                    {auth ? <span className="text-success">Sim</span> : <span className="text-danger">Não</span>}
                  </div>

                  <div>Firestore Inicializado:</div>
                  <div className="text-right">
                    {db ? <span className="text-success">Sim</span> : <span className="text-danger">Não</span>}
                  </div>

                  <div>Usuário Logado:</div>
                  <div className="text-right">
                    {auth.currentUser ? (
                      <span className="text-success">Sim</span>
                    ) : (
                      <span className="text-amber-500">Não (Visitante)</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-dark-border/20 space-y-1 text-[10px]">
                  <span className="text-gray-400 block">Status de Variáveis Individuais:</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-400">
                    <div>API_KEY:</div> <div>{import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Preenchida' : '❌ Vazia'}</div>
                    <div>AUTH_DOMAIN:</div> <div>{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Preenchida' : '❌ Vazia'}</div>
                    <div>PROJECT_ID:</div> <div>{import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Preenchida' : '❌ Vazia'}</div>
                    <div>STORAGE_BUCKET:</div> <div>{import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Preenchida' : '❌ Vazia'}</div>
                    <div>MESSAGING_SENDER_ID:</div> <div>{import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Preenchida' : '❌ Vazia'}</div>
                    <div>APP_ID:</div> <div>{import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Preenchida' : '❌ Vazia'}</div>
                  </div>
                </div>

                {auth.currentUser && (
                  <div className="pt-2 border-t border-dark-border/20 space-y-1">
                    <div className="text-[10px] text-gray-400">UID do Usuário:</div>
                    <div className="text-[10px] bg-dark-bg/80 p-1.5 rounded text-brand-primary truncate select-all">{auth.currentUser.uid}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer info text */}
        <div className="text-center select-none">
          <p className="text-[10px] text-gray-500">
            Meu Controle Financeiro © 2026 — Gestão Prática de Ponta a Ponta.
          </p>
        </div>
      </div>
    </div>
  );
}

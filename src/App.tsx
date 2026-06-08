/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  Debt, 
  Goal, 
  Settings, 
  DEFAULT_SETTINGS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_DEBTS, 
  INITIAL_GOALS 
} from './types';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/finance';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import Goals from './components/Goals';
import Reports from './components/Reports';
import SettingsPage from './components/SettingsPage';

import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import DebtForm from './components/DebtForm';
import GoalForm from './components/GoalForm';

// Firebase core packages
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './utils/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import Login from './components/Login';
import { Wallet } from 'lucide-react';

export default function App() {
  // 1. Authentication and authorization states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bypassAuth, setBypassAuth] = useState<boolean>(() => 
    localStorage.getItem('mcf_bypass_auth') === 'true'
  );

  // 2. Core financial store states
  const [settings, setSettings] = useState<Settings>(() => 
    loadFromLocalStorage<Settings>('mcf_settings', DEFAULT_SETTINGS)
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    loadFromLocalStorage<Transaction[]>('mcf_transactions', INITIAL_TRANSACTIONS)
  );

  const [debts, setDebts] = useState<Debt[]>(() => 
    loadFromLocalStorage<Debt[]>('mcf_debts', INITIAL_DEBTS)
  );

  const [goals, setGoals] = useState<Goal[]>(() => 
    loadFromLocalStorage<Goal[]>('mcf_goals', INITIAL_GOALS)
  );

  // 3. Navigation / presentation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Default selectedMonth to today's month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().substring(0, 7); // Returns "2026-06"
  });

  // 4. Modal open / close handlers
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Unique offline ID generator
  const generateUniqueId = (prefix: string) => {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  };

  // ==========================================
  // SYNC LOCAL DATA TO CLOUD UPON LOGGING IN (ONE-TIME RUN)
  // ==========================================
  const syncLocalToCloud = async (currentUid: string) => {
    try {
      const localTx = loadFromLocalStorage<Transaction[]>('mcf_transactions', INITIAL_TRANSACTIONS);
      const localDebts = loadFromLocalStorage<Debt[]>('mcf_debts', INITIAL_DEBTS);
      const localGoals = loadFromLocalStorage<Goal[]>('mcf_goals', INITIAL_GOALS);
      const localSettings = loadFromLocalStorage<Settings>('mcf_settings', DEFAULT_SETTINGS);

      // We only upload if the server collection is pristine/empty
      const txColRef = collection(db, 'users', currentUid, 'transactions');
      const snap = await getDocs(txColRef);
      if (snap.empty) {
        console.log("Sincronizando dados locais com o Firebase...");
        
        // Settings doc
        const settingsDocPath = doc(db, 'users', currentUid, 'settings', 'profile');
        await setDoc(settingsDocPath, {
          displayName: localSettings.userName,
          estimatedMonthlyIncome: Number(localSettings.estimatedMonthlyIncome),
          defaultSavingsGoal: Number(localSettings.defaultMonthlySavingsGoal),
          theme: localSettings.theme,
          currency: localSettings.currency || 'BRL',
          userId: currentUid,
          updatedAt: new Date().toISOString()
        });

        // Transactions
        for (const t of localTx) {
          const docRef = doc(db, 'users', currentUid, 'transactions', t.id);
          await setDoc(docRef, { ...t, userId: currentUid, createdAt: new Date().toISOString() });
        }

        // Debts
        for (const d of localDebts) {
          const docRef = doc(db, 'users', currentUid, 'debts', d.id);
          await setDoc(docRef, { ...d, userId: currentUid, createdAt: new Date().toISOString() });
        }

        // Goals
        for (const g of localGoals) {
          const docRef = doc(db, 'users', currentUid, 'goals', g.id);
          await setDoc(docRef, { ...g, userId: currentUid, createdAt: new Date().toISOString() });
        }
      }
    } catch (e) {
      console.error("Falha ao migrar dados para a nuvem:", e);
    }
  };

  // ==========================================
  // AUTHENTICATION EFFECT
  // ==========================================
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setBypassAuth(false);
        localStorage.removeItem('mcf_bypass_auth');
        // Trigger one-time local storage to cloud migration if needed
        await syncLocalToCloud(currentUser.uid);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // ==========================================
  // CLOUD STORAGE REALTIME SUBSCRIBERS
  // ==========================================
  useEffect(() => {
    if (!user) return;

    // 1. Settings Doc Snapshot Listener
    const settingsDocPath = `users/${user.uid}/settings/profile`;
    const unsubscribeSettings = onSnapshot(doc(db, settingsDocPath), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSettings({
          userName: data?.displayName || data?.userName || '',
          estimatedMonthlyIncome: Number(data?.estimatedMonthlyIncome !== undefined ? data.estimatedMonthlyIncome : DEFAULT_SETTINGS.estimatedMonthlyIncome),
          defaultMonthlySavingsGoal: Number(data?.defaultSavingsGoal !== undefined ? data.defaultSavingsGoal : (data?.defaultMonthlySavingsGoal !== undefined ? data.defaultMonthlySavingsGoal : DEFAULT_SETTINGS.defaultMonthlySavingsGoal)),
          theme: data?.theme || 'dark',
          currency: data?.currency || 'BRL'
        });
      } else {
        // Doc doesn't exist yet, establish with defaults
        const initialSettings = {
          displayName: settings.userName,
          estimatedMonthlyIncome: Number(settings.estimatedMonthlyIncome),
          defaultSavingsGoal: Number(settings.defaultMonthlySavingsGoal),
          theme: settings.theme,
          currency: settings.currency || 'BRL',
          userId: user.uid,
          updatedAt: new Date().toISOString()
        };
        setDoc(doc(db, settingsDocPath), initialSettings).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, settingsDocPath);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, settingsDocPath);
    });

    // 2. Transactions Collection Listener
    const transactionsPath = `users/${user.uid}/transactions`;
    const unsubscribeTransactions = onSnapshot(collection(db, transactionsPath), (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Transaction);
      });
      // Sort items down by date desc
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, transactionsPath);
    });

    // 3. Debts Collection Listener
    const debtsPath = `users/${user.uid}/debts`;
    const unsubscribeDebts = onSnapshot(collection(db, debtsPath), (snapshot) => {
      const items: Debt[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Debt);
      });
      setDebts(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, debtsPath);
    });

    // 4. Goals Collection Listener
    const goalsPath = `users/${user.uid}/goals`;
    const unsubscribeGoals = onSnapshot(collection(db, goalsPath), (snapshot) => {
      const items: Goal[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Goal);
      });
      setGoals(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, goalsPath);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeTransactions();
      unsubscribeDebts();
      unsubscribeGoals();
    };
  }, [user]);

  // ==========================================
  // OFFLINE BACKUP SYNC TO LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    // Save to local cache even in cloud mode for resilience
    saveToLocalStorage('mcf_settings', settings);
  }, [settings]);

  useEffect(() => {
    saveToLocalStorage('mcf_transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveToLocalStorage('mcf_debts', debts);
  }, [debts]);

  useEffect(() => {
    saveToLocalStorage('mcf_goals', goals);
  }, [goals]);

  // ==========================================
  // TRANSACTION CALLBACK HANDLERS
  // ==========================================
  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    const id = generateUniqueId('tx');
    const transactionRecord: Transaction = {
      ...newT,
      id
    };

    if (user) {
      const docPath = `users/${user.uid}/transactions/${id}`;
      try {
        await setDoc(doc(db, docPath), { ...transactionRecord, userId: user.uid, createdAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setTransactions(prev => [transactionRecord, ...prev]);
    }
    setIsTransactionModalOpen(false);
  };

  const handleEditTransactionSubmit = async (updatedT: Omit<Transaction, 'id'>) => {
    if (!editingTransaction) return;
    const id = editingTransaction.id;
    const transactionRecord = { ...editingTransaction, ...updatedT };

    if (user) {
      const docPath = `users/${user.uid}/transactions/${id}`;
      try {
        await setDoc(doc(db, docPath), { ...transactionRecord, userId: user.uid, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedT } : t));
    }
    setEditingTransaction(null);
    setIsTransactionModalOpen(false);
  };

  const handleEditTransactionRequest = (target: Transaction) => {
    setEditingTransaction(target);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      const docPath = `users/${user.uid}/transactions/${id}`;
      try {
        await deleteDoc(doc(db, docPath));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // ==========================================
  // DEBT CALLBACK HANDLERS
  // ==========================================
  const handleAddDebt = async (newD: Omit<Debt, 'id'>) => {
    const id = generateUniqueId('db');
    const debtRecord: Debt = {
      ...newD,
      id
    };

    if (user) {
      const docPath = `users/${user.uid}/debts/${id}`;
      try {
        await setDoc(doc(db, docPath), { ...debtRecord, userId: user.uid, createdAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setDebts(prev => [...prev, debtRecord]);
    }
    setIsDebtModalOpen(false);
  };

  const handleEditDebtSubmit = async (updatedD: Omit<Debt, 'id'> | Partial<Debt>) => {
    const id = editingDebt?.id;
    if (!id) return;
    const debtRecord = { ...editingDebt, ...updatedD } as Debt;

    if (user) {
      const docPath = `users/${user.uid}/debts/${id}`;
      try {
        await setDoc(doc(db, docPath), { ...debtRecord, userId: user.uid, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updatedD } : d));
    }
    setEditingDebt(null);
    setIsDebtModalOpen(false);
  };

  const handleQuickEditDebtInline = async (id: string, updatedParams: Partial<Debt>) => {
    if (user) {
      const docPath = `users/${user.uid}/debts/${id}`;
      try {
        const existingItem = debts.find(d => d.id === id);
        if (existingItem) {
          const debtRecord = { ...existingItem, ...updatedParams };
          await setDoc(doc(db, docPath), { ...debtRecord, userId: user.uid, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updatedParams } : d));
    }
  };

  const handleEditDebtRequest = (target: Debt) => {
    setEditingDebt(target);
    setIsDebtModalOpen(true);
  };

  const handleDeleteDebt = async (id: string) => {
    if (user) {
      const docPath = `users/${user.uid}/debts/${id}`;
      try {
        await deleteDoc(doc(db, docPath));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  // ==========================================
  // GOALS CALLBACK HANDLERS
  // ==========================================
  const handleAddGoal = async (newG: Omit<Goal, 'id'>) => {
    const id = generateUniqueId('gl');
    const goalRecord: Goal = {
      ...newG,
      id
    };

    if (user) {
      const docPath = `users/${user.uid}/goals/${id}`;
      try {
        await setDoc(doc(db, docPath), { ...goalRecord, userId: user.uid, createdAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setGoals(prev => [...prev, goalRecord]);
    }
    setIsGoalModalOpen(false);
  };

  const handleEditGoalSubmit = async (updatedG: Omit<Goal, 'id'> | Partial<Goal>) => {
    const id = editingGoal?.id;
    if (!id) return;
    const goalRecord = { ...editingGoal, ...updatedG } as Goal;

    if (user) {
      const docPath = `users/${user.uid}/goals/${id}`;
      try {
        await setDoc(doc(db, docPath), { ...goalRecord, userId: user.uid, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedG } : g));
    }
    setEditingGoal(null);
    setIsGoalModalOpen(false);
  };

  const handleQuickEditGoalInline = async (id: string, updatedParams: Partial<Goal>) => {
    if (user) {
      const docPath = `users/${user.uid}/goals/${id}`;
      try {
        const existingItem = goals.find(g => g.id === id);
        if (existingItem) {
          const goalRecord = { ...existingItem, ...updatedParams };
          await setDoc(doc(db, docPath), { ...goalRecord, userId: user.uid, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedParams } : g));
    }
  };

  const handleEditGoalRequest = (target: Goal) => {
    setEditingGoal(target);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = async (id: string) => {
    if (user) {
      const docPath = `users/${user.uid}/goals/${id}`;
      try {
        await deleteDoc(doc(db, docPath));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  // ==========================================
  // SYSTEM SETTINGS & BACKUP ACTIONS
  // ==========================================
  const handleUpdateSettings = async (newSettings: Settings) => {
    if (user) {
      const docPath = `users/${user.uid}/settings/profile`;
      try {
        await setDoc(doc(db, docPath), {
          displayName: newSettings.userName,
          estimatedMonthlyIncome: Number(newSettings.estimatedMonthlyIncome),
          defaultSavingsGoal: Number(newSettings.defaultMonthlySavingsGoal),
          theme: newSettings.theme,
          currency: newSettings.currency || 'BRL',
          userId: user.uid,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setSettings(newSettings);
    }
  };

  const handleExportDataBackup = () => {
    const payload = {
      transactions,
      debts,
      goals,
      settings,
      exportedAt: new Date().toISOString(),
      origin: 'Meu Controle Financeiro'
    };
    const contentBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const localUrl = URL.createObjectURL(contentBlob);
    
    const trigger = document.createElement('a');
    trigger.href = localUrl;
    trigger.download = `backup_meu_controle_financeiro_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
    URL.revokeObjectURL(localUrl);
  };

  const handleImportDataBackup = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const rawText = e.target?.result as string;
          const parsed = JSON.parse(rawText);

          // Basic scheme inspection
          if (parsed && typeof parsed === 'object') {
            if (
              Array.isArray(parsed.transactions) &&
              Array.isArray(parsed.debts) &&
              Array.isArray(parsed.goals) &&
              parsed.settings
            ) {
              if (user) {
                // If cloud is active, upload imported entities to database
                for (const t of parsed.transactions) {
                  const docPath = `users/${user.uid}/transactions/${t.id}`;
                  await setDoc(doc(db, docPath), { ...t, userId: user.uid });
                }
                for (const d of parsed.debts) {
                  const docPath = `users/${user.uid}/debts/${d.id}`;
                  await setDoc(doc(db, docPath), { ...d, userId: user.uid });
                }
                for (const g of parsed.goals) {
                  const docPath = `users/${user.uid}/goals/${g.id}`;
                  await setDoc(doc(db, docPath), { ...g, userId: user.uid });
                }
                const settingsDocPath = `users/${user.uid}/settings/profile`;
                await setDoc(doc(db, settingsDocPath), {
                  displayName: parsed.settings.userName || parsed.settings.displayName || '',
                  estimatedMonthlyIncome: Number(parsed.settings.estimatedMonthlyIncome !== undefined ? parsed.settings.estimatedMonthlyIncome : DEFAULT_SETTINGS.estimatedMonthlyIncome),
                  defaultSavingsGoal: Number(parsed.settings.defaultSavingsGoal !== undefined ? parsed.settings.defaultSavingsGoal : (parsed.settings.defaultMonthlySavingsGoal !== undefined ? parsed.settings.defaultMonthlySavingsGoal : DEFAULT_SETTINGS.defaultMonthlySavingsGoal)),
                  theme: parsed.settings.theme || 'dark',
                  currency: parsed.settings.currency || 'BRL',
                  userId: user.uid,
                  updatedAt: new Date().toISOString()
                });
              } else {
                // local fallback
                setTransactions(parsed.transactions);
                setDebts(parsed.debts);
                setGoals(parsed.goals);
                setSettings(parsed.settings);
              }
              resolve(true);
              return;
            }
          }
          resolve(false);
        } catch (error) {
          console.error('Falha de decodificação do dump do JSON:', error);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  const handleClearAllAppData = async () => {
    if (user) {
      try {
        // Delete Settings Config
        await deleteDoc(doc(db, 'users', user.uid, 'settings', 'profile'));

        // Delete Transactions
        const txSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
        for (const docItem of txSnap.docs) {
          await deleteDoc(docItem.ref);
        }

        // Delete Debts
        const debtSnap = await getDocs(collection(db, 'users', user.uid, 'debts'));
        for (const docItem of debtSnap.docs) {
          await deleteDoc(docItem.ref);
        }

        // Delete Goals
        const goalSnap = await getDocs(collection(db, 'users', user.uid, 'goals'));
        for (const docItem of goalSnap.docs) {
          await deleteDoc(docItem.ref);
        }
      } catch (err) {
        console.error("Erro ao limpar dados do Firebase:", err);
      }
    } else {
      // Purges local cache
      setTransactions([]);
      setDebts([]);
      setGoals([]);
      setSettings(DEFAULT_SETTINGS);
      
      localStorage.removeItem('mcf_transactions');
      localStorage.removeItem('mcf_debts');
      localStorage.removeItem('mcf_goals');
      localStorage.removeItem('mcf_settings');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Erro ao efetuar log out:', err);
    }
    setBypassAuth(false);
    localStorage.removeItem('mcf_bypass_auth');
  };

  // ==========================================
  // INITIAL LOAD / RENDERING CONTROLLERS
  // ==========================================
  if (authLoading) {
    return (
      <div id="auth-loading-spinner" className="min-h-screen bg-dark-bg text-gray-200 flex flex-col justify-center items-center gap-3">
        <div className="h-10 w-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">Acessando Banco de Dados...</span>
      </div>
    );
  }

  // If user is not authenticated and hasn't requested offline mode bypass
  if (!user && !bypassAuth) {
    return (
      <Login 
        onContinueOffline={() => {
          setBypassAuth(true);
          localStorage.setItem('mcf_bypass_auth', 'true');
        }} 
      />
    );
  }

  return (
    <div id="application-container" className="min-h-screen bg-dark-bg text-gray-200">
      {/* Universal Navigation System */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        settings={settings}
        transactions={transactions}
        selectedMonth={selectedMonth}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Panel Frame Section */}
      <main 
        id="control-canvas-panel" 
        className="pb-24 pt-4 px-4 md:pl-[17.5rem] md:pr-6 md:py-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in"
      >
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            debts={debts}
            goals={goals}
            settings={settings}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onAddTransactionClick={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onAddDebtClick={() => {
              setEditingDebt(null);
              setIsDebtModalOpen(true);
            }}
            onTabChange={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <Transactions
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onOpenEditModal={handleEditTransactionRequest}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'debts' && (
          <Debts
            debts={debts}
            onAddDebt={handleAddDebt}
            onEditDebt={handleQuickEditDebtInline}
            onDeleteDebt={handleDeleteDebt}
            onOpenAddModal={() => {
              setEditingDebt(null);
              setIsDebtModalOpen(true);
            }}
            onOpenEditModal={handleEditDebtRequest}
          />
        )}

        {activeTab === 'goals' && (
          <Goals
            goals={goals}
            onAddGoal={handleAddGoal}
            onEditGoal={handleQuickEditGoalInline}
            onDeleteGoal={handleDeleteGoal}
            onOpenAddModal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onOpenEditModal={handleEditGoalRequest}
          />
        )}

        {activeTab === 'reports' && (
          <Reports
            transactions={transactions}
            settings={settings}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportDataBackup}
            onImportData={handleImportDataBackup}
            onClearAllData={handleClearAllAppData}
          />
        )}
      </main>

      {/* ========================================================== */}
      {/* DIALOG POPUP MODALS IN REUSABLE FORM DESIGN */}
      {/* ========================================================== */}
      
      {/* Modal 1: Transactions Register/Edit */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Editar Movimentação' : 'Nova Movimentação Comercial'}
      >
        <TransactionForm
          initialData={editingTransaction}
          onSubmit={editingTransaction ? handleEditTransactionSubmit : handleAddTransaction}
          onCancel={() => {
            setIsTransactionModalOpen(false);
            setEditingTransaction(null);
          }}
        />
      </Modal>

      {/* Modal 2: Debts Register/Edit */}
      <Modal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
        }}
        title={editingDebt ? 'Editar Detalhes do Débito' : 'Nova Conta / Dívida Pendente'}
      >
        <DebtForm
          initialData={editingDebt}
          onSubmit={editingDebt ? handleEditDebtSubmit : handleAddDebt}
          onCancel={() => {
            setIsDebtModalOpen(false);
            setEditingDebt(null);
          }}
        />
      </Modal>

      {/* Modal 3: Goals Register/Edit */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? 'Editar Meta Poupada' : 'Novo Alvo de Economia'}
      >
        <GoalForm
          initialData={editingGoal}
          onSubmit={editingGoal ? handleEditGoalSubmit : handleAddGoal}
          onCancel={() => {
            setIsGoalModalOpen(false);
            setEditingGoal(null);
          }}
        />
      </Modal>
    </div>
  );
}

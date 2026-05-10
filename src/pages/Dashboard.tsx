import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExpenseService, Expense } from '../lib/ExpenseService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  PieChart as PieChartIcon, 
  History,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowRight,
  Rocket
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { BeamsBackground } from '../components/ui/beams-background';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Others'];
const CAT_COLORS: Record<string, string> = {
  'Food & Dining': '#f87171',
  'Transport': '#60a5fa',
  'Shopping': '#fbbf24',
  'Bills': '#34d399',
  'Entertainment': '#a78bfa',
  'Health': '#f472b6',
  'Travel': '#fb923c',
  'Others': '#94a3b8'
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  const [bulkRows, setBulkRows] = useState([{ id: Date.now(), name: '', amount: '', category: 'Food & Dining' }]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, month]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await ExpenseService.getExpenses(user!.uid, month);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount_omr), 0);
  }, [expenses]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount_omr);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const chartData = {
    labels: byCategory.map(c => c.name),
    datasets: [
      {
        data: byCategory.map(c => c.value),
        backgroundColor: byCategory.map(c => CAT_COLORS[c.name] || '#94a3b8'),
        borderWidth: 0,
      },
    ],
  };

  const handleAddRow = () => {
    setBulkRows([...bulkRows, { id: Date.now(), name: '', amount: '', category: 'Food & Dining' }]);
  };

  const handleRemoveRow = (id: number) => {
    if (bulkRows.length > 1) {
      setBulkRows(bulkRows.filter(r => r.id !== id));
    }
  };

  const handleUpdateRow = (id: number, field: string, value: string) => {
    setBulkRows(bulkRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmitBulk = async () => {
    const validRows = bulkRows.filter(r => r.name.trim() && r.amount && Number(r.amount) > 0);
    if (validRows.length === 0) return;

    try {
      const newExpenses = validRows.map(r => ({
        user_id: user!.uid,
        name: r.name.trim(),
        amount_omr: Number(r.amount),
        category: r.category,
        currency_code: 'OMR',
        month: month,
      }));

      await ExpenseService.addExpenses(newExpenses);
      setBulkRows([{ id: Date.now(), name: '', amount: '', category: 'Food & Dining' }]);
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expenses:", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await ExpenseService.deleteExpense(id);
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 selection:text-blue-200">
      <BeamsBackground className="opacity-40" />
      
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Expensio</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Personal Finance Node</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
             <Calendar className="w-4 h-4 text-blue-400" />
             <input 
              type="month" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-bold focus:outline-none cursor-pointer text-white"
             />
          </div>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-xs transition-all uppercase tracking-widest border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet className="w-12 h-12" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Total Monthly Spending</p>
              <h2 className="text-3xl font-black tracking-tighter">
                {totalSpending.toFixed(3)} <span className="text-sm text-slate-500">OMR</span>
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-[10px] font-bold">
                  <TrendingUp className="w-3 h-3 inline mr-1" /> Tracking
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Daily Average</p>
              <h2 className="text-3xl font-black tracking-tighter">
                {(totalSpending / 30).toFixed(3)} <span className="text-sm text-slate-500">OMR</span>
              </h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Transactions</p>
              <h2 className="text-3xl font-black tracking-tighter">
                {expenses.length} <span className="text-sm text-slate-500">Items</span>
              </h2>
            </motion.div>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Quick Register Expenses</h3>
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                {bulkRows.length} Row{bulkRows.length > 1 ? 's' : ''} Active
              </div>
            </div>

            <div className="space-y-4">
              {bulkRows.map((row) => (
                <motion.div 
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-5">
                    <input 
                      type="text" 
                      placeholder="Expense Name (e.g. Starbucks)"
                      value={row.name}
                      onChange={(e) => handleUpdateRow(row.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm font-medium text-white"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input 
                      type="number" 
                      placeholder="0.000"
                      value={row.amount}
                      onChange={(e) => handleUpdateRow(row.id, 'amount', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm font-bold font-mono text-white"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select 
                      value={row.category}
                      onChange={(e) => handleUpdateRow(row.id, 'category', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm font-bold text-white"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    <button 
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
              <button 
                onClick={handleAddRow}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
              
              <button 
                onClick={handleSubmitBulk}
                className="flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
              >
                Sync Data <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <History className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Transaction History</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{month}</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-40">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs uppercase tracking-widest">Accessing Ledger...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
                    <History className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold">No records found for this period.</p>
                  <p className="text-sm">Initiate your first transaction above.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <AnimatePresence mode="popLayout">
                    {expenses.map((e) => (
                      <motion.div 
                        key={e.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm" style={{ backgroundColor: `${CAT_COLORS[e.category] || '#94a3b8'}20`, color: CAT_COLORS[e.category] }}>
                            {e.category.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{e.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{e.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-black text-sm tracking-tighter">-{Number(e.amount_omr).toFixed(3)}</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">OMR</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteExpense(e.id)}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <PieChartIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold">Expense Analytics</h3>
            </div>
            
            <div className="relative aspect-square max-w-[280px] mx-auto mb-8">
              {expenses.length > 0 ? (
                <Doughnut 
                  data={chartData} 
                  options={{
                    cutout: '75%',
                    plugins: {
                      legend: { display: false },
                    },
                    responsive: true,
                    maintainAspectRatio: true,
                  }} 
                />
              ) : (
                <div className="w-full h-full border-4 border-dashed border-white/5 rounded-full flex flex-col items-center justify-center opacity-20">
                  <PieChartIcon className="w-12 h-12 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">No Data</span>
                </div>
              )}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Spent</p>
                <p className="text-2xl font-black tracking-tighter">{totalSpending.toFixed(2)}</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase">OMR</p>
              </div>
            </div>

            <div className="space-y-4">
              {byCategory.map(c => {
                const color = CAT_COLORS[c.name] || '#94a3b8';
                const pct = totalSpending ? Math.round((c.value / totalSpending) * 100) : 0;
                return (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-slate-400 uppercase tracking-tight">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span>{c.value.toFixed(2)} OMR</span>
                         <span className="text-slate-600">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <Rocket className="w-24 h-24 text-white" />
            </div>
            <h4 className="text-white font-bold text-xl mb-2 relative z-10">Financial Health</h4>
            <p className="text-blue-100/70 text-sm mb-6 relative z-10 leading-relaxed">
              Based on your spending in <span className="text-white font-bold">{format(new Date(month + '-01'), 'MMMM')}</span>, you are tracking <span className="bg-white/20 px-2 py-0.5 rounded-lg text-white font-bold italic">within budget</span>.
            </p>
            <button className="w-full py-4 bg-white text-blue-700 font-black rounded-2xl text-sm transition-all hover:shadow-2xl active:scale-[0.98] relative z-10">
              Download Report
            </button>
          </div>

        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full px-8 py-4 flex items-center justify-center opacity-30 pointer-events-none">
        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.5em] text-slate-500">
          Node_Status: Online | Protocol: InsForge_Secure_DB | Latency: 14ms
        </p>
      </footer>
    </div>
  );
}

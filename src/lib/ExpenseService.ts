import { insforge } from './insforge';

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount_omr: number;
  category: string;
  currency_code: string;
  month: string;
  created_at: string;
}

export const ExpenseService = {
  async getExpenses(userId: string, month: string) {
    const { data, error } = await insforge.database
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Expense[];
  },

  async addExpenses(expenses: Omit<Expense, 'id' | 'created_at'>[]) {
    const { data, error } = await insforge.database
      .from('expenses')
      .insert(expenses)
      .select();
    
    if (error) throw error;
    return data as Expense[];
  },

  async updateExpense(id: string, updates: Partial<Expense>) {
    const { data, error } = await insforge.database
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Expense;
  },

  async deleteExpense(id: string) {
    const { error } = await insforge.database
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

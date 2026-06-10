import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Expense, BankMovement } from '@/types';
import { mockDb } from './mockData';

export const expensesService = {
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return mockDb.getExpenses();
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const expenses = mockDb.getExpenses();
      const newExpense: Expense = {
        ...expense,
        id: `exp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveExpenses([newExpense, ...expenses]);
      return newExpense;
    }
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const expenses = mockDb.getExpenses();
      const index = expenses.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Gasto no encontrado');
      
      const updatedExpense = {
        ...expenses[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      expenses[index] = updatedExpense;
      mockDb.saveExpenses(expenses);
      return updatedExpense;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const expenses = mockDb.getExpenses();
      const filtered = expenses.filter(e => e.id !== id);
      mockDb.saveExpenses(filtered);

      // Desconciliar movimientos de banco asociados
      const movements = mockDb.getBankMovements();
      const updatedMovements = movements.map(m => {
        if (m.expense_id === id) {
          return { ...m, reconciled: false, expense_id: null };
        }
        return m;
      });
      mockDb.saveBankMovements(updatedMovements);
    }
  },

  async getBankMovements(): Promise<BankMovement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bank_movements')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return mockDb.getBankMovements();
    }
  },

  async createBankMovement(movement: Omit<BankMovement, 'id' | 'created_at'>): Promise<BankMovement> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bank_movements')
        .insert([movement])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const movements = mockDb.getBankMovements();
      const newMovement: BankMovement = {
        ...movement,
        id: `bm-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockDb.saveBankMovements([newMovement, ...movements]);
      return newMovement;
    }
  },

  async updateBankMovement(id: string, updates: Partial<BankMovement>): Promise<BankMovement> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bank_movements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const movements = mockDb.getBankMovements();
      const index = movements.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Movimiento bancario no encontrado');
      
      const updatedMovement = {
        ...movements[index],
        ...updates,
      };
      
      movements[index] = updatedMovement;
      mockDb.saveBankMovements(movements);
      return updatedMovement;
    }
  },

  async reconcileExpense(expenseId: string, bankMovementId: string, userId: string): Promise<void> {
    const reconciliationDate = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // Usamos una transaccion o dos llamadas consecutivas en Supabase
      const { error: expError } = await supabase
        .from('expenses')
        .update({
          status: 'conciliado',
          reconciliation_date: reconciliationDate,
          reconciled_by: userId,
          updated_at: reconciliationDate
        })
        .eq('id', expenseId);

      if (expError) throw expError;

      const { error: bmError } = await supabase
        .from('bank_movements')
        .update({
          reconciled: true,
          expense_id: expenseId
        })
        .eq('id', bankMovementId);

      if (bmError) {
        // Deshacer el cambio en gasto si falla el movimiento
        await supabase
          .from('expenses')
          .update({
            status: 'pendiente',
            reconciliation_date: null,
            reconciled_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', expenseId);
        throw bmError;
      }
    } else {
      // Modo local
      const expenses = mockDb.getExpenses();
      const movements = mockDb.getBankMovements();

      const expIndex = expenses.findIndex(e => e.id === expenseId);
      const bmIndex = movements.findIndex(m => m.id === bankMovementId);

      if (expIndex === -1 || bmIndex === -1) {
        throw new Error('Gasto o movimiento no encontrado');
      }

      expenses[expIndex] = {
        ...expenses[expIndex],
        status: 'conciliado',
        reconciliation_date: reconciliationDate,
        reconciled_by: userId,
        updated_at: reconciliationDate
      };

      movements[bmIndex] = {
        ...movements[bmIndex],
        reconciled: true,
        expense_id: expenseId
      };

      mockDb.saveExpenses(expenses);
      mockDb.saveBankMovements(movements);
    }
  },

  async unreconcileExpense(expenseId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error: expError } = await supabase
        .from('expenses')
        .update({
          status: 'pendiente',
          reconciliation_date: null,
          reconciled_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', expenseId);

      if (expError) throw expError;

      const { error: bmError } = await supabase
        .from('bank_movements')
        .update({
          reconciled: false,
          expense_id: null
        })
        .eq('expense_id', expenseId);

      if (bmError) throw bmError;
    } else {
      const expenses = mockDb.getExpenses();
      const movements = mockDb.getBankMovements();

      const expIndex = expenses.findIndex(e => e.id === expenseId);
      if (expIndex !== -1) {
        expenses[expIndex] = {
          ...expenses[expIndex],
          status: 'pendiente',
          reconciliation_date: null,
          reconciled_by: null,
          updated_at: new Date().toISOString()
        };
        mockDb.saveExpenses(expenses);
      }

      const updatedMovements = movements.map(m => {
        if (m.expense_id === expenseId) {
          return { ...m, reconciled: false, expense_id: null };
        }
        return m;
      });
      mockDb.saveBankMovements(updatedMovements);
    }
  },

  async autoReconcile(userId: string): Promise<{ matchedCount: number }> {
    const expenses = await this.getExpenses();
    const movements = await this.getBankMovements();

    const pendingExpenses = expenses.filter(e => e.status === 'pendiente');
    const pendingMovements = movements.filter(m => !m.reconciled);

    let matchedCount = 0;

    for (const movement of pendingMovements) {
      // Encontrar un gasto pendiente que coincida en monto exacto
      // y cuya diferencia de fechas sea <= 3 dias
      const match = pendingExpenses.find(expense => {
        if (expense.amount !== movement.amount) return false;
        if (expense.status === 'conciliado') return false; // Evitar re-reconciliar en el mismo loop

        const expDate = new Date(expense.date);
        const movDate = new Date(movement.date);
        const diffTime = Math.abs(movDate.getTime() - expDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 3;
      });

      if (match) {
        // Conciliar la pareja
        await this.reconcileExpense(match.id, movement.id, userId);
        match.status = 'conciliado'; // Marcar temporalmente para no volver a asociar en este loop
        matchedCount++;
      }
    }

    return { matchedCount };
  }
};

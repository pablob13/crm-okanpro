'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { expensesService } from '@/services/expensesService';
import { Expense, BankMovement } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  ChevronRight,
  Database,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function ReconciliationPage() {
  const { user } = useAuth();
  
  // Datos
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Seleccionados para conciliación manual
  const [selectedMovement, setSelectedMovement] = useState<BankMovement | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Estado del proceso de auto-conciliación
  const [autoReconcileResult, setAutoReconcileResult] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const expList = await expensesService.getExpenses();
      const bmList = await expensesService.getBankMovements();
      setExpenses(expList);
      setBankMovements(bmList);
    } catch (err) {
      console.error('Error cargando conciliador de gastos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrados a pendientes
  const pendingMovements = bankMovements.filter(m => !m.reconciled);
  const pendingExpenses = expenses.filter(e => e.status === 'pendiente');

  // Evaluar coincidencia para la selección actual
  const getMatchAnalysis = () => {
    if (!selectedMovement || !selectedExpense) return null;

    const amountMatches = selectedMovement.amount === selectedExpense.amount;
    
    const expDate = new Date(selectedExpense.date);
    const movDate = new Date(selectedMovement.date);
    const diffTime = Math.abs(movDate.getTime() - expDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateClose = diffDays <= 3;

    return {
      amountMatches,
      dateClose,
      diffDays,
      isValid: amountMatches // Solo permitimos conciliar si el monto coincide
    };
  };

  const matchAnalysis = getMatchAnalysis();

  // Conciliación manual
  const handleReconcileManual = async () => {
    if (!selectedMovement || !selectedExpense || !matchAnalysis?.isValid || !user) return;
    
    setActionLoading(true);
    try {
      await expensesService.reconcileExpense(selectedExpense.id, selectedMovement.id, user.id);
      
      // Limpiar selección y recargar
      setSelectedMovement(null);
      setSelectedExpense(null);
      await loadData();
    } catch (err) {
      console.error('Error conciliando manualmente:', err);
      alert('Ocurrio un error al conciliar el gasto.');
    } finally {
      setActionLoading(false);
    }
  };

  // Conciliación automática masiva
  const handleAutoReconcile = async () => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      const { matchedCount } = await expensesService.autoReconcile(user.id);
      setAutoReconcileResult(`Conciliacion automatica completada. Se conciliaron ${matchedCount} parejas exitosamente.`);
      setSelectedMovement(null);
      setSelectedExpense(null);
      await loadData();
      setTimeout(() => setAutoReconcileResult(null), 5000);
    } catch (err) {
      console.error('Error en conciliacion automatica:', err);
      alert('Ocurrio un error en el proceso de conciliacion automatica.');
    } finally {
      setActionLoading(false);
    }
  };

  // Generador de datos de prueba para experimentar conciliación
  const handleGenerateTestData = async () => {
    setActionLoading(true);
    try {
      const randomSuffix = Math.floor(Math.random() * 1000);
      const testAmount = parseFloat((Math.random() * 800 + 100).toFixed(2));
      
      // Crear un gasto
      await expensesService.createExpense({
        description: `Compra de materiales de oficina ${randomSuffix}`,
        amount: testAmount,
        date: new Date().toISOString().split('T')[0],
        category: 'Oficina',
        status: 'pendiente',
        payment_method: 'Tarjeta Corporativa',
        receipt_url: null,
        reconciliation_date: null,
        reconciled_by: null
      });

      // Crear su contraparte bancaria (coincidencia de monto)
      await expensesService.createBankMovement({
        description: `CARGO PAGO OFICINA TEST ${randomSuffix}`,
        amount: testAmount,
        date: new Date().toISOString().split('T')[0],
        reconciled: false,
        expense_id: null
      });

      // Crear otro gasto sin contraparte
      await expensesService.createExpense({
        description: `Comida cliente de prueba ${randomSuffix}`,
        amount: 450.00,
        date: new Date().toISOString().split('T')[0],
        category: 'Comidas',
        status: 'pendiente',
        payment_method: 'Tarjeta Corporativa',
        receipt_url: null,
        reconciliation_date: null,
        reconciled_by: null
      });

      await loadData();
    } catch (err) {
      console.error('Error generando datos de prueba:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Cabecera del conciliador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Conciliacion de Gastos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Concilia los movimientos bancarios registrados contra los gastos declarados en el CRM.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGenerateTestData}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              title="Generar un gasto y un movimiento que coincidan para pruebas"
            >
              <Plus size={14} />
              Generar Pareja de Prueba
            </button>
            
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Actualizar listas"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleAutoReconcile}
              disabled={actionLoading || pendingMovements.length === 0 || pendingExpenses.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} />
              Conciliacion Automatica
            </button>
          </div>
        </div>

        {/* Banner de resultado de auto-conciliación */}
        {autoReconcileResult && (
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold animate-fade-in flex items-center gap-2">
            <CheckCircle size={16} className="text-sky-400 shrink-0" />
            <span>{autoReconcileResult}</span>
          </div>
        )}

        {/* Panel Central de Conciliacion Manual (Si hay seleccionados) */}
        {selectedMovement && selectedExpense ? (
          <div className="p-5 bg-card border border-sky-500/30 rounded-2xl shadow-lg space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">Analisis de Conciliacion</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Movimiento de Banco Seleccionado */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Movimiento Bancario</span>
                <p className="font-bold text-foreground text-xs leading-snug">{selectedMovement.description}</p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">{selectedMovement.date}</span>
                  <span className="font-extrabold text-foreground">${selectedMovement.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Gasto Registrado Seleccionado */}
              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Gasto Declarado</span>
                  <span className="px-2 py-0.5 rounded text-[8px] bg-secondary text-muted-foreground font-bold">{selectedExpense.category}</span>
                </div>
                <p className="font-bold text-foreground text-xs leading-snug">{selectedExpense.description}</p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">{selectedExpense.date}</span>
                  <span className="font-extrabold text-foreground">${selectedExpense.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Resultados y Comparador */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-border">
              {/* Analizador de Reglas */}
              <div className="text-xs space-y-1">
                {matchAnalysis?.amountMatches ? (
                  <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    Los montos coinciden exactamente.
                  </p>
                ) : (
                  <p className="text-destructive font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Discrepancia en montos (${selectedMovement.amount.toFixed(2)} vs ${selectedExpense.amount.toFixed(2)}).
                  </p>
                )}

                {matchAnalysis?.dateClose ? (
                  <p className="text-emerald-400/90 font-medium flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    Fechas cercanas (diferencia de {matchAnalysis.diffDays} dias).
                  </p>
                ) : (
                  <p className="text-amber-500 font-medium flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Fechas distantes (diferencia de {matchAnalysis?.diffDays} dias).
                  </p>
                )}
              </div>

              {/* Controles de Accion */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    setSelectedMovement(null);
                    setSelectedExpense(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground text-xs font-semibold transition-colors cursor-pointer"
                >
                  Descartar Seleccion
                </button>
                <button
                  onClick={handleReconcileManual}
                  disabled={!matchAnalysis?.isValid || actionLoading}
                  className="flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <LinkIcon size={13} />
                  Conciliar Gasto
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Caja instructiva cuando no hay seleccion */
          <div className="p-4 bg-secondary/20 rounded-2xl border border-border text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <HelpCircle size={16} className="text-muted-foreground animate-pulse" />
            <span>Selecciona un movimiento de banco en la columna izquierda y un gasto registrado en la derecha para conciliar manualmente.</span>
          </div>
        )}

        {/* Layout de Doble Columna */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* COLUMNA 1: MOVIMIENTOS BANCARIOS */}
          <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col min-h-[450px]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm">Movimientos Bancarios Pendientes</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pendientes de registrar o asociar con un gasto.</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pendingMovements.length} transacciones
              </span>
            </div>

            {/* Listado */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[500px] space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Cargando transacciones...
                </div>
              ) : pendingMovements.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  No hay movimientos bancarios pendientes de conciliar.
                </div>
              ) : (
                pendingMovements.map(movement => {
                  const isSelected = selectedMovement?.id === movement.id;
                  return (
                    <div
                      key={movement.id}
                      onClick={() => setSelectedMovement(isSelected ? null : movement)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected 
                          ? 'border-sky-500 bg-sky-500/5 shadow-md shadow-sky-500/5' 
                          : 'border-border bg-background hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground leading-snug">{movement.description}</p>
                          <p className="text-[10px] text-muted-foreground">{movement.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-foreground text-xs">${movement.amount.toFixed(2)}</span>
                          <p className="text-[9px] text-muted-foreground">Debito</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMNA 2: GASTOS DECLARADOS */}
          <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col min-h-[450px]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm">Gastos Registrados Pendientes</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Declarados por el equipo que requieren conciliacion.</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pendingExpenses.length} gastos
              </span>
            </div>

            {/* Listado */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[500px] space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Cargando gastos...
                </div>
              ) : pendingExpenses.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  No hay gastos registrados pendientes de conciliar.
                </div>
              ) : (
                pendingExpenses.map(expense => {
                  const isSelected = selectedExpense?.id === expense.id;
                  return (
                    <div
                      key={expense.id}
                      onClick={() => setSelectedExpense(isSelected ? null : expense)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected 
                          ? 'border-sky-500 bg-sky-500/5 shadow-md shadow-sky-500/5' 
                          : 'border-border bg-background hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-foreground leading-snug">{expense.description}</p>
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-secondary text-muted-foreground font-semibold uppercase">{expense.category}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{expense.date} - Pago via {expense.payment_method}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-foreground text-xs">${expense.amount.toFixed(2)}</span>
                          <p className="text-[9px] text-muted-foreground">Monto</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

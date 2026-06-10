'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { expensesService } from '@/services/expensesService';
import { Expense, BankMovement } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Search, 
  Receipt, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Trash2, 
  TrendingUp,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

export default function ExpensesPage() {
  const { user } = useAuth();
  
  // Estados de carga y datos
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'movements'>('expenses');

  // Filtros y búsquedas
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Control de Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Oficina',
    payment_method: 'Tarjeta Corporativa'
  });
  const [submitting, setSubmitting] = useState(false);

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
      console.error('Error cargando modulo de gastos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Esta seguro de que desea eliminar este gasto?')) return;
    try {
      await expensesService.deleteExpense(id);
      loadData();
    } catch (err) {
      console.error('Error eliminando gasto:', err);
      alert('Ocurrio un error al eliminar el gasto.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount || Number(formData.amount) <= 0) {
      alert('Por favor complete la descripcion y un monto valido.');
      return;
    }

    setSubmitting(true);
    try {
      await expensesService.createExpense({
        description: formData.description.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        category: formData.category,
        payment_method: formData.payment_method,
        status: 'pendiente',
        receipt_url: null,
        reconciliation_date: null,
        reconciled_by: null
      });

      // Limpiar y cerrar modal
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Oficina',
        payment_method: 'Tarjeta Corporativa'
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creando gasto:', err);
      alert('Ocurrio un error al registrar el gasto.');
    } finally {
      setSubmitting(false);
    }
  };

  // Metricas calculadas
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const reconciledAmount = expenses
    .filter(e => e.status === 'conciliado')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = expenses
    .filter(e => e.status === 'pendiente')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const reconciliationRate = expenses.length > 0 
    ? Math.round((expenses.filter(e => e.status === 'conciliado').length / expenses.length) * 100)
    : 0;

  // Filtrado de gastos
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || e.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtrado de movimientos bancarios
  const filteredMovements = bankMovements.filter(bm => {
    return bm.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = ['Todas', 'Oficina', 'Software', 'Comidas', 'Viajes', 'Otros'];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Cabecera del modulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Registro de Gastos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Administra los gastos de operacion y visualiza las transacciones bancarias.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Plus size={16} />
              Registrar Gasto
            </button>
          </div>
        </div>

        {/* Tarjetas de Metricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Gastado */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Registrado</span>
              <p className="text-xl font-extrabold text-foreground">${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Receipt size={20} />
            </div>
          </div>

          {/* Card 2: Conciliados */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conciliado</span>
              <p className="text-xl font-extrabold text-emerald-400">${reconciledAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>

          {/* Card 3: Pendientes */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pendiente</span>
              <p className="text-xl font-extrabold text-amber-500">${pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock size={20} />
            </div>
          </div>

          {/* Card 4: Tasa Conciliacion */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasa de Conciliacion</span>
              <p className="text-xl font-extrabold text-sky-400">{reconciliationRate}%</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Tabulador principal */}
        <div className="border-b border-border flex gap-4">
          <button
            onClick={() => { setActiveTab('expenses'); setSearchQuery(''); }}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'expenses' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Gastos Registrados
            {activeTab === 'expenses' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('movements'); setSearchQuery(''); }}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'movements' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Movimientos de Banco
            {activeTab === 'movements' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* Barra de Filtros y Busqueda */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border border-border">
          {/* Busqueda */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'expenses' ? "Buscar por descripcion o categoria..." : "Buscar movimientos bancarios..."}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Filtros especificos para gastos */}
          {activeTab === 'expenses' && (
            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Categoria */}
              <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
                <Filter size={12} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none p-0 focus:outline-none text-foreground cursor-pointer font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
                <CheckCircle size={12} />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none p-0 focus:outline-none text-foreground cursor-pointer font-medium"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="conciliado">Conciliados</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Listado Principal */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-primary" />
              Cargando registros...
            </div>
          ) : activeTab === 'expenses' ? (
            /* TAB 1: GASTOS */
            filteredExpenses.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground italic">
                No se encontraron gastos registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Descripcion</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Metodo de Pago</th>
                      <th className="p-4">Monto</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredExpenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 whitespace-nowrap font-medium text-foreground">{expense.date}</td>
                        <td className="p-4">
                          <p className="font-bold text-foreground">{expense.description}</p>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary border border-border text-muted-foreground">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-muted-foreground flex items-center gap-1.5 mt-2">
                          <CreditCard size={13} />
                          {expense.payment_method}
                        </td>
                        <td className="p-4 whitespace-nowrap font-extrabold text-foreground">
                          ${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            expense.status === 'conciliado' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {expense.status === 'conciliado' ? 'Conciliado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar gasto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* TAB 2: MOVIMIENTOS BANCARIOS */
            filteredMovements.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground italic">
                No se encontraron transacciones bancarias.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Descripcion Bancaria</th>
                      <th className="p-4">Monto</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">ID de Gasto Asociado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredMovements.map(movement => (
                      <tr key={movement.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 whitespace-nowrap font-medium text-foreground">{movement.date}</td>
                        <td className="p-4">
                          <p className="font-bold text-foreground">{movement.description}</p>
                        </td>
                        <td className="p-4 whitespace-nowrap font-extrabold text-foreground">
                          ${movement.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            movement.reconciled 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {movement.reconciled ? 'Conciliado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-muted-foreground font-mono text-[10px]">
                          {movement.expense_id || 'Ninguno'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal de Registro de Gasto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-fade-in">
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Receipt className="text-primary" size={18} />
                <h3 className="font-extrabold text-foreground text-sm">Registrar Nuevo Gasto</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Descripcion del Gasto</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="ej. Papeleria para la oficina principal"
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Monto ($ MXN)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  >
                    <option value="Oficina">Oficina</option>
                    <option value="Software">Software</option>
                    <option value="Comidas">Comidas</option>
                    <option value="Viajes">Viajes</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metodo de Pago</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                  >
                    <option value="Tarjeta Corporativa">Tarjeta Corporativa</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              {/* Botones Accion */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

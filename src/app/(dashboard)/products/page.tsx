'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { productsService } from '@/services/productsService';
import { Product } from '@/types';
import { 
  Plus, 
  Search, 
  Package, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Tag, 
  Filter, 
  CheckCircle, 
  X,
  Activity,
  DollarSign
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal de Creación / Edición
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    category: 'Sonido',
    active: true,
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error cargando catalogo de productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: '',
      category: 'Sonido',
      active: true,
      image_url: ''
    });
    setEditingProduct(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      price: product.price.toString(),
      category: product.category,
      active: product.active,
      image_url: product.image_url || ''
    });
    setIsOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Esta seguro de que desea eliminar este producto del catalogo?')) return;
    try {
      await productsService.deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error('Error eliminando producto:', err);
      alert('Ocurrio un error al eliminar el producto.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || Number(formData.price) < 0) {
      alert('Por favor complete el nombre y un precio valido.');
      return;
    }

    setSubmitting(true);
    try {
      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        sku: formData.sku.trim() || null,
        price: Number(formData.price),
        category: formData.category,
        active: formData.active,
        image_url: formData.image_url.trim() || null
      };

      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, productPayload);
      } else {
        await productsService.createProduct(productPayload);
      }

      setIsOpen(false);
      resetForm();
      loadProducts();
    } catch (err: any) {
      console.error('Error guardando producto:', err);
      alert('Ocurrio un error al guardar el producto: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Metricas calculadas
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const averagePrice = activeProducts > 0 
    ? products.filter(p => p.active).reduce((acc, curr) => acc + curr.price, 0) / activeProducts
    : 0;
  const categoriesCount = Array.from(new Set(products.map(p => p.category))).length;

  // Filtrado de lista
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) || 
      (product.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
    
    const matchesStatus = 
      statusFilter === 'todos' || 
      (statusFilter === 'activo' && product.active) || 
      (statusFilter === 'inactivo' && !product.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Todas', 'Sonido', 'Luces', 'Seguridad', 'Automatizacion', 'Otros'];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Catalogo de Productos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Administra los productos de sonido, iluminacion, camaras de seguridad y automatizacion del CRM.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Actualizar catalogo"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Plus size={16} />
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Tarjetas de Metricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Productos Totales</span>
              <p className="text-xl font-extrabold text-foreground">{totalProducts}</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Package size={20} />
            </div>
          </div>

          {/* Card 2: Activos */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Productos Activos</span>
              <p className="text-xl font-extrabold text-emerald-400">{activeProducts}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>

          {/* Card 3: Precio Promedio */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Precio Promedio (Activos)</span>
              <p className="text-xl font-extrabold text-sky-400">${averagePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Card 4: Categorias */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categorias</span>
              <p className="text-xl font-extrabold text-violet-400">{categoriesCount}</p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <Tag size={20} />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
          {/* Busqueda */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU o descripcion..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Selectores */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Categoria */}
            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
              <Filter size={12} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none p-0 focus:outline-none text-foreground cursor-pointer font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
              <Activity size={12} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none p-0 focus:outline-none text-foreground cursor-pointer font-medium"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-primary" />
              Cargando catalogo...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground italic">
              No se encontraron productos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-4">SKU / Modelo</th>
                    <th className="p-4">Nombre / Descripcion</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4 whitespace-nowrap font-mono font-bold text-foreground">
                        {product.sku || 'S/N SKU'}
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-10 h-10 object-cover rounded-xl border border-border bg-secondary shrink-0"
                              onError={(e) => {
                                // Evitar bucles de error
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = '';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl border border-border bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                              <Package size={16} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground text-xs">{product.name}</p>
                            {product.description && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary border border-border text-muted-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-extrabold text-foreground">
                        ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear y Editar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-fade-in">
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Package className="text-primary" size={18} />
                <h3 className="font-extrabold text-foreground text-sm">
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nombre del Producto / Servicio</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ej. Bocina Inteligente Sonos One Gen 2"
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">SKU / Modelo</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="ej. SON-ONE-G2"
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Precio ($ MXN)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
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
                    <option value="Sonido">Sonido</option>
                    <option value="Luces">Luces</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Automatizacion">Automatizacion</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                
                <div className="flex flex-col justify-end pb-3 pl-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleCheckboxChange}
                      className="rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer h-4 w-4"
                    />
                    <span>Producto Activo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Imagen del Producto (URL)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {formData.image_url && (
                    <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                      <img 
                        src={formData.image_url} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = '';
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* Plantillas de Imagen */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-1">Preajustes rápidos:</span>
                  {[
                    { name: 'Sonos', url: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=150&auto=format&fit=crop&q=60' },
                    { name: 'Lutron', url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=60' },
                    { name: 'Hikvision', url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=150&auto=format&fit=crop&q=60' },
                    { name: 'Control4', url: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=150&auto=format&fit=crop&q=60' }
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: preset.url }))}
                      className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-foreground text-[10px] font-semibold rounded-lg border border-border transition-colors cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Descripcion Detallada</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Especificaciones, marca, compatibilidad, etc..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

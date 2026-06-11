import { Profile, Lead, Opportunity, Task, Interaction, Manual, Expense, BankMovement, Product, Quote, QuoteItem } from '@/types';

// Perfil de prueba por defecto
export const MOCK_USER: Profile = {
  id: 'mock-user-id-123',
  full_name: 'Usuario Demo OkanPro',
  email: 'demo@okanpro.com',
  role: 'administrador',
  activo: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Datos iniciales de prospectos
export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    first_name: 'Carlos',
    last_name: 'Mendoza',
    company: 'Construcciones Alfa',
    email: 'carlos.mendoza@alfa.com',
    phone: '+52 55 1234 5678',
    status: 'contactado',
    source: 'recomendacion',
    assigned_to: MOCK_USER.id,
    created_by: MOCK_USER.id,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-2',
    first_name: 'Sofía',
    last_name: 'Rodríguez',
    company: 'TecnoHogar S.A.',
    email: 'sofia.rod@tecnohogar.mx',
    phone: '+52 55 9876 5432',
    status: 'calificado',
    source: 'web',
    assigned_to: MOCK_USER.id,
    created_by: MOCK_USER.id,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Hace 10 días
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-3',
    first_name: 'Alejandro',
    last_name: 'Ruiz',
    company: 'AudioHogar',
    email: 'aruiz@audiohogar.mx',
    phone: '+52 81 2233 4455',
    status: 'nuevo',
    source: 'campaña',
    assigned_to: MOCK_USER.id,
    created_by: MOCK_USER.id,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Ayer
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-4',
    first_name: 'María Elena',
    last_name: 'Gómez',
    company: 'Inmobiliaria Plus',
    email: 'megomez@inmoplus.com',
    phone: '+52 33 5566 7788',
    status: 'convertido',
    source: 'directo',
    assigned_to: MOCK_USER.id,
    created_by: MOCK_USER.id,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Oportunidades iniciales
export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Proyecto Audio Multizonas Sonos y Iluminacion Lutron',
    value: 125000.00,
    stage: 'lead',
    close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días en el futuro
    lead_id: 'lead-3',
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-2',
    title: 'Suministro e Instalacion Camaras Hikvision - Alfa',
    value: 45000.00,
    stage: 'propuesta',
    close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lead_id: 'lead-1',
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-3',
    title: 'Automatizacion Sonos/Lutron Residencia',
    value: 18000.00,
    stage: 'negociacion',
    close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lead_id: 'lead-2',
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-4',
    title: 'Instalacion Red y CCTV Hikvision Corporativo',
    value: 32000.00,
    stage: 'ganado',
    close_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lead_id: 'lead-4',
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Tareas iniciales
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Llamar a Carlos Mendoza',
    description: 'Dar seguimiento a la propuesta Lutron enviada la semana pasada.',
    type: 'llamada',
    status: 'pendiente',
    priority: 'alta',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Mañana
    lead_id: 'lead-1',
    assigned_to: MOCK_USER.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Visita técnica a instalaciones',
    description: 'Diseñar cableado y ubicacion de bocinas Sonos y camaras Hikvision.',
    type: 'reunion',
    status: 'pendiente',
    priority: 'media',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    lead_id: 'lead-3',
    assigned_to: MOCK_USER.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Enviar propuesta comercial de domótica',
    description: 'Enviar el archivo en PDF actualizado con el descuento pactado en equipos Lutron y Sonos.',
    type: 'correo',
    status: 'completada',
    priority: 'alta',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Ayer
    lead_id: 'lead-2',
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Interacciones iniciales
export const INITIAL_INTERACTIONS: Interaction[] = [
  {
    id: 'int-1',
    lead_id: 'lead-1',
    created_by: MOCK_USER.id,
    type: 'llamada',
    notes: 'Llamada telefónica inicial. Se identificó necesidad de suministro eléctrico para obra nueva.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-2',
    lead_id: 'lead-1',
    created_by: MOCK_USER.id,
    type: 'correo',
    notes: 'Envío de propuesta económica inicial por $45,000 MXN.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-3',
    lead_id: 'lead-2',
    created_by: MOCK_USER.id,
    type: 'reunion',
    notes: 'Reunión presencial en sus oficinas. Se definieron requisitos para el sistema de automatización.',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Manuales iniciales
export const INITIAL_MANUALS: Manual[] = [
  {
    id: 'man-1',
    title: 'Manual de Integración Sonos y Lutron v2',
    description: 'Guía paso a paso para la correcta instalación, cableado y configuración de bocinas Sonos y luces Lutron.',
    category: 'Instalación',
    file_url: 'https://okanpro.com/docs/manual-integracion.pdf',
    file_size: '4.2 MB',
    content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'man-2',
    title: 'Ficha Técnica - Repetidor Smart Lutron Caseta',
    description: 'Especificaciones técnicas detalladas de alcance, alimentación y compatibilidad de luces Lutron.',
    category: 'Fichas Técnicas',
    file_url: 'https://okanpro.com/docs/ficha-lutron-caseta.pdf',
    file_size: '1.8 MB',
    content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'man-3',
    title: 'Presentación Comercial OkanPro 2026',
    description: 'Catálogo de servicios y portafolio de proyectos de sonido, iluminación y automatización premium.',
    category: 'Presentaciones',
    file_url: 'https://okanpro.com/docs/presentacion-2026.pdf',
    file_size: '12.5 MB',
    content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'man-4',
    title: 'Guía de Sincronización Sonos y Red Wifi',
    description: 'Pasos detallados para enlazar bocinas Sonos a la red Wifi y router local del cliente.',
    category: 'Desarrollos',
    file_url: '/manuals/share/man-4',
    file_size: 'Escrito',
    content: `# Guía de Sincronización Sonos y Red Wifi\n\nEsta guía describe los pasos necesarios para conectar y configurar bocinas Sonos en la red inalámbrica de un cliente.\n\n## Requisitos Previos\n1. Red Wifi de 2.4 GHz o 5 GHz estable con señal suficiente en la zona de instalación.\n2. Contraseña de la red Wifi y la app de Sonos instalada en el dispositivo móvil.\n3. Dispositivo móvil con Bluetooth activo para detección rápida.\n\n## Pasos para la Conexión\n\n### 1. Preparar la Bocina Sonos\n- Conecta la bocina Sonos a la corriente eléctrica.\n- Espera a que el LED indicador parpadee en color **verde**, lo que significa que el dispositivo está listo para configurarse.\n\n### 2. Detección desde la App de Sonos\n- Abre la app de Sonos en tu smartphone.\n- Aparecerá un banner indicando que se ha encontrado una nueva bocina. Presiona **Agregar**.\n- Sigue las instrucciones para presionar el botón de asociación físico en la bocina (o acerca el teléfono si usa NFC).\n\n### 3. Confirmación y Registro\n- La app asociará la bocina a la red local. Una vez finalizado, el LED cambiará a **blanco fijo**.\n- Asigna un nombre a la habitación (ej. Sala, Terraza) y realiza la calibración Trueplay para una acústica óptima.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Operadores / Usuarios iniciales para el modo demo
export const INITIAL_USERS: Profile[] = [
  {
    id: 'mock-user-id-123',
    full_name: 'Usuario Demo OkanPro',
    email: 'demo@okanpro.com',
    role: 'administrador',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-user-id-2',
    full_name: 'Alejandro Ramos',
    email: 'alejandro@okanpro.com',
    role: 'vendedor',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-user-id-3',
    full_name: 'Sofía Castro',
    email: 'sofia.castro@okanpro.com',
    role: 'vendedor',
    activo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Gastos iniciales para el modo demo
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    description: 'Suscripcion de Software CRM',
    amount: 1250.00,
    date: '2026-06-05',
    category: 'Software',
    status: 'pendiente',
    payment_method: 'Tarjeta Corporativa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    description: 'Comida de negocios con Construcciones Alfa',
    amount: 320.50,
    date: '2026-06-02',
    category: 'Comidas',
    status: 'pendiente',
    payment_method: 'Tarjeta Corporativa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    description: 'Renta de Oficina Junio',
    amount: 15000.00,
    date: '2026-06-01',
    category: 'Oficina',
    status: 'pendiente',
    payment_method: 'Transferencia',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    description: 'Papeleria y Hojas de oficina',
    amount: 250.00,
    date: '2026-06-07',
    category: 'Oficina',
    status: 'pendiente',
    payment_method: 'Efectivo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Movimientos de cuenta bancaria/tarjeta iniciales para el modo demo
export const INITIAL_BANK_MOVEMENTS: BankMovement[] = [
  {
    id: 'bm-1',
    date: '2026-06-05',
    description: 'PAGO MENSUAL OKANPRO CRM',
    amount: 1250.00,
    reconciled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bm-2',
    date: '2026-06-03',
    description: 'REST EL CARDENAL COMIDAS',
    amount: 320.50,
    reconciled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bm-3',
    date: '2026-06-01',
    description: 'TRANSFERENCIA RENTA OFICINA',
    amount: 15000.00,
    reconciled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bm-4',
    date: '2026-06-06',
    description: 'OXXO CONSUMO Y MATERIAL',
    amount: 450.00,
    reconciled: false,
    created_at: new Date().toISOString(),
  }
];

// Productos iniciales para el modo demo
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Bocina Inteligente Sonos One Gen 2',
    description: 'Bocina inteligente con control por voz integrado. Sonido potente y nitido que llena cualquier habitacion.',
    sku: 'SON-ONE-G2',
    price: 4999.00,
    category: 'Sonido',
    active: true,
    image_url: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=150&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Interruptor Atenuador Lutron Caseta',
    description: 'Interruptor atenuador de luces inteligente. Controla tus luces desde la app, controles Pico o asistentes de voz.',
    sku: 'LUT-CAS-DIM',
    price: 1550.00,
    category: 'Luces',
    active: true,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Camara IP Domo Hikvision 4MP',
    description: 'Camara de seguridad para exterior e interior con resolucion 4 Megapixeles, lente de 2.8mm y vision nocturna EXIR.',
    sku: 'HIK-DOM-4MP',
    price: 2450.00,
    category: 'Seguridad',
    active: true,
    image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=150&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Cerebro de Automatizacion Control4 EA-1',
    description: 'Cerebro de control inteligente ideal para entretenimiento, control de luces, termostatos y seguridad en hogares medianos.',
    sku: 'C4-EA1-V2',
    price: 19800.00,
    category: 'Automatizacion',
    active: true,
    image_url: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=150&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Cotizaciones iniciales para el modo demo
export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-1',
    client_id: 'lead-1',
    title: 'Propuesta de Audio y CCTV',
    status: 'enviada',
    subtotal: 14898.00,
    discount: 1000.00,
    tax: 2223.68, // 16% of (14898 - 1000) = 2223.68
    total: 16121.68,
    notes: 'Sujeto a cambios sin previo aviso. Los equipos Sonos y Hikvision cuentan con 1 año de garantía.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'quote-2',
    client_id: 'lead-2',
    title: 'Cotización Sistema Lutron Caseta',
    status: 'borrador',
    subtotal: 3100.00,
    discount: 0.00,
    tax: 496.00,
    total: 3596.00,
    notes: 'No incluye instalación. Entrega estimada 3-5 días hábiles.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Conceptos de cotizaciones iniciales
export const INITIAL_QUOTE_ITEMS: QuoteItem[] = [
  {
    id: 'qitem-1',
    quote_id: 'quote-1',
    product_id: 'prod-1',
    description: 'Bocina Inteligente Sonos One Gen 2',
    quantity: 2,
    unit_price: 4999.00,
    total: 9998.00
  },
  {
    id: 'qitem-2',
    quote_id: 'quote-1',
    product_id: 'prod-3',
    description: 'Camara IP Domo Hikvision 4MP',
    quantity: 2,
    unit_price: 2450.00,
    total: 4900.00
  },
  {
    id: 'qitem-3',
    quote_id: 'quote-2',
    product_id: 'prod-2',
    description: 'Interruptor Atenuador Lutron Caseta',
    quantity: 2,
    unit_price: 1550.00,
    total: 3100.00
  }
];

// Utilidad de almacenamiento en LocalStorage para modo Demo
const STORAGE_KEYS = {
  LEADS: 'okanpro_crm_leads',
  OPPORTUNITIES: 'okanpro_crm_opportunities',
  TASKS: 'okanpro_crm_tasks',
  INTERACTIONS: 'okanpro_crm_interactions',
  USER: 'okanpro_crm_user',
  MANUALS: 'okanpro_crm_manuals',
  USERS: 'okanpro_crm_users',
  EXPENSES: 'okanpro_crm_expenses',
  BANK_MOVEMENTS: 'okanpro_crm_bank_movements',
  PRODUCTS: 'okanpro_crm_products',
  QUOTES: 'okanpro_crm_quotes',
  QUOTE_ITEMS: 'okanpro_crm_quote_items'
};

export const mockDb = {
  getLeads: (): Lead[] => {
    if (typeof window === 'undefined') return INITIAL_LEADS;
    const data = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(data);
  },
  saveLeads: (leads: Lead[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    }
  },
  
  getOpportunities: (): Opportunity[] => {
    if (typeof window === 'undefined') return INITIAL_OPPORTUNITIES;
    const data = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(INITIAL_OPPORTUNITIES));
      return INITIAL_OPPORTUNITIES;
    }
    return JSON.parse(data);
  },
  saveOpportunities: (opps: Opportunity[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opps));
    }
  },
  
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(data);
  },
  saveTasks: (tasks: Task[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  },
  
  getInteractions: (): Interaction[] => {
    if (typeof window === 'undefined') return INITIAL_INTERACTIONS;
    const data = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(INITIAL_INTERACTIONS));
      return INITIAL_INTERACTIONS;
    }
    return JSON.parse(data);
  },
  saveInteractions: (ints: Interaction[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(ints));
    }
  },
  
  getUser: (): Profile => {
    if (typeof window === 'undefined') return MOCK_USER;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(MOCK_USER));
      return MOCK_USER;
    }
    return JSON.parse(data);
  },
  saveUser: (user: Profile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  getManuals: (): Manual[] => {
    if (typeof window === 'undefined') return INITIAL_MANUALS;
    const data = localStorage.getItem(STORAGE_KEYS.MANUALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MANUALS, JSON.stringify(INITIAL_MANUALS));
      return INITIAL_MANUALS;
    }
    return JSON.parse(data);
  },
  saveManuals: (manuals: Manual[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MANUALS, JSON.stringify(manuals));
    }
  },

  getUsers: (): Profile[] => {
    if (typeof window === 'undefined') return INITIAL_USERS;
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },
  saveUsers: (users: Profile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return INITIAL_EXPENSES;
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(data);
  },
  saveExpenses: (expenses: Expense[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
  },

  getBankMovements: (): BankMovement[] => {
    if (typeof window === 'undefined') return INITIAL_BANK_MOVEMENTS;
    const data = localStorage.getItem(STORAGE_KEYS.BANK_MOVEMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.BANK_MOVEMENTS, JSON.stringify(INITIAL_BANK_MOVEMENTS));
      return INITIAL_BANK_MOVEMENTS;
    }
    return JSON.parse(data);
  },
  saveBankMovements: (movements: BankMovement[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BANK_MOVEMENTS, JSON.stringify(movements));
    }
  },

  getProducts: (): Product[] => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },
  saveProducts: (products: Product[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  getQuotes: (): Quote[] => {
    if (typeof window === 'undefined') return INITIAL_QUOTES;
    const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    return JSON.parse(data);
  },
  saveQuotes: (quotes: Quote[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    }
  },

  getQuoteItems: (): QuoteItem[] => {
    if (typeof window === 'undefined') return INITIAL_QUOTE_ITEMS;
    const data = localStorage.getItem(STORAGE_KEYS.QUOTE_ITEMS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUOTE_ITEMS, JSON.stringify(INITIAL_QUOTE_ITEMS));
      return INITIAL_QUOTE_ITEMS;
    }
    return JSON.parse(data);
  },
  saveQuoteItems: (items: QuoteItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.QUOTE_ITEMS, JSON.stringify(items));
    }
  },

  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.INTERACTIONS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.MANUALS);
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.BANK_MOVEMENTS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.QUOTES);
      localStorage.removeItem(STORAGE_KEYS.QUOTE_ITEMS);
    }
  }
};

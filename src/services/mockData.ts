import { Profile, Lead, Opportunity, Task, Interaction, Manual, Expense, BankMovement } from '@/types';

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
    company: 'SolarMX',
    email: 'aruiz@solarmx.org',
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
    title: 'Proyecto Paneles Solares Industrial',
    value: 125000.00,
    stage: 'lead',
    close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días en el futuro
    lead_id: 'lead-3', // SolarMX
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-2',
    title: 'Suministro Material Eléctrico - Alfa',
    value: 45000.00,
    stage: 'propuesta',
    close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lead_id: 'lead-1', // Construcciones Alfa
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-3',
    title: 'Automatización y Domótica Residencia',
    value: 18000.00,
    stage: 'negociacion',
    close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lead_id: 'lead-2', // TecnoHogar
    assigned_to: MOCK_USER.id,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-4',
    title: 'Mantenimiento Subestación Eléctrica',
    value: 32000.00,
    stage: 'ganado',
    close_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lead_id: 'lead-4', // Inmobiliaria Plus
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
    description: 'Dar seguimiento a la propuesta técnica enviada la semana pasada.',
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
    description: 'Verificar cableado y acometida principal en oficinas de SolarMX.',
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
    description: 'Enviar el archivo en PDF actualizado con el descuento pactado.',
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
    title: 'Manual de Instalación Fotovoltaica v2',
    description: 'Guía paso a paso para la correcta fijación, conexión y puesta en marcha de sistemas solares.',
    category: 'Instalación',
    file_url: 'https://okanpro.com/docs/manual-instalacion.pdf',
    file_size: '4.2 MB',
    content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'man-2',
    title: 'Ficha Técnica - Inversor Híbrido 5kW',
    description: 'Especificaciones técnicas detalladas de voltajes, eficiencia y conexiones de inversores.',
    category: 'Fichas Técnicas',
    file_url: 'https://okanpro.com/docs/ficha-inversor.pdf',
    file_size: '1.8 MB',
    content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'man-3',
    title: 'Presentación Comercial OkanPro 2026',
    description: 'Catálogo de servicios y portafolio de proyectos de eficiencia energética para clientes.',
    category: 'Presentaciones',
    file_url: 'https://okanpro.com/docs/presentacion-2026.pdf',
    file_size: '12.5 MB',
    content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'man-4',
    title: 'Guía de Configuración Monitoreo Wifi',
    description: 'Pasos detallados para enlazar inversores OkanPro a la red Wifi local del cliente.',
    category: 'Desarrollos',
    file_url: '/manuals/share/man-4',
    file_size: 'Escrito',
    content: `# Configuración de Monitoreo Wifi para Inversores OkanPro\n\nEsta guía describe los pasos necesarios para habilitar el monitoreo remoto en sistemas residenciales e industriales de OkanPro.\n\n## Requisitos Previos\n1. Red Wifi de 2.4 GHz disponible con señal estable en el sitio.\n2. Contraseña de la red Wifi a la mano.\n3. Dispositivo móvil (Smartphone o Tablet) con Bluetooth activo.\n\n## Pasos para la Conexión\n\n### 1. Activar Punto de Acceso en el Inversor\n- Presiona el botón físico de **Configuración** en la pantalla del inversor por 5 segundos.\n- El LED de comunicación Wifi comenzará a parpadear en color **azul**, indicando que el Punto de Acceso está activo.\n\n### 2. Conexión desde la Aplicación\n- Abre la aplicación OkanPro en tu dispositivo móvil.\n- Navega a **Ajustes de Inversor > Configurar Red**.\n- Selecciona la red local del cliente de la lista de redes detectadas, ingresa su contraseña y presiona **Conectar**.\n\n### 3. Confirmación de Sincronización\n- El LED Wifi del inversor debe cambiar a **verde fijo**.\n- En un lapso de 5 minutos, los datos de generación comenzarán a transmitirse y visualizarse en el portal en línea.\n\n> **Nota de Soporte**:\n> Si el LED parpadea en rojo, verifica que la contraseña del Wifi sea correcta y que la red sea de frecuencia 2.4 GHz (las redes de 5 GHz no son compatibles con el módulo de comunicación estándar).`,
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
  BANK_MOVEMENTS: 'okanpro_crm_bank_movements'
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
    }
  }
};

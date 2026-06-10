export type UserRole = 'administrador' | 'vendedor';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  activo?: boolean;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'nuevo' | 'contactado' | 'calificado' | 'perdido' | 'convertido';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  source: string;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joins opcionales
  assigned_profile?: Profile;
}

export type OpportunityStage = 'lead' | 'contactado' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido';

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: OpportunityStage;
  close_date: string | null;
  lead_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  
  // Joins opcionales
  lead?: Lead;
  assigned_profile?: Profile;
}

export type TaskType = 'llamada' | 'reunion' | 'correo' | 'tarea';
export type TaskStatus = 'pendiente' | 'completada';
export type TaskPriority = 'baja' | 'media' | 'alta';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  lead_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  
  // Joins opcionales
  lead?: Lead;
  assigned_profile?: Profile;
}

export type InteractionType = 'nota' | 'llamada' | 'correo' | 'reunion';

export interface Interaction {
  id: string;
  lead_id: string;
  created_by: string | null;
  type: InteractionType;
  notes: string;
  created_at: string;
  
  // Joins opcionales
  creator_profile?: Profile;
}

export interface Manual {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_size: string | null;
  content?: string | null;
  gdrive_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type ExpenseStatus = 'pendiente' | 'conciliado';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: ExpenseStatus;
  payment_method: string;
  receipt_url?: string | null;
  reconciliation_date?: string | null;
  reconciled_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankMovement {
  id: string;
  date: string;
  description: string;
  amount: number;
  reconciled: boolean;
  expense_id?: string | null;
  created_at: string;
}

/**
 * Tipos de las tablas del sistema de gestión (Supabase).
 * Espejan el schema de `supabase/migrations/0001_init.sql`.
 */

export type ProfileRole = 'admin' | 'client'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  company: string | null
  phone: string | null
  role: ProfileRole
  created_at: string
}

export type ProjectType = 'web' | 'landing' | 'app' | 'diseno' | 'mantenimiento' | 'otro'
export type ProjectStatus = 'lead' | 'en_progreso' | 'pausado' | 'completado' | 'cancelado'
export type Currency = 'ARS' | 'USD'

export interface Project {
  id: string
  /** Email en minúsculas del cliente dueño del proyecto (sin FK a profiles). */
  client_email: string
  title: string
  type: ProjectType
  amount: number
  currency: Currency
  status: ProjectStatus
  start_date: string | null
  deadline: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type StageStatus = 'pendiente' | 'en_progreso' | 'revision' | 'completada' | 'bloqueada'

export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type StageInput = Pick<
  ProjectStage,
  'name' | 'description' | 'position' | 'status' | 'client_visible' | 'notes'
>
export type PaymentInput = Omit<Payment, 'id' | 'created_at'>

export interface ProjectStage {
  id: string
  project_id: string
  name: string
  description: string | null
  position: number
  status: StageStatus
  client_visible: boolean
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  subject: string | null
  read_at: string | null
  created_at: string
}

export type PaymentKind = 'senal' | 'saldo' | 'extra'
export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido'

export interface Payment {
  id: string
  project_id: string
  kind: PaymentKind
  amount: number
  currency: Currency
  status: PaymentStatus
  due_date: string | null
  paid_at: string | null
  note: string | null
  created_at: string
}

export type ApprovalDecision = 'aprobado' | 'rechazado'

export interface MilestoneApproval {
  id: string
  stage_id: string
  project_id: string
  client_id: string
  decision: ApprovalDecision
  comment: string | null
  created_at: string
}

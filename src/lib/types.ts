/**
 * Tipos de las tablas del sistema de gestión (Supabase).
 * Espejan el schema de `supabase/migrations/0001_init.sql`.
 */
import type { EstimateTierId } from '../data/estimate'

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
  status: ProjectStatus
  start_date: string | null
  deadline: string | null
  description: string | null
  created_at: string
  updated_at: string
  /** Fecha de cierre: la setea un trigger al pasar status a 'completado'. */
  completed_at: string | null
}

export type StageStatus = 'pendiente' | 'en_progreso' | 'revision' | 'completada' | 'bloqueada'

export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'completed_at'>
export type StageInput = Pick<
  ProjectStage,
  'name' | 'description' | 'position' | 'status' | 'client_visible' | 'notes'
>

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

export type BriefStatus = 'pendiente' | 'completado'

/** Respuestas del brief: string para campos simples, string[] para chips. */
export type BriefAnswers = Record<string, string | string[]>

export interface ProjectBrief {
  id: string
  project_id: string
  /** Servicio elegido por el admin (tiers del estimador). */
  service_type: EstimateTierId
  /** Ids de extras del estimador seleccionados. */
  extra_ids: string[]
  /** Respuestas del cliente: { fieldId: value } según briefTemplates. */
  answers: BriefAnswers
  /** Autocalculado: 'completado' si todos los obligatorios respondidos. */
  status: BriefStatus
  created_at: string
  updated_at: string
}

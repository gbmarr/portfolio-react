import { describe, expect, it } from 'vitest'
import { computeKpis } from './dashboard'
import type { ContactMessage, Payment, Project } from './types'

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    client_email: 'a@b.com',
    title: 'Sitio',
    type: 'web',
    amount: 100,
    currency: 'ARS',
    status: 'en_progreso',
    start_date: null,
    deadline: null,
    description: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay1',
    project_id: 'p1',
    kind: 'senal',
    amount: 100,
    currency: 'ARS',
    status: 'pendiente',
    due_date: null,
    paid_at: null,
    note: null,
    created_at: '',
    ...overrides,
  }
}

function message(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    id: 'm1',
    name: 'Ana',
    email: 'a@b.com',
    message: 'Hola',
    subject: null,
    read_at: null,
    created_at: '',
    ...overrides,
  }
}

const today = new Date('2026-10-05T12:00:00')

describe('computeKpis', () => {
  it('cuenta proyectos activos y mensajes sin leer', () => {
    const kpis = computeKpis(
      [project({ status: 'en_progreso' }), project({ status: 'lead' }), project({ status: 'completado' })],
      [message(), message({ read_at: '2026-10-01' })],
      [],
      today,
    )
    expect(kpis.activeProjects).toBe(1)
    expect(kpis.unreadMessages).toBe(1)
  })

  it('clasifica entregas próximas (7 días) y vencidas', () => {
    const kpis = computeKpis(
      [
        project({ deadline: '2026-10-10' }), // +5 días → próxima
        project({ deadline: '2026-10-12' }), // +7 días → próxima (borde)
        project({ deadline: '2026-10-13' }), // +8 días → fuera de ventana
        project({ deadline: '2026-10-01' }), // vencida
        project({ deadline: '2026-10-01', status: 'completado' }), // ignorada
        project({ deadline: '2026-10-01', status: 'cancelado' }), // ignorada
        project({ deadline: null }), // sin fecha
      ],
      [],
      [],
      today,
    )
    expect(kpis.upcomingDeadlines).toBe(2)
    expect(kpis.overdueDeadlines).toBe(1)
  })

  it('suma pagos por moneda: pagado vs pendiente', () => {
    const kpis = computeKpis(
      [],
      [],
      [
        payment({ amount: 100, status: 'pagado' }),
        payment({ amount: 50, status: 'pendiente' }),
        payment({ amount: 10, status: 'vencido' }),
        payment({ amount: 7, currency: 'USD', status: 'pagado' }),
      ],
      today,
    )
    expect(kpis.totals).toEqual({
      ARS: { paid: 100, pending: 60 },
      USD: { paid: 7, pending: 0 },
    })
  })
})

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectPreviewGallery } from './ProjectPreviewGallery'
import type { Project, ProjectPreviewWithUrl, ProjectStage } from '../../lib/types'

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio web para Estudio',
  type: 'web',
  status: 'en_progreso',
  start_date: null,
  deadline: null,
  description: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  completed_at: null,
  preview_url: null,
  preview_label: null,
  ...over,
})

const stage = (over: Partial<ProjectStage> = {}): ProjectStage => ({
  id: 'stage-1',
  project_id: 'p1',
  name: 'Diseño',
  description: null,
  position: 0,
  status: 'en_progreso',
  client_visible: true,
  started_at: null,
  completed_at: null,
  created_at: '2026-09-01T00:00:00Z',
  ...over,
})

const preview = (over: Partial<ProjectPreviewWithUrl> = {}): ProjectPreviewWithUrl => ({
  id: 'preview-1',
  project_id: 'p1',
  stage_id: 'stage-1',
  storage_path: 'p1/abc.png',
  caption: 'Home',
  position: 0,
  client_visible: true,
  created_at: '2026-10-24T00:00:00Z',
  url: 'https://cdn.example/preview.png',
  ...over,
})

describe('ProjectPreviewGallery', () => {
  it('no renderiza nada si no hay enlace ni capturas', () => {
    const { container } = render(
      <ProjectPreviewGallery project={project()} stages={[]} previews={[]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra el botón del enlace externo con su etiqueta', () => {
    render(
      <ProjectPreviewGallery
        project={project({ preview_url: 'https://staging.example.com', preview_label: 'Ver staging' })}
        stages={[]}
        previews={[]}
      />
    )

    expect(screen.getByRole('link', { name: 'Ver staging' })).toHaveAttribute(
      'href',
      'https://staging.example.com'
    )
    expect(screen.getByRole('link', { name: 'Ver staging' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('usa el texto por defecto si no hay etiqueta', () => {
    render(
      <ProjectPreviewGallery
        project={project({ preview_url: 'https://staging.example.com' })}
        stages={[]}
        previews={[]}
      />
    )
    expect(screen.getByRole('link', { name: 'Abrir preview' })).toBeInTheDocument()
  })

  it('muestra capturas con epígrafe y etapa', () => {
    render(<ProjectPreviewGallery project={project()} stages={[stage()]} previews={[preview()]} />)

    expect(screen.getByRole('img', { name: 'Home' })).toHaveAttribute(
      'src',
      'https://cdn.example/preview.png'
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Etapa: Diseño')).toBeInTheDocument()
  })

  it('muestra un aviso si la signed URL no se pudo generar', () => {
    render(
      <ProjectPreviewGallery
        project={project()}
        stages={[]}
        previews={[preview({ url: null })]}
      />
    )

    expect(screen.getByText('No se pudo cargar esta imagen.')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

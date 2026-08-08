import { describe, expect, it } from 'vitest'
import { content } from './content'
import { profile } from './profile'
import { projects } from './projects'
import { skills } from './skills'
import { experience } from './experience'

describe('content', () => {
  it('provides both languages', () => {
    expect(content.es).toBeTruthy()
    expect(content.en).toBeTruthy()
  })

  it('mirrors the data files in Spanish', () => {
    expect(content.es.profile.role).toBe(profile.role)
    expect(content.es.profile.bio).toBe(profile.bio)
    for (const project of projects) {
      expect(content.es.projects[project.id]).toBe(project.description)
    }
    for (const category of skills) {
      expect(content.es.skillCategories[category.id]).toBe(category.category)
    }
    for (const item of experience.work) {
      expect(content.es.work[item.id].title).toBe(item.title)
    }
    for (const item of experience.education) {
      expect(content.es.education[item.id].title).toBe(item.title)
    }
    for (const item of experience.certifications) {
      expect(content.es.certifications[item.id].title).toBe(item.title)
    }
  })

  it('covers every data id in English', () => {
    for (const project of projects) {
      expect(content.en.projects[project.id]).toBeTruthy()
    }
    for (const category of skills) {
      expect(content.en.skillCategories[category.id]).toBeTruthy()
    }
    for (const item of experience.work) {
      expect(content.en.work[item.id].title).toBeTruthy()
      expect(content.en.work[item.id].organization).toBeTruthy()
    }
    for (const item of experience.education) {
      expect(content.en.education[item.id].title).toBeTruthy()
    }
    for (const item of experience.certifications) {
      expect(content.en.certifications[item.id].title).toBeTruthy()
    }
  })

  it('translates the localized strings to English', () => {
    expect(content.en.profile.role).toBe('Junior Fullstack Developer')
    expect(content.en.skillCategories.tools).toBe('Tools')
    expect(content.en.work['dranes-mvp'].title).toBe('MVP Development')
    expect(content.en.education['tecnicatura-unicen'].achievements).toContain('In progress.')
    expect(content.en.certifications['programa-frontend-developer'].title).toBe(
      'Frontend Developer Program'
    )
  })
})

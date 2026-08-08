import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import { projects } from './projects'
import { skills } from './skills'
import { experience } from './experience'

const urlPattern = /^https?:\/\/.+/

describe('profile data', () => {
  it('has all required fields populated', () => {
    expect(profile.name).toBeTruthy()
    expect(profile.role).toBeTruthy()
    expect(profile.bio).toBeTruthy()
    expect(profile.location).toBeTruthy()
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  })

  it('has valid social links', () => {
    expect(profile.socialLinks.github).toMatch(urlPattern)
    expect(profile.socialLinks.linkedin).toMatch(urlPattern)
    for (const other of profile.socialLinks.others ?? []) {
      expect(other.url).toMatch(urlPattern)
    }
  })
})

describe('projects data', () => {
  it('has at least one project with valid fields', () => {
    expect(projects.length).toBeGreaterThan(0)
    for (const project of projects) {
      expect(project.id).toBeTruthy()
      expect(project.name).toBeTruthy()
      expect(project.description).toBeTruthy()
      expect(project.technologies.length).toBeGreaterThan(0)
      if (project.demoUrl) {
        expect(project.demoUrl).toMatch(urlPattern)
      }
      if (project.repoUrl) {
        expect(project.repoUrl).toMatch(urlPattern)
      }
    }
  })
})

describe('skills data', () => {
  it('has at least one skill category with skills', () => {
    expect(skills.length).toBeGreaterThan(0)
    for (const category of skills) {
      expect(category.category).toBeTruthy()
      expect(category.skills.length).toBeGreaterThan(0)
    }
  })
})

describe('experience data', () => {
  it('has work and education entries with titles', () => {
    expect(experience.work.length).toBeGreaterThan(0)
    expect(experience.education.length).toBeGreaterThan(0)
    for (const item of [...experience.work, ...experience.education]) {
      expect(item.title).toBeTruthy()
      expect(item.organization).toBeTruthy()
      expect(item.startDate).toBeTruthy()
    }
  })

  it('has certifications with titles and organizations', () => {
    expect(experience.certifications.length).toBeGreaterThan(0)
    for (const item of experience.certifications) {
      expect(item.title).toBeTruthy()
      expect(item.organization).toBeTruthy()
    }
  })
})

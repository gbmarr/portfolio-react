import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import { projects } from './projects'
import { buildWhatsAppUrl, services } from './services'
import { cases } from './cases'
import { processSteps } from './process'
import { faqs } from './faq'

const urlPattern = /^https?:\/\/.+/
const whatsappUrlPattern = /^https:\/\/wa\.me\/\d+\?text=.+/

describe('profile data', () => {
  it('has all required fields populated', () => {
    expect(profile.name).toBeTruthy()
    expect(profile.role).toBeTruthy()
    expect(profile.bio).toBeTruthy()
    expect(profile.location).toBeTruthy()
    expect(profile.city).toBeTruthy()
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
    expect(profile.whatsappNumber).toMatch(/^\d+$/)
    expect(profile.whatsappMessage).toBeTruthy()
    expect(profile.phone).toBeTruthy()
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

describe('services data', () => {
  it('has the two core services with all fields', () => {
    expect(services.length).toBeGreaterThanOrEqual(2)
    for (const service of services) {
      expect(service.id).toBeTruthy()
      expect(service.name).toBeTruthy()
      expect(service.audience).toBeTruthy()
      expect(service.includes.length).toBeGreaterThan(0)
      expect(service.excludes.length).toBeGreaterThan(0)
      expect(service.timeline).toBeTruthy()
      expect(service.priceFrom).toMatch(/USD \d+/)
      expect(service.whatsappMessage).toBeTruthy()
    }
  })

  it('builds a wa.me link with a predefined message', () => {
    expect(buildWhatsAppUrl()).toMatch(whatsappUrlPattern)
    expect(buildWhatsAppUrl('landing')).toMatch(whatsappUrlPattern)
  })
})

describe('cases data', () => {
  it('has at least two case studies with context', () => {
    expect(cases.length).toBeGreaterThanOrEqual(2)
    for (const caseStudy of cases) {
      expect(caseStudy.id).toBeTruthy()
      expect(caseStudy.client).toBeTruthy()
      expect(caseStudy.industry).toBeTruthy()
      expect(caseStudy.title).toBeTruthy()
      expect(caseStudy.need).toBeTruthy()
      expect(caseStudy.work).toBeTruthy()
      expect(caseStudy.result).toBeTruthy()
      if (caseStudy.url) {
        expect(caseStudy.url).toMatch(urlPattern)
      }
    }
  })
})

describe('process data', () => {
  it('has between 3 and 4 sequential steps', () => {
    expect(processSteps.length).toBeGreaterThanOrEqual(3)
    expect(processSteps.length).toBeLessThanOrEqual(4)
    processSteps.forEach((step, index) => {
      expect(step.number).toBe(index + 1)
      expect(step.title).toBeTruthy()
      expect(step.description).toBeTruthy()
    })
  })
})

describe('faq data', () => {
  it('has at least 5 questions with answers', () => {
    expect(faqs.length).toBeGreaterThanOrEqual(5)
    for (const faq of faqs) {
      expect(faq.question).toBeTruthy()
      expect(faq.answer).toBeTruthy()
      expect(faq.question.endsWith('?')).toBe(true)
    }
  })
})
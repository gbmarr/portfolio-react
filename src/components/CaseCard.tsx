import type { CaseStudy } from '../data/types'
import { copy } from '../data/copy'
import { Mockup } from './Mockup'

interface CaseCardProps {
  caseStudy: CaseStudy
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Mini caso de trabajo: contexto, qué se hizo y resultado. */
export function CaseCard({ caseStudy }: CaseCardProps) {
  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow sm:p-8">
      <Mockup
        src={caseStudy.screenshot}
        alt={`Captura de ${caseStudy.title}`}
        initials={getInitials(caseStudy.title)}
        variant="phone"
      />

      <div className="space-y-1">
        <h3 className="font-display text-xl font-semibold text-text">{caseStudy.title}</h3>
        <p className="text-sm text-text-muted">
          {caseStudy.client} · {caseStudy.industry}
        </p>
        {caseStudy.role && (
          <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {copy.cases.roles[caseStudy.role]}
          </span>
        )}
      </div>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-text">{copy.cases.needLabel}</dt>
          <dd className="text-text-muted">{caseStudy.need}</dd>
        </div>
        <div>
          <dt className="font-semibold text-text">{copy.cases.workLabel}</dt>
          <dd className="text-text-muted">{caseStudy.work}</dd>
        </div>
        <div>
          <dt className="font-semibold text-text">{copy.cases.resultLabel}</dt>
          <dd className="text-text-muted">{caseStudy.result}</dd>
        </div>
      </dl>

      {caseStudy.url && (
        <a
          href={caseStudy.url}
          className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {copy.cases.visitSite} ↗
        </a>
      )}
    </article>
  )
}
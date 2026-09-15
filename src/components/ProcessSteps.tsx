import type { ProcessStep } from '../data/types'

interface ProcessStepsProps {
  steps: ProcessStep[]
}

/** Pasos del proceso de trabajo, numerados. */
export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <li
          key={step.id}
          className="relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
        >
          <span
            aria-hidden="true"
            className="font-display text-4xl font-bold text-accent/30"
          >
            {step.number}
          </span>
          <h3 className="font-display text-lg font-semibold text-text">{step.title}</h3>
          <p className="text-sm text-text-muted">{step.description}</p>
        </li>
      ))}
    </ol>
  )
}
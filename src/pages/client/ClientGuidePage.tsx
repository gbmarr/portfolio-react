import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { guideBenefits, guideIntro, guideSections, guideUpdatedAt } from '../../data/clientGuide'
import { useGuideProgress } from '../../hooks/useGuideProgress'

/** Guía paso a paso para clientes con progreso guardado en el navegador. */
export function ClientGuidePage() {
  const { completed, toggleStep, reset, done, total, percent, sectionProgress } = useGuideProgress()
  const [confirmReset, setConfirmReset] = useState(false)
  const complete = total > 0 && done === total

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {guideIntro.eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-text sm:text-3xl">
            {guideIntro.title}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-text-muted">{guideIntro.subtitle}</p>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-text">
              {done} de {total} pasos completados
            </span>
            <span className="text-text-muted">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de la guía"
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border/60"
          >
            <div
              className={`h-full w-full origin-left rounded-full transition-transform duration-[400ms] ease-out motion-reduce:transition-none ${
                complete ? 'bg-emerald-300' : 'bg-accent'
              }`}
              style={{ transform: `scaleX(${percent / 100})` }}
            />
          </div>
          {complete && (
            <p role="status" className="mt-3 text-sm text-emerald-300">
              ¡Listo! Completaste todos los pasos de la guía.
            </p>
          )}
        </div>
      </header>

      <section aria-labelledby="guide-benefits-title" className="space-y-4">
        <div className="space-y-1">
          <h2 id="guide-benefits-title" className="font-display text-xl font-semibold text-text">
            Por qué te conviene
          </h2>
          <p className="text-sm text-text-muted">
            Tener tu dominio y tus cuentas profesionales no es solo una cuestión de imagen.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {guideBenefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-xl border border-border bg-background/60 p-5"
            >
              <h3 className="text-sm font-semibold text-text">{benefit.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">{benefit.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Secciones de la guía" className="flex flex-wrap gap-2">
        {guideSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {guideSections.map((section) => {
          const progress = sectionProgress(section)
          return (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-24 rounded-2xl border border-border bg-background/60 p-5 sm:p-6"
            >
              <header className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2
                    id={`${section.id}-title`}
                    className="font-display text-lg font-semibold text-text"
                  >
                    {section.title}
                  </h2>
                  <Badge tone={progress.done === progress.total ? 'done' : 'neutral'}>
                    {progress.done}/{progress.total}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{section.intro}</p>
              </header>

              <ol className="mt-5 space-y-3">
                {section.steps.map((step, index) => {
                  const isDone = completed.has(step.id)
                  const inputId = `guide-${step.id}`

                  return (
                    <li
                      key={step.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        isDone
                          ? 'border-emerald-400/40 bg-emerald-400/5'
                          : 'border-border bg-background/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleStep(step.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                        />
                        <label htmlFor={inputId} className="flex-1 cursor-pointer">
                          <span className="block text-sm font-semibold text-text">
                            {index + 1}. {step.title}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-text-muted">
                            {step.body}
                          </span>
                        </label>
                      </div>

                      {step.bullets && (
                        <ul className="mt-3 list-disc space-y-1 pl-11 text-sm text-text-muted">
                          {step.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      )}

                      {step.links && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 pl-11">
                          {step.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-accent hover:underline"
                            >
                              {link.label} ↗
                            </a>
                          ))}
                        </div>
                      )}

                      {step.tip && (
                        <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent">
                          {step.tip}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>

      <footer className="space-y-4 border-t border-border pt-6">
        <p className="text-xs leading-relaxed text-text-muted">
          Última revisión: {guideUpdatedAt}. Los precios, planes, requisitos legales y enlaces
          pueden cambiar; verificá siempre las fuentes oficiales antes de contratar o registrar
          algo.
        </p>

        {done > 0 &&
          (confirmReset ? (
            <div
              role="alertdialog"
              aria-label="Reiniciar progreso"
              className="flex flex-wrap items-center gap-3 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              <span>¿Borrar el progreso guardado en este navegador?</span>
              <button
                type="button"
                onClick={() => {
                  reset()
                  setConfirmReset(false)
                }}
                className="rounded bg-red-400/20 px-3 py-1 font-semibold hover:bg-red-400/30"
              >
                Sí, reiniciar
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded border border-red-400/40 px-3 py-1 hover:bg-red-400/10"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Reiniciar progreso
            </button>
          ))}
      </footer>
    </article>
  )
}

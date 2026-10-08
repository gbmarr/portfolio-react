import { useMemo, useState } from 'react'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Button } from '../components/Button'
import { copy } from '../data/copy'
import {
  ecommerceExtraId,
  estimateExtras,
  estimateTiers,
  type EstimateTierId,
} from '../data/estimate'
import { buildEstimateWhatsAppMessage, computeEstimate, type EstimateInput } from '../lib/estimate'
import { formatMoney } from '../lib/format'
import { profile } from '../data/profile'

const MIN_SECTIONS = 3
const MAX_SECTIONS = 8

/**
 * Estimador de presupuesto: 100% client-side (fair-use: cero functions, cero
 * fetch). Da un rango orientativo y deriva a WhatsApp para el cierre.
 */
export function Estimator() {
  const [tier, setTier] = useState<EstimateTierId>('landing')
  const [sections, setSections] = useState(5)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [express, setExpress] = useState(false)

  const input: EstimateInput = useMemo(
    () => ({ tier, sections, extras: selectedExtras, express }),
    [tier, sections, selectedExtras, express],
  )
  const result = useMemo(() => computeEstimate(input), [input])
  const whatsappUrl = useMemo(() => {
    const message = buildEstimateWhatsAppMessage(input, result)
    return `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(message)}`
  }, [input, result])

  function toggleExtra(id: string) {
    setSelectedExtras((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const rangeLabel = `USD ${result.minUsd.toLocaleString('es-AR')} – USD ${result.maxUsd.toLocaleString('es-AR')}`

  return (
    <Section id="estimador" className="bg-surface/40">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow={copy.estimator.eyebrow}
          title={copy.estimator.title}
          subtitle={copy.estimator.subtitle}
        />

        <div className="space-y-8 rounded-xl border border-border bg-background/60 p-6 sm:p-8">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-text">
              {copy.estimator.tierLegend}
            </legend>
            <div className="space-y-2">
              {estimateTiers.map((item) => (
                <label key={item.id} className="flex items-center gap-3 text-sm text-text-muted">
                  <input
                    type="radio"
                    name="estimate-tier"
                    value={item.id}
                    checked={tier === item.id}
                    onChange={() => setTier(item.id)}
                    className="h-4 w-4 accent-accent"
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </fieldset>

          {tier === 'institucional' && (
            <div>
              <label
                htmlFor="estimate-sections"
                className="mb-2 block text-sm font-semibold uppercase tracking-wide text-text"
              >
                {copy.estimator.sectionsLabel} ({sections})
              </label>
              <input
                id="estimate-sections"
                type="range"
                min={MIN_SECTIONS}
                max={MAX_SECTIONS}
                value={sections}
                aria-valuetext={`${sections} secciones`}
                onChange={(event) => setSections(Number(event.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}

          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-text">
              {copy.estimator.extrasLegend}
            </legend>
            <div className="space-y-2">
              {estimateExtras.map((extra) => {
                const isIncluded = tier === 'medida' && extra.id === ecommerceExtraId
                const priceLabel =
                  extra.kind === 'fixed' ? `+USD ${extra.amountUsd}` : `+${Math.round(extra.percent * 100)}%`
                return (
                  <label key={extra.id} className="flex items-center gap-3 text-sm text-text-muted">
                    <input
                      type="checkbox"
                      checked={isIncluded || selectedExtras.includes(extra.id)}
                      disabled={isIncluded}
                      onChange={() => toggleExtra(extra.id)}
                      className="h-4 w-4 accent-accent"
                    />
                    <span>
                      {extra.label} ({priceLabel})
                      {isIncluded && (
                        <span className="ml-1 text-accent">— {copy.estimator.includedNote}</span>
                      )}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <label className="flex items-center gap-3 text-sm font-semibold text-text">
            <input
              type="checkbox"
              checked={express}
              onChange={(event) => setExpress(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            {copy.estimator.expressLabel}
          </label>

          <div
            data-testid="estimate-result"
            aria-live="polite"
            className="space-y-3 rounded-xl border border-accent/30 bg-surface p-5"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {copy.estimator.resultLabel}
            </p>
            <p className="font-display text-3xl font-semibold text-text">{rangeLabel}</p>
            <p className="text-sm text-text-muted">
              {copy.estimator.arsApproxLabel}:{' '}
              {formatMoney(result.minArs, 'ARS')} – {formatMoney(result.maxArs, 'ARS')}
            </p>
            <p className="text-sm text-text-muted">
              {copy.estimator.timelineLabel}: {result.timeline}
            </p>
            <div className="text-sm text-text-muted">
              <p className="mb-1 font-semibold">{copy.estimator.breakdownLabel}:</p>
              <ul className="space-y-1">
                {result.breakdown.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4">
                    <span>{row.label}</span>
                    <span>USD {row.amountUsd.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-text-muted">{copy.estimator.disclaimer}</p>

          <div className="flex flex-wrap items-center gap-4">
            <Button href={whatsappUrl}>{copy.estimator.ctaWhatsApp}</Button>
            <a
              href="#contacto"
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {copy.estimator.maintenanceChip}
            </a>
          </div>
        </div>
      </Container>
    </Section>
  )
}

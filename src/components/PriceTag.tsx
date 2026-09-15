interface PriceTagProps {
  price: string
  label?: string
}

/** Etiqueta de precio "Desde USD 250". */
export function PriceTag({ price, label }: PriceTagProps) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      {label && <span className="text-sm text-text-muted">{label}</span>}
      <span className="font-display text-2xl font-semibold text-accent">{price}</span>
    </span>
  )
}
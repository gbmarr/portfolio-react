import { Button } from './Button'
import { buildWhatsAppUrl } from '../data/services'
import { copy } from '../data/copy'

interface WhatsAppButtonProps {
  serviceId?: string
  label?: string
  variant?: 'primary' | 'secondary'
  className?: string
}

/** Botón que abre WhatsApp (wa.me) con un mensaje predefinido. */
export function WhatsAppButton({
  serviceId,
  label,
  variant = 'primary',
  className,
}: WhatsAppButtonProps) {
  return (
    <Button href={buildWhatsAppUrl(serviceId)} variant={variant} className={className}>
      {label ?? copy.contact.whatsappLabel}
    </Button>
  )
}
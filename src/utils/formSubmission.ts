import type { ContactFormData } from '../components/ContactForm'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

/**
 * Envía el mensaje del formulario a Web3Forms.
 * Requiere la variable de entorno `FORM_ACCESS_KEY` (ver `.env.example`).
 * Lanza un error si el envío falla o si falta la clave — el formulario lo
 * muestra como estado de error y ofrece WhatsApp como canal alternativo.
 */
export async function submitContactForm(
  data: ContactFormData,
  botcheck = '',
): Promise<void> {
  const accessKey = import.meta.env.FORM_ACCESS_KEY
  if (!accessKey) {
    throw new Error('Falta FORM_ACCESS_KEY en el entorno')
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      name: data.name,
      email: data.email,
      message: data.message,
      // Honeypot anti-spam: Web3Forms descarta el envío si viene con valor.
      botcheck,
      subject: `Nuevo mensaje del sitio web: ${data.name}`,
      from_name: data.name,
      replyto: data.email,
    }),
  })

  if (!response.ok) {
    throw new Error(`Web3Forms respondió con estado ${response.status}`)
  }

  // Web3Forms puede devolver HTTP 200 con `success: false` en el body;
  // hay que mirar el JSON para detectar rechazos (spam, límite, key inválida).
  const result = (await response.json().catch(() => null)) as { success?: boolean } | null
  if (!result?.success) {
    throw new Error('Web3Forms rechazó el envío')
  }
}
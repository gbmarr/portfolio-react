import type { ContactFormData } from '../components/ContactForm'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

/**
 * Envía el mensaje del formulario a Web3Forms.
 * Requiere la variable de entorno `VITE_FORM_ACCESS_KEY` (ver `.env.example`).
 * Lanza un error si el envío falla o si falta la clave — el formulario lo
 * muestra como estado de error y ofrece WhatsApp como canal alternativo.
 */
export async function submitContactForm(data: ContactFormData): Promise<void> {
  const accessKey = import.meta.env.VITE_FORM_ACCESS_KEY
  if (!accessKey) {
    throw new Error('Falta VITE_FORM_ACCESS_KEY en el entorno')
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
      subject: `Nuevo mensaje del sitio web: ${data.name}`,
      from_name: data.name,
      replyto: data.email,
    }),
  })

  if (!response.ok) {
    throw new Error(`Web3Forms respondió con estado ${response.status}`)
  }
}
export type GuideLink = {
  label: string
  href: string
}

export type GuideStep = {
  id: string
  title: string
  body: string
  bullets?: string[]
  links?: GuideLink[]
  tip?: string
}

export type GuideSection = {
  id: string
  title: string
  intro: string
  steps: GuideStep[]
}

export type GuideBenefit = {
  title: string
  description: string
}

export const guideIntro = {
  eyebrow: 'Guía de inicio',
  title: 'Todo lo que necesitás para arrancar tu proyecto',
  subtitle:
    'Una guía práctica para dejar tu marca, tu dominio y tus herramientas profesionales listas. Marcá cada paso a medida que lo completás: el progreso se guarda en este navegador.',
} as const

export const guideUpdatedAt = 'octubre 2026'

export const guideBenefits: GuideBenefit[] = [
  {
    title: 'Email profesional, no personal',
    description:
      'Usar hola@tumarca.com separa tu vida personal de la del negocio y transmite una imagen mucho más profesional.',
  },
  {
    title: 'Credibilidad desde el primer contacto',
    description:
      'Un dominio propio y un correo con tu marca generan más confianza que una dirección genérica o un número personal.',
  },
  {
    title: 'El dominio es tuyo',
    description:
      'Si mañana cambiás de hosting, de diseñador o de proveedor de email, tu dominio y tus direcciones te acompañan.',
  },
  {
    title: 'Marca consistente',
    description:
      'El mismo nombre en el dominio, el email, GitHub y las redes evita confusiones y refuerza tu identidad.',
  },
  {
    title: 'Base para crecer',
    description:
      'Un dominio habilita email propio, analítica, campañas, subdominios y nuevas herramientas sin empezar de cero.',
  },
  {
    title: 'Control y seguridad',
    description:
      'Vos administrás el dominio, el correo y los accesos. Con 2FA y un gestor de contraseñas, todo queda bajo tu control.',
  },
]

export const guideSections: GuideSection[] = [
  {
    id: 'marca',
    title: '1. Definí y registrá tu marca',
    intro:
      'Antes de comprar el dominio y abrir cuentas, conviene dejar claro qué nombre va a representar a tu negocio.',
    steps: [
      {
        id: 'marca-nombre',
        title: 'Elegí el nombre y verificá que esté disponible',
        body: 'Definí el nombre comercial y revisá que no esté usado por otro negocio en tu rubro. Probalo en el buscador de marcas del INPI, en dominios y en redes sociales.',
        bullets: [
          'Buscá el nombre exacto y variantes similares en INPI.',
          'Verificá que el dominio .com.ar o .com esté libre.',
          'Revisá que el usuario esté disponible en Instagram, LinkedIn y GitHub.',
        ],
        links: [
          { label: 'Buscar marcas en INPI', href: 'https://www.argentina.gob.ar/inpi/marcas' },
          { label: 'Consultar dominios .com.ar', href: 'https://nic.ar/' },
        ],
      },
      {
        id: 'marca-clases',
        title: 'Identificá las clases de tu actividad',
        body: 'El registro de marca se organiza por clases de productos y servicios (clasificación de Niza). Elegí las clases que cubran lo que hacés hoy y lo que pensás hacer a futuro.',
        tip: 'Si tenés dudas sobre las clases, consultá con un/a abogado/a especializado/a en propiedad industrial.',
      },
      {
        id: 'marca-registro',
        title: 'Presentá el registro de marca',
        body: 'Ingresá al portal de trámites del INPI, completá el formulario, aboná la tasa y seguí el expediente. Guardá el número de trámite y los comprobantes.',
        bullets: [
          'Tené a mano tus datos y los del negocio.',
          'Definí si registrás el nombre solo o también el logo.',
          'Anotá las fechas de vencimiento y las respuestas del organismo.',
        ],
        links: [{ label: 'Portal de trámites INPI', href: 'https://portaltramites.inpi.gob.ar/' }],
      },
      {
        id: 'marca-respaldo',
        title: 'Guardá toda la documentación',
        body: 'Conservá comprobantes, resoluciones y capturas del expediente en una carpeta segura. Si más adelante vendés la marca o abrís una sociedad, esos documentos van a ser necesarios.',
      },
    ],
  },
  {
    id: 'dominio',
    title: '2. Comprá tu dominio',
    intro:
      'El dominio es la dirección de tu negocio en internet. Es una inversión anual y queda a tu nombre, aunque cambies de proveedor.',
    steps: [
      {
        id: 'dominio-extension',
        title: 'Elegí la extensión',
        body: 'Para un negocio argentino, .com.ar transmite cercanía y confianza local. Si apuntás a clientes de otros países, .com es más universal. Lo ideal es quedarte con una sola extensión principal.',
        bullets: [
          '.com.ar: se registra a través de NIC Argentina.',
          '.com: se compra en registradores internacionales como Cloudflare Registrar o Namecheap.',
          'Evitá extensiones raras o muy baratas que después sean difíciles de renovar.',
        ],
        links: [
          { label: 'NIC Argentina', href: 'https://nic.ar/' },
          { label: 'Cloudflare Registrar', href: 'https://www.cloudflare.com/products/registrar/' },
          { label: 'Namecheap', href: 'https://www.namecheap.com/domains/' },
        ],
      },
      {
        id: 'dominio-compra',
        title: 'Buscá disponibilidad y comprá',
        body: 'Verificá el precio de registro y de renovación antes de pagar. Comprá a nombre del negocio o de su titular y usá un email al que vayas a tener acceso siempre.',
        bullets: [
          'Revisá el precio de renovación, no solo el de la primera compra.',
          'Activá la renovación automática.',
          'Guardá la factura y el comprobante de pago.',
        ],
      },
      {
        id: 'dominio-dns',
        title: 'Guardá el acceso al panel DNS',
        body: 'El panel DNS es donde vas a configurar el correo y el sitio. Anotá el usuario y la contraseña en un gestor de contraseñas y activá la verificación en dos pasos.',
        tip: 'Si otra persona administra el dominio por vos, pedí que te agreguen como contacto o titular. El dominio tiene que quedar bajo tu control.',
      },
      {
        id: 'dominio-privacidad',
        title: 'Protegé tus datos',
        body: 'Activá la privacidad de WHOIS si el registrador la ofrece y usá un email de administración que revises. Así evitás exponer tus datos personales en el registro público.',
      },
    ],
  },
  {
    id: 'email',
    title: '3. Creá tu email profesional con Zoho Mail',
    intro:
      'Con el dominio comprado ya podés tener una casilla profesional, por ejemplo hola@tumarca.com, sin mezclar tu correo personal.',
    steps: [
      {
        id: 'email-cuenta',
        title: 'Creá la cuenta de Zoho Mail',
        body: 'Registrate en Zoho Mail con un email personal o con el email que uses para administrar el negocio. Después vas a poder crear la casilla con tu dominio.',
        links: [{ label: 'Crear cuenta en Zoho Mail', href: 'https://www.zoho.com/mail/' }],
      },
      {
        id: 'email-dominio',
        title: 'Agregá y verificá el dominio',
        body: 'Dentro de Zoho, agregá tu dominio y verificá la propiedad con el registro TXT que te indique el panel. Copialo en la configuración DNS de tu dominio.',
        bullets: [
          'Usá el dominio principal, sin www.',
          'Esperá la propagación del DNS; puede tardar hasta 48 horas.',
          'Verificá el estado en Zoho antes de seguir.',
        ],
      },
      {
        id: 'email-mx',
        title: 'Configurá MX, SPF, DKIM y DMARC',
        body: 'Zoho te va a dar los registros MX para recibir correo y los registros SPF, DKIM y DMARC para que tus mensajes lleguen bien y no caigan en spam.',
        bullets: [
          'MX: indica a qué servidor tiene que llegar tu correo.',
          'SPF: autoriza a Zoho a enviar en nombre de tu dominio.',
          'DKIM: firma criptográficamente tus mensajes.',
          'DMARC: le dice a los servidores qué hacer si algo no cumple.',
        ],
        tip: 'Si no estás seguro de cómo cargar los registros, pedile a quien administra tu DNS que los copie textualmente desde Zoho.',
      },
      {
        id: 'email-casilla',
        title: 'Creá la casilla y probá',
        body: 'Creá la dirección principal (por ejemplo hola@tumarca.com), configurá la firma y hacé una prueba real enviando y recibiendo un correo desde otra cuenta.',
        bullets: [
          'Probá enviar a Gmail y a Outlook.',
          'Revisá que la firma incluya tu nombre, marca y teléfono.',
          'Configurá la casilla en el celular con IMAP o la app de Zoho.',
        ],
      },
    ],
  },
  {
    id: 'github',
    title: '4. Creá tu cuenta de GitHub',
    intro:
      'GitHub es donde vive el código del proyecto. Una cuenta profesional te permite acceder al repositorio, revisar cambios y colaborar con quien te desarrolla el sitio.',
    steps: [
      {
        id: 'github-cuenta',
        title: 'Creá la cuenta',
        body: 'Registrate con tu email profesional, elegí un nombre de usuario relacionado con tu marca y verificá el correo.',
        links: [{ label: 'Crear cuenta en GitHub', href: 'https://github.com/signup' }],
      },
      {
        id: 'github-2fa',
        title: 'Activá la verificación en dos pasos',
        body: 'GitHub exige 2FA para muchas operaciones. Usá una app de autenticación y guardá los códigos de recuperación en un lugar seguro.',
        tip: 'No uses solo SMS si podés evitarlo. Una app o una llave de seguridad es más resistente.',
      },
      {
        id: 'github-repo',
        title: 'Creá el repositorio del proyecto',
        body: 'Creá un repositorio privado para el sitio. Si trabajás con un desarrollador o agencia, agregalo como colaborador con los permisos mínimos necesarios.',
        bullets: [
          'Nombre claro: por ejemplo, sitio-tumarca.',
          'Repositorio privado mientras el proyecto no sea público.',
          'Revisá quién tiene acceso y quitá permisos cuando ya no los necesite.',
        ],
      },
      {
        id: 'github-accesos',
        title: 'Guardá los accesos',
        body: 'Anotá el usuario, el email y los códigos de recuperación en tu gestor de contraseñas. Si perdés el acceso, el repositorio y el deploy pueden quedar bloqueados.',
      },
    ],
  },
  {
    id: 'vercel',
    title: '5. Publicá con Vercel',
    intro:
      'Vercel toma el código de GitHub y lo publica en internet. También permite conectar tu dominio y generar versiones de prueba antes de cada cambio.',
    steps: [
      {
        id: 'vercel-cuenta',
        title: 'Creá la cuenta',
        body: 'Registrate en Vercel con tu cuenta de GitHub. Así el deploy queda vinculado al repositorio y no tenés que configurar credenciales extra.',
        links: [{ label: 'Crear cuenta en Vercel', href: 'https://vercel.com/signup' }],
      },
      {
        id: 'vercel-proyecto',
        title: 'Importá el repositorio',
        body: 'Desde el panel de Vercel, importá el repositorio del proyecto. Verificá el framework, el comando de build y la carpeta de salida que detecta automáticamente.',
        tip: 'Si el proyecto usa variables de entorno, cargalas en Vercel antes del primer deploy.',
      },
      {
        id: 'vercel-dominio',
        title: 'Conectá tu dominio',
        body: 'Agregá el dominio en Vercel y copiá los registros DNS que te indique. Vercel va a emitir el certificado HTTPS automáticamente cuando el DNS esté bien configurado.',
        bullets: [
          'Agregá el dominio sin www y también la versión con www si la querés.',
          'Esperá la propagación del DNS.',
          'Verificá que el candado de HTTPS aparezca en el navegador.',
        ],
        links: [
          {
            label: 'Guía de dominios de Vercel',
            href: 'https://vercel.com/docs/domains/working-with-domains/add-a-domain',
          },
        ],
      },
      {
        id: 'vercel-deploy',
        title: 'Probá el sitio publicado',
        body: 'Abrí el dominio en una ventana privada, probá el formulario de contacto y revisá que las imágenes y los enlaces funcionen. Guardá el enlace del deploy para futuras revisiones.',
      },
    ],
  },
  {
    id: 'cierre',
    title: '6. Checklist final',
    intro:
      'Cuando termines, hacé una última revisión de accesos y renovaciones. Esto evita sorpresas cuando el sitio ya esté funcionando.',
    steps: [
      {
        id: 'cierre-accesos',
        title: 'Reuní todos los accesos',
        body: 'Verificá que tenés usuario y contraseña de: dominio, Zoho Mail, GitHub y Vercel. Guardalos en un gestor de contraseñas, no en un chat o en un documento suelto.',
      },
      {
        id: 'cierre-2fa',
        title: 'Activá 2FA en todas las cuentas',
        body: 'Dominio, email, GitHub y Vercel deberían tener verificación en dos pasos. Guardá los códigos de recuperación en un lugar separado.',
      },
      {
        id: 'cierre-renovaciones',
        title: 'Anotá las renovaciones',
        body: 'El dominio y algunos planes se renuevan automáticamente. Registrá las fechas y el medio de pago para no perder el dominio ni el correo.',
      },
      {
        id: 'cierre-equipo',
        title: 'Definí quién administra qué',
        body: 'Si alguien más va a mantener el sitio, acordá qué accesos comparte y con qué permisos. Lo ideal es que el dominio y el email queden siempre a tu nombre.',
      },
    ],
  },
]

export const guideStepIds = new Set(
  guideSections.flatMap((section) => section.steps.map((step) => step.id))
)

export const guideTotalSteps = guideStepIds.size

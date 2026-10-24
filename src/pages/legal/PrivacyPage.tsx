import { LegalPage } from './LegalPage'
import { profile } from '../../data/profile'

export function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      description="Cómo se tratan los datos personales enviados a través de los formularios de contacto y solicitud de presupuesto."
    >
      <p>
        Esta política explica qué datos personales se reciben a través de este sitio, para qué se
        usan y cómo podés ejercer tus derechos. Se aplica al formulario de contacto y al formulario
        de solicitud de presupuesto.
      </p>

      <h2>Responsable del tratamiento</h2>
      <p>
        El responsable es {profile.name}, con domicilio en {profile.location}. Podés escribir a{' '}
        <a href={`mailto:${profile.email}`}>{profile.email}</a> para cualquier consulta sobre tus
        datos.
      </p>

      <h2>Qué datos se reciben</h2>
      <ul>
        <li>Nombre y email que ingresás en los formularios.</li>
        <li>El mensaje que escribís en el formulario de contacto.</li>
        <li>
          Las selecciones del formulario de presupuesto: tipo de proyecto, cantidad de secciones,
          extras y notas que decidas agregar.
        </li>
        <li>La fecha y la versión del consentimiento que aceptaste.</li>
        <li>
          Datos técnicos necesarios para prevenir abuso: dirección IP, fecha del envío y resultado
          de la verificación anti-bot de Cloudflare Turnstile. El token de Turnstile se verifica y
          no se almacena.
        </li>
      </ul>

      <h2>Para qué se usan</h2>
      <ul>
        <li>Responder tu consulta y enviarte el presupuesto que solicitaste.</li>
        <li>Gestionar el seguimiento de la solicitud en el panel privado.</li>
        <li>Prevenir spam, abuso y accesos no autorizados.</li>
        <li>Entender de forma agregada qué contenidos del sitio resultan útiles.</li>
      </ul>
      <p>
        No se usan tus datos para publicidad de terceros ni se venden a nadie. Tampoco se toman
        decisiones automatizadas que produzcan efectos legales sobre vos.
      </p>

      <h2>Base legal</h2>
      <p>
        El tratamiento se basa en el consentimiento que otorgás al enviar el formulario y, para las
        medidas de seguridad y prevención de abuso, en el interés legítimo de proteger el sitio y a
        sus usuarios. Podés retirar tu consentimiento en cualquier momento escribiendo al email de
        contacto; esto no afecta los tratamientos ya realizados.
      </p>

      <h2>Cuánto tiempo se conservan</h2>
      <p>
        Las consultas y solicitudes de presupuesto se conservan durante 12 meses desde el último
        contacto, salvo que exista una obligación legal de conservarlas por más tiempo. Los datos
        técnicos de rate limiting se eliminan a las 24 horas. La información agregada de analítica
        no permite identificarte.
      </p>

      <h2>Quién puede acceder</h2>
      <p>
        Solo accede el responsable del sitio. Para operar el sitio se usan proveedores que tratan
        datos por cuenta del responsable y con medidas de seguridad:
      </p>
      <ul>
        <li>Supabase: base de datos, autenticación y funciones del servidor.</li>
        <li>Resend: envío de emails de notificación y respuesta.</li>
        <li>Cloudflare Turnstile: verificación anti-bot.</li>
        <li>Vercel: alojamiento del sitio y analítica agregada sin cookies.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden alojar datos fuera de Argentina. En esos casos se
        aplican las garantías y cláusulas contractuales que correspondan para proteger la
        información.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés solicitar acceso, rectificación, actualización, supresión o confidencialidad de tus
        datos, oponerte a un tratamiento y retirar tu consentimiento. Escribí a{' '}
        <a href={`mailto:${profile.email}`}>{profile.email}</a> indicando tu pedido. También podés
        presentar una denuncia ante la Agencia de Acceso a la Información Pública de Argentina
        (AAIP).
      </p>

      <h2>Cookies y analítica</h2>
      <p>
        El sitio no usa cookies publicitarias ni de seguimiento entre sitios. Vercel Analytics
        funciona sin cookies y solo aporta métricas agregadas. Cloudflare Turnstile puede usar
        almacenamiento técnico necesario para distinguir personas de bots; sin ese mecanismo no se
        pueden enviar los formularios.
      </p>

      <h2>Seguridad</h2>
      <p>
        Se aplican medidas técnicas y organizativas razonables: conexiones HTTPS, control de acceso
        al panel, autenticación reforzada para administración, reglas de acceso a la base de datos y
        límites de envío. Ningún sistema es infalible; si detectás un incidente, escribí al email de
        contacto.
      </p>

      <h2>Cambios</h2>
      <p>
        Esta política puede actualizarse para reflejar cambios en el sitio o en la normativa. La
        versión vigente es la publicada en esta página, con su fecha de última actualización.
      </p>

      <h2>Contacto</h2>
      <p>
        Por cualquier duda sobre esta política o sobre tus datos, escribí a{' '}
        <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>
    </LegalPage>
  )
}

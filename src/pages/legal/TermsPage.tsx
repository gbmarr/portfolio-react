import { Link } from 'react-router-dom'
import { LegalPage } from './LegalPage'
import { profile } from '../../data/profile'

export function TermsPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      description="Condiciones de uso del sitio y del formulario de solicitud de presupuesto."
    >
      <p>
        Estos términos regulan el uso de este sitio y el envío de solicitudes de presupuesto. Al
        usar el sitio o enviar un formulario, aceptás estas condiciones.
      </p>

      <h2>Proveedor</h2>
      <p>
        El sitio pertenece a {profile.name}, con domicilio en {profile.location}. El canal de
        contacto es <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>

      <h2>Objeto del sitio</h2>
      <p>
        El sitio presenta servicios de diseño y desarrollo web, trabajos realizados y una vía para
        solicitar un presupuesto. La información publicada es informativa y puede cambiar sin aviso.
      </p>

      <h2>Solicitud de presupuesto</h2>
      <p>
        Completar el formulario no crea un contrato ni reserva un cupo. La solicitud es una consulta:
        el responsable revisa el proyecto y responde con un presupuesto personalizado por email o
        WhatsApp. Hasta que ambas partes acepten expresamente una propuesta, no existe obligación de
        ejecutar el proyecto.
      </p>

      <h2>Precios y presupuestos</h2>
      <ul>
        <li>El sitio no publica precios cerrados ni rangos de precio.</li>
        <li>
          El presupuesto que se envía es personalizado, orientativo hasta su aceptación y válido por
          15 días desde su emisión, salvo que se indique otro plazo.
        </li>
        <li>
          El alcance, las entregas, los plazos y la forma de pago se definen en la propuesta
          aceptada. Cualquier cambio posterior se acuerda por escrito.
        </li>
      </ul>

      <h2>Uso del sitio</h2>
      <p>Al usar los formularios te comprometés a:</p>
      <ul>
        <li>Proporcionar información veraz y actualizada.</li>
        <li>No enviar contenido ilegal, ofensivo, engañoso o que vulnere derechos de terceros.</li>
        <li>No intentar acceder a áreas privadas, automatizar envíos o interferir con la seguridad.</li>
      </ul>

      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, marcas, imágenes, código y demás contenidos de este sitio pertenecen a su
        responsable o se usan con autorización. No se permite reproducirlos o reutilizarlos con fines
        comerciales sin permiso previo. Los trabajos de clientes se muestran con su autorización o
        en los términos acordados.
      </p>

      <h2>Enlaces a terceros</h2>
      <p>
        El sitio puede incluir enlaces a sitios de terceros. No se controla su contenido ni sus
        políticas, y el acceso a ellos es responsabilidad de quien los visita.
      </p>

      <h2>Disponibilidad y cambios</h2>
      <p>
        Se procura que el sitio esté disponible, pero no se garantiza un funcionamiento ininterrumpido
        ni libre de errores. El sitio puede modificarse, suspenderse o darse de baja total o
        parcialmente sin aviso previo.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        En la medida permitida por la ley, el responsable no responde por daños indirectos,
        lucro cesante o pérdida de datos derivados del uso del sitio o de la imposibilidad de usarlo.
        Nada de esto excluye responsabilidades que no puedan limitarse legalmente.
      </p>

      <h2>Privacidad</h2>
      <p>
        El tratamiento de datos personales se rige por la{' '}
        <Link to="/privacidad">Política de Privacidad</Link>. Te recomendamos leerla antes de enviar
        un formulario.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se
        somete a los tribunales competentes de {profile.location}, salvo norma imperativa en
        contrario.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tenés preguntas sobre estos términos, escribí a{' '}
        <a href={`mailto:${profile.email}`}>{profile.email}</a>.
      </p>
    </LegalPage>
  )
}

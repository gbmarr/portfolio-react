# Spec — Sitio web de servicios de desarrollo web

Documento de referencia para construir (o reconvertir) el sitio propio con el que se ofrecen servicios de desarrollo de landing pages y sitios institucionales.

> Fuente: especificación provista por el usuario el 2026-09-15. Este documento es la fuente de verdad del producto.

---

## 1. Objetivo del sitio

**Objetivo primario:** que un dueño de PyME o emprendedor que no sabe nada de desarrollo web entienda en menos de 30 segundos qué le ofrecés, cuánto le va a costar aproximadamente, y cómo dar el siguiente paso.

**Objetivo secundario:** que el sitio funcione como demostración de tu trabajo. El visitante evalúa tu capacidad mirando tu propio sitio, aunque no sea consciente de que lo está haciendo.

**Acción deseada (una sola):** que el visitante te escriba. Todo lo demás en el sitio existe para empujar hacia ahí.

**Error a evitar:** organizar el sitio alrededor de vos (mis proyectos, mis tecnologías, mi stack). Tiene que estar organizado alrededor del problema del visitante.

---

## 2. Público objetivo

**Quién llega al sitio:**
- Dueños de comercios, estudios profesionales, PyMEs, emprendedores.
- No tienen conocimiento técnico. No saben qué es React, Vercel ni un CMS, y no les interesa.
- Suelen llegar por referido ("me pasaron tu contacto") o por búsqueda local.
- Están comparando: probablemente hablaron con otra persona antes, o están considerando Wix/una plantilla.

**Qué preguntas traen en la cabeza (el sitio debe responderlas todas):**
1. ¿Este tipo hace lo que yo necesito?
2. ¿Cuánto me va a salir? ¿Está dentro de mi presupuesto?
3. ¿Cuánto tiempo tarda?
4. ¿Ya le hizo esto a alguien parecido a mí?
5. ¿Qué tengo que hacer yo? ¿Me va a pedir cosas que no tengo?
6. ¿Qué pasa después de que me entrega el sitio? ¿Me deja solo?

**Lo que NO les importa:** el stack tecnológico, tu experiencia con frameworks, la performance en Lighthouse. Traducir todo eso a beneficios concretos ("carga rápido en el celular", "lo podés editar vos mismo").

---

## 3. Estructura de páginas

Sitio chico, de 4 páginas. No hace falta más para arrancar.

### 3.1 Inicio (home)
La página que hace el trabajo pesado. Debe poder cerrar una consulta sin que el visitante navegue a ninguna otra parte.

### 3.2 Servicios
Detalle de los dos productos: landing page y sitio institucional. Qué incluye cada uno, para quién es, plazos y rango de precio.

### 3.3 Trabajos (portfolio)
Los proyectos hechos, presentados como casos, no como galería.

### 3.4 Contacto
Formulario + canales directos. Puede ser una sección de la home en vez de página aparte si el sitio es muy chico.

---

## 4. Contenido por sección — Página de inicio

### 4.1 Hero (primera pantalla)
- **Titular:** qué hacés y para quién, en una línea, sin jerga. No "Desarrollador Full Stack", sino algo del tipo "Sitios web para negocios que necesitan verse profesionales".
- **Subtítulo:** una frase que agregue el diferencial (rapidez de entrega, trato directo, precio claro).
- **Botón principal:** una sola acción, visible sin scrollear ("Pedí tu presupuesto" / "Escribime por WhatsApp").
- **Prueba visual:** captura de uno o dos trabajos reales, apenas visible en esta primera pantalla.

**Regla:** si el visitante lee solo el hero y cierra, tiene que haber entendido qué vendés.

### 4.2 El problema (opcional pero recomendado)
Dos o tres líneas que nombren la situación del visitante: no tener sitio, tener uno viejo que no se ve bien en el celular, depender de que alguien más lo actualice. Sirve para que se sienta identificado antes de que le vendas nada.

### 4.3 Servicios (versión resumida)
Dos bloques, uno por producto:
- **Landing page** — para quién es, qué incluye en 3-4 puntos, plazo estimado, precio "desde".
- **Sitio institucional** — lo mismo.

Cada bloque con un enlace a la página de Servicios para el detalle completo.

**Sobre mostrar precios:** conviene mostrar al menos un "desde $X". Filtra a quien no puede pagarlo (te ahorra reuniones perdidas) y genera confianza en quien sí. La alternativa de "consultar precio" hace que mucha gente no escriba.

### 4.4 Cómo trabajo (proceso)
Tres o cuatro pasos numerados. Esto responde la pregunta "¿qué tengo que hacer yo?", que es la que más frena a un cliente que nunca encargó un sitio.

Ejemplo de estructura:
1. Charlamos y me contás qué necesitás.
2. Te paso un presupuesto cerrado, sin sorpresas.
3. Diseño y desarrollo, con revisiones en el medio.
4. Publicamos y te explico cómo mantenerlo.

### 4.5 Trabajos (versión resumida)
Dos o tres proyectos destacados con captura, nombre del cliente y una línea de resultado. Enlace a la página completa.

**Si todavía no tenés clientes reales:** usar proyectos propios presentados como casos ficticios pero declarados ("proyecto propio", "concepto para un restaurante"). Nunca inventar clientes que no existen.

### 4.6 Sobre mí
Corto, 3-4 líneas, con foto real. No un CV. El objetivo es que el visitante vea que hay una persona concreta del otro lado, no una agencia anónima. Mencionar que el trato es directo con vos (que para una PyME es una ventaja, no una limitación).

### 4.7 Preguntas frecuentes
Sección de alto valor y bajo esfuerzo. Responde objeciones sin que el visitante tenga que preguntarlas:
- ¿Cuánto tarda?
- ¿Qué necesito darte para empezar?
- ¿El dominio y el hosting están incluidos?
- ¿Puedo editar el contenido yo después?
- ¿Qué pasa si necesito cambios más adelante?
- ¿Cómo son los pagos?

### 4.8 Cierre / llamado a la acción final
Repetir el botón principal al final de la página. Mucha gente scrollea todo y decide al final; no la obligues a volver arriba.

---

## 5. Contenido — Página de Servicios

Por cada uno de los dos productos:

- **Para quién es** (una línea: "ideal para un comercio que necesita presencia online rápida").
- **Qué incluye** (lista concreta: diseño, responsive, formulario de contacto, publicación, conexión de dominio, SEO básico).
- **Qué NO incluye** (evita malentendidos y refuerza confianza: redacción de textos, fotografía profesional, diseño de logo).
- **Plazo estimado.**
- **Rango de precio** o precio "desde".
- **Botón de contacto** específico para ese servicio.

Tomar el contenido de esta sección directamente de los contratos ya redactados, para que lo que promete el sitio y lo que firma el cliente coincidan exactamente.

---

## 6. Contenido — Página de Trabajos

Cada proyecto presentado como un mini caso, no como una imagen suelta:

- **Captura del sitio** (en mockup de celular y escritorio).
- **Cliente y rubro.**
- **Qué necesitaba** (1-2 líneas).
- **Qué hice** (1-2 líneas).
- **Resultado**, si existe algún dato concreto (más consultas, más rápido, ahora lo edita el cliente solo).
- **Enlace al sitio en vivo.**

Tres casos bien contados valen más que diez capturas sin contexto.

---

## 7. Contenido — Contacto

- **Formulario corto:** nombre, email o WhatsApp, y "contame qué necesitás". Nada más. Cada campo adicional reduce la cantidad de envíos.
- **WhatsApp directo** con enlace `wa.me` y mensaje predefinido. Para el público objetivo argentino, es el canal más usado y el que más convierte.
- **Expectativa de respuesta:** "Te respondo dentro de las 24 hs". Reduce ansiedad y te compromete a un estándar.

---

## 8. Requisitos técnicos

- **Responsive obligatorio**, con diseño pensado desde el celular. La mayoría del tráfico va a llegar desde un teléfono.
- **Carga rápida.** Es una demostración implícita de tu trabajo: si tu sitio tarda, el cliente asume que el suyo también va a tardar.
- **SEO on-page:** títulos y meta descripciones por página, etiquetas alt en imágenes, sitemap.
- **SEO local:** incluir la ciudad/zona donde trabajás en el contenido, si buscás clientes de la zona.
- **Analytics configurado** desde el día uno, para saber qué secciones se leen y dónde abandonan.
- **Formulario funcionando y probado.** Un formulario roto en el sitio de un desarrollador web es el peor error posible.
- **Dominio propio con SSL.**
- **Open Graph configurado:** cuando compartas el link por WhatsApp (que va a ser el canal principal), tiene que verse una previsualización decente.

---

## 9. Tono y redacción

- **Hablar en el idioma del cliente, no en el tuyo.** Reemplazar términos técnicos por beneficios.
- **Segunda persona.** "Tu sitio", "vos necesitás", no "se ofrecen servicios de desarrollo".
- **Frases cortas.** El visitante escanea, no lee.
- **Sin promesas vacías.** Evitar "soluciones innovadoras de vanguardia". Decir qué hacés y cuánto sale.
- **Coherencia con los contratos:** lo que promete el sitio tiene que ser exactamente lo que después figura en el contrato firmado.

---

## 10. Qué dejar afuera (errores comunes)

- **Lista de tecnologías con logos** (React, Node, Tailwind). Al cliente no le dice nada y te hace ver como empleado buscando trabajo, no como proveedor.
- **Precios ocultos detrás de "consultar"** sin ninguna referencia. Genera fricción y filtra mal.
- **Testimonios inventados.** Es mejor no tener ninguno que tener uno falso.
- **Formularios largos** con presupuesto, plazo, tipo de proyecto y diez campos más.
- **Blog vacío** o con dos entradas de hace un año. Peor que no tenerlo.
- **Animaciones excesivas** que retrasan la carga y distraen del mensaje.
- **Portfolio como galería sin contexto.** Capturas lindas sin explicar qué problema resolvieron.

---

## 11. Checklist previo a publicar

- [ ] El titular del hero explica qué hacés sin jerga técnica.
- [ ] Hay un solo llamado a la acción principal, repetido arriba y abajo.
- [ ] Los precios (o rangos) están visibles.
- [ ] El proceso de trabajo está explicado en pasos.
- [ ] Hay al menos 2-3 trabajos con contexto, no solo imágenes.
- [ ] El formulario fue probado y llegan los mensajes.
- [ ] El enlace de WhatsApp funciona y abre con mensaje predefinido.
- [ ] Se ve bien en un celular real, no solo en el emulador del navegador.
- [ ] Carga en menos de 3 segundos.
- [ ] Analytics está instalado y registrando.
- [ ] Al compartir el link por WhatsApp se ve la previsualización correcta.
- [ ] Los textos coinciden con lo que dicen los contratos.

---

## Decisiones tomadas en la planificación (2026-09-15)

Confirmadas con el usuario:

1. **i18n:** eliminar sistema bilingüe. Todo el sitio en español.
2. **Routing:** mantener SPA con secciones ancla (sin React Router).
3. **Datos CV:** eliminar secciones de trayectoria, educación, certificaciones y habilidades técnicas.
4. **Contacto:** formulario simple (vía servicio de email) + WhatsApp con mensaje predefinido.
5. **Diseño:** mantener el tema Dark & Modern existente.
6. **Precios:** usar placeholders temporalmente; el usuario los proveerá luego.
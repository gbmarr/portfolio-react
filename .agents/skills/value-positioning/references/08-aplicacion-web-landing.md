# 08 · Aplicación concreta a landing pages y sitios web

Traduce el framework (01-07) a elementos concretos de una página.

## Estructura recomendada (de arriba hacia abajo)
1. **Hero / headline**: agita el dolor o nombra el deseo específico (`03`), no describe la categoría de producto. Subtítulo aclara a quién es (`07`) y qué transformación promete.
2. **Agitación breve** (opcional, según nivel de conciencia — `02`): 1-3 líneas que profundizan el problema antes de pasar a la solución, si la audiencia no está ya buscando activamente.
3. **La solución / propuesta**: qué es, en términos de resultado, no de features.
4. **Autoridad/prueba**: específica y verificable (`04`), cerca de donde se pide la decisión, no escondida al final.
5. **Qué incluye** (características): recién acá, subordinado a la promesa ya establecida arriba — no como apertura.
6. **Condiciones de acceso y precio**: con el framing de `05` y `06` (cupos, criterio, precio firme).
7. **Objeciones / FAQ**: resolver las dudas reales (identificadas con clientes reales, no inventadas).
8. **CTA final**: acción concreta, con urgencia solo si es real.

## Señales a buscar en una auditoría de sitio existente
- **Headline**: ¿describe la categoría ("Clases de X", "Agencia de Y") o agita/promete? → ver `03`.
- **Hero visual**: ¿la imagen/video refuerza la transformación prometida o es genérica de stock?
- **"Sobre nosotros"**: ¿lista años/certificaciones genéricas o cuenta autoridad específica y una razón de ser creíble? → ver `04`.
- **Página de precios**: ¿el precio está justificado por resultado/escasez o solo listado sin contexto? ¿hay descuentos permanentes que erosionan la señal de valor? → ver `05`.
- **Formulario de contacto / CTA**: ¿el tono es de súplica ("contactanos para lo que necesites") o seguro y con próximo paso claro?
- **Disponibilidad mostrada**: ¿comunica "siempre disponible, cualquier horario" (❌) o cupos/capacidad reales (✅)? → ver `06`.
- **Testimonios**: ¿genéricos ("excelente servicio") o específicos con resultado nombrado?
- **Velocidad de respuesta/urgencia**: ¿hay algún elemento de urgencia real (fecha límite real, cupo real) o todo es atemporal y siempre disponible?

## Primera pasada heurística con el script
`scripts/copy-scan.py` escanea un archivo de texto o HTML (de una página guardada localmente) en busca de:
- Frases de señal de necesidad frecuentes ("sin compromiso", "para todos", "horario flexible", "contactanos sin compromiso", "precios económicos", etc.).
- Ausencia de marcadores de señal de valor (ninguna mención de escasez/cupos, ninguna cifra o resultado específico, ausencia de nombre propio/rol en la autoridad).
No reemplaza el análisis cualitativo — es un punto de partida para no pasar por alto frases reveladoras en textos largos.

```bash
python3 scripts/copy-scan.py ruta/al/archivo.html
python3 scripts/copy-scan.py ruta/al/texto.txt
```

## Nota sobre sitios en producción
Esta skill no incluye un crawler ni hace scraping de sitios en vivo. Para auditar un sitio publicado: pedirle al usuario el texto/HTML relevante, o usar las herramientas de navegación/fetch disponibles en la conversación (si las hay) para traer el contenido, y luego aplicar el framework manualmente o con el script sobre ese contenido.

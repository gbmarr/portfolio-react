#!/usr/bin/env python3
"""
copy-scan.py - Primera pasada heuristica sobre un texto/HTML de marketing
para detectar senales de necesidad vs. senales de valor (ver references/06).

NO reemplaza el analisis cualitativo del framework. Es un punto de partida
para no pasar por alto frases reveladoras en textos largos.

Uso:
    python3 copy-scan.py archivo.html
    python3 copy-scan.py archivo.txt
    cat texto.txt | python3 copy-scan.py -
"""
import re
import sys
import html as htmllib

NEED_SIGNALS = [
    (r"\bsin compromiso\b", "Condición de acceso — 'sin compromiso' como argumento de venta"),
    (r"\bhorario(s)? (totalmente )?flexible", "Condición de acceso — disponibilidad total"),
    (r"\bpara todos\b|\btodas las edades\b|\btodo p[uú]blico\b", "Audiencia — mensaje genérico, no específico"),
    (r"\bprecios? (económic|accesible|bajo|barato)", "Precio — se vende por precio bajo, no por valor"),
    (r"\bdescuento\b.{0,15}(permanente|todo el año|siempre)", "Precio — descuento permanente erosiona la señal de escasez"),
    (r"\bno dud(es|e) en contact", "Tono — tono de súplica / exceso de accesibilidad"),
    (r"\bcualquier duda\b|\bescrib[ií]me.{0,10}(cuando|si)\b", "Tono — exceso de disponibilidad/accesibilidad"),
    (r"\bm[aá]s de \d+ a[nñ]os de experiencia\b", "Autoridad — afirmación genérica de antigüedad, sin especificidad"),
    (r"\b(el|la) mejor\b.{0,20}(precio|opci[oó]n|servicio)", "Posicionamiento — competir por precio/genérico en vez de por valor"),
    (r"\bdisponible (todo el (a[nñ]o|d[ií]a)|siempre)\b", "Condición de acceso — disponibilidad total"),
    (r"\bno hace falta\b.{0,25}(experiencia previa|nada)", "Mensaje — reduce barreras pero sin promesa de transformación clara"),
]

VALUE_SIGNALS = [
    (r"\b(solo|únicamente) \d+ (plazas|cupos|lugares|alumnos)", "Escasez real explícita"),
    (r"\bquedan? \d+ (plazas|cupos|lugares)", "Escasez real explícita"),
    (r"\blista de espera\b", "Escasez / demanda real"),
    (r"\bprofesional (en|de|del)\b", "Autoridad específica (rol/afiliación concreta)"),
    (r"\bcertificad[oa]\b", "Autoridad — credencial"),
    (r"\b\d+% (de|más)\b|\b\d+ (alumnos|clientes|casos)\b", "Resultado/prueba con cifra específica"),
    (r"\?(.{0,80})", "Headline en forma de pregunta (posible gancho de dolor) — revisar manualmente"),
]

AUTHORITY_GENERIC_ONLY = re.compile(
    r"\bexperiencia\b", re.IGNORECASE
)
AUTHORITY_SPECIFIC = re.compile(
    r"\b(profesional en|certificad|premio|reconocid|public|medios?)\b", re.IGNORECASE
)

PRICE_RE = re.compile(r"(\d+)\s*€|\€\s*(\d+)|\$\s*(\d+)")

def strip_html(text: str) -> str:
    if "<" in text and ">" in text:
        text = re.sub(r"<script.*?</script>", " ", text, flags=re.S | re.I)
        text = re.sub(r"<style.*?</style>", " ", text, flags=re.S | re.I)
        text = re.sub(r"<[^>]+>", " ", text)
        text = htmllib.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def find_matches(text, patterns):
    results = []
    for pattern, label in patterns:
        for m in re.finditer(pattern, text, flags=re.IGNORECASE):
            start = max(0, m.start() - 40)
            end = min(len(text), m.end() + 40)
            snippet = text[start:end].strip()
            results.append((label, snippet))
    return results


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)

    src = sys.argv[1]
    raw = sys.stdin.read() if src == "-" else open(src, encoding="utf-8", errors="ignore").read()
    text = strip_html(raw)

    print(f"== copy-scan: {src} ({len(text)} caracteres de texto limpio) ==\n")

    need = find_matches(text, NEED_SIGNALS)
    value = find_matches(text, VALUE_SIGNALS)

    print(f"######## SEÑALES DE NECESIDAD (❌) — {len(need)} coincidencias ########")
    if not need:
        print("  (ninguna detectada por las heurísticas)")
    for label, snippet in need[:30]:
        print(f"  - [{label}]\n    ...{snippet}...")

    print(f"\n######## SEÑALES DE VALOR (✅) — {len(value)} coincidencias ########")
    if not value:
        print("  (ninguna detectada — revisar si falta escasez/autoridad/prueba específica real)")
    for label, snippet in value[:30]:
        print(f"  - [{label}]\n    ...{snippet}...")

    print("\n######## PRECIO ########")
    prices = PRICE_RE.findall(text)
    flat_prices = [p for tup in prices for p in tup if p]
    if flat_prices:
        print(f"  Menciones de precio detectadas: {', '.join(flat_prices[:10])}")
    else:
        print("  No se detectó un precio explícito en el texto.")

    print("\n######## AUTORIDAD: ¿genérica o específica? ########")
    has_generic = bool(AUTHORITY_GENERIC_ONLY.search(text))
    has_specific = bool(AUTHORITY_SPECIFIC.search(text))
    if has_specific:
        print("  Se detectaron posibles marcadores de autoridad específica (revisar si son verificables).")
    elif has_generic:
        print("  Solo se detectó lenguaje genérico de 'experiencia' sin especificidad aparente. Candidato a reforzar (ver references/04).")
    else:
        print("  No se detectaron marcadores claros de autoridad. Candidato a reforzar (ver references/04).")

    print("\n== Fin del escaneo heurístico. Completar el análisis con el checklist de references/06-senales-necesidad-vs-valor.md ==")


if __name__ == "__main__":
    main()

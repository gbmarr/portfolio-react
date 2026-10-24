/**
 * Genera los assets servidos en `public/images/` a partir de los originales
 * guardados en `assets/images-src/` (fuera del deploy).
 *
 * Uso: npm run images:optimize
 *
 * Los anchos corresponden al tamaño real de render x2 (DPR alto):
 *  - Mockup phone: `max-w-[190px]` -> 380w (1x denso) y 760w (2x)
 *  - AboutShort: `h-36 w-36` (144px) -> 288w
 */
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SRC_DIR = fileURLToPath(new URL('../assets/images-src/', import.meta.url))
const OUT_DIR = fileURLToPath(new URL('../public/images/', import.meta.url))
const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url))

const WEBP = { quality: 78, effort: 6 }

/** Imágenes a recomprimir: nombre de salida + anchos disponibles. */
const TARGETS = [
  { file: 'dranes-cap.png', name: 'dranes-cap', widths: [380, 760] },
  { file: 'pasion-cap-1.png', name: 'pasion-cap-1', widths: [190, 380] },
  { file: 'profile-photo.webp', name: 'profile-photo', widths: [288] },
]

/** Open Graph: 1200x630, captura centrada sobre el fondo del sitio. */
const OG = { file: 'pasion-cap-1.png', name: 'og-image.jpg', width: 1200, height: 630 }

async function sizeOf(path) {
  try {
    return (await stat(path)).size
  } catch {
    return 0
  }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`

await mkdir(OUT_DIR, { recursive: true })

const available = new Set(await readdir(SRC_DIR))
const rows = []

for (const target of TARGETS) {
  if (!available.has(target.file)) {
    rows.push([target.file, 'ORIGINAL FALTANTE', ''])
    continue
  }

  const input = join(SRC_DIR, target.file)
  const original = await sizeOf(input)
  const meta = await sharp(input).metadata()

  for (const width of target.widths) {
    const output = join(OUT_DIR, `${target.name}-${width}.webp`)
    await sharp(input).resize({ width, withoutEnlargement: true }).webp(WEBP).toFile(output)
    rows.push([
      `${basename(output)} (${width}w de ${meta.width}px)`,
      kb(original),
      kb(await sizeOf(output)),
    ])
  }
}

if (available.has(OG.file)) {
  const input = join(SRC_DIR, OG.file)
  const original = await sizeOf(input)
  const shotHeight = OG.height - 64
  const shot = await sharp(input).resize({ height: shotHeight }).toBuffer()

  await sharp({
    create: {
      width: OG.width,
      height: OG.height,
      channels: 3,
      background: { r: 15, g: 23, b: 42 },
    },
  })
    .composite([{ input: shot, gravity: 'center' }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT_DIR, OG.name))

  rows.push([OG.name, kb(original), kb(await sizeOf(join(OUT_DIR, OG.name)))])
}

// iOS no admite transparencia en el icono de inicio: lo aplanamos sobre el fondo.
const iconSource = join(PUBLIC_DIR, 'favicon.svg')
if ((await sizeOf(iconSource)) > 0) {
  const icon = await sharp(iconSource).resize({ width: 120, height: 120 }).png().toBuffer()

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 3,
      background: { r: 15, g: 23, b: 42 },
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(join(PUBLIC_DIR, 'apple-touch-icon.png'))

  rows.push([
    'apple-touch-icon.png',
    kb(await sizeOf(iconSource)),
    kb(await sizeOf(join(PUBLIC_DIR, 'apple-touch-icon.png'))),
  ])
}

console.log('\nArchivo / origen            antes        después')
console.log('-'.repeat(58))
for (const [name, before, after] of rows) {
  console.log(`${name.padEnd(28)}${before.padEnd(13)}${after}`)
}
console.log('')

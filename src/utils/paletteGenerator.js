// Génération de palettes par harmonie de couleurs (sans dépendance).
// Une palette = 5 couleurs hex dérivées d'une couleur de base.

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = clamp(s, 0, 100) / 100
  l = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) { [r, g, b] = [c, x, 0] }
  else if (h < 120) { [r, g, b] = [x, c, 0] }
  else if (h < 180) { [r, g, b] = [0, c, x] }
  else if (h < 240) { [r, g, b] = [0, x, c] }
  else if (h < 300) { [r, g, b] = [x, 0, c] }
  else { [r, g, b] = [c, 0, x] }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export const HARMONIES = [
  { id: 'mono', name: 'Monochrome' },
  { id: 'analogous', name: 'Analogues' },
  { id: 'complementary', name: 'Complémentaire' },
  { id: 'triadic', name: 'Triadique' }
]

// Couleur de nom automatique, toujours lisible sur le fond donné.
// 'bw' : noir ou blanc pur (contraste maximal).
// 'adapted' : même teinte que le fond, très claire sur fond sombre ou très
// sombre sur fond clair (accordée au fond, contraste fort).
export function autoNameColor(bgHex, mode = 'adapted') {
  const bg = (bgHex && bgHex.startsWith('#') && bgHex.length === 7) ? bgHex : '#6c757d'
  const r = parseInt(bg.slice(1, 3), 16)
  const g = parseInt(bg.slice(3, 5), 16)
  const b = parseInt(bg.slice(5, 7), 16)
  const toLinear = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const isDark = (0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)) <= 0.35
  if (mode === 'bw') return isDark ? '#ffffff' : '#000000'
  const { h, s } = hexToHsl(bg)
  // Fond (quasi) gris : nom gris aussi, on n'invente pas de teinte.
  const sat = s < 15 ? s : Math.min(s, 65)
  return isDark ? hslToHex(h, sat, 88) : hslToHex(h, sat, 15)
}

const contrast = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5 ? '#000000' : '#ffffff'
}

// Couleurs du player (les 10 COLOR_KEYS) accordées à une couleur principale
// et à l'harmonie choisie. Entièrement DÉTERMINISTE : indispensable pour
// l'application en direct (pas de clignotement pendant le glissement du
// sélecteur) et pour rester fidèle au mode (un monochrome reste monochrome
// jusque dans le player — play et stop s'y distinguent par la luminosité).
// Le thème sombre/clair découle de la luminosité de la couleur principale.
export function playerColorsFromBase(baseHex, harmony = 'analogous') {
  const { h, s, l } = hexToHsl(baseHex)
  // Base (quasi) achromatique (noir, blanc, gris) : on n'invente pas de
  // saturation, tout reste en niveaux de gris.
  const achro = s < 15
  const sat = achro ? s : Math.min(Math.max(s, 45), 70)
  const dark = l < 55
  const accents = {
    mono: { title: 0, play: 0, stop: 0 },
    analogous: { title: 30, play: 30, stop: -30 },
    complementary: { title: 180, play: 0, stop: 180 },
    triadic: { title: 120, play: 120, stop: 240 }
  }
  const a = accents[harmony] ?? accents.analogous
  const play = hslToHex(h + a.play, sat, 52)
  const stop = hslToHex(h + a.stop, sat, harmony === 'mono' ? 30 : 52)
  return {
    bgColor: dark ? hslToHex(h, Math.min(sat, 50), 8) : hslToHex(h, Math.min(sat, 40), 93),
    playerBgColor: dark ? hslToHex(h, sat, 24) : hslToHex(h, sat, 68),
    playerElmtsColor: dark ? hslToHex(h, achro ? s : 15, 72) : hslToHex(h, achro ? s : 18, 28),
    playerTitleColor: hslToHex(h + a.title, achro ? s : Math.min(sat + 15, 90), dark ? 66 : 32),
    playerBtnPlayColor: play,
    playerBtnPlayIconColor: contrast(play),
    playerBtnStopColor: stop,
    playerBtnStopColorInactif: hslToHex(h + a.stop, achro ? s : Math.max(sat - 20, 20), dark ? 22 : 40),
    playerBtnStopIconColor: contrast(stop),
    playerBtnStopIconColorInactif: dark ? '#a3a3a3' : '#6c757d'
  }
}

// Retourne 5 couleurs hex à partir d'une couleur de base et d'un type d'harmonie.
export function generatePalette(baseHex, harmony) {
  const { h, s: s0 } = hexToHsl(baseHex)
  // Saturation lisible si la base est terne — mais une base (quasi)
  // achromatique (noir, blanc, gris) reste en niveaux de gris.
  const s = s0 < 15 ? s0 : Math.max(s0, 45)
  switch (harmony) {
    case 'mono':
      return [30, 44, 58, 70, 82].map((l) => hslToHex(h, s, l))
    case 'analogous':
      return [-40, -20, 0, 20, 40].map((dh) => hslToHex(h + dh, s, 58))
    case 'complementary':
      return [
        hslToHex(h, s, 45),
        hslToHex(h, s, 65),
        hslToHex(h, s, 80),
        hslToHex(h + 180, s, 50),
        hslToHex(h + 180, s, 68)
      ]
    case 'triadic':
      return [
        hslToHex(h, s, 52),
        hslToHex(h + 120, s, 52),
        hslToHex(h + 240, s, 52),
        hslToHex(h, s, 72),
        hslToHex(h + 120, s, 72)
      ]
    default:
      return [hslToHex(h, s, 50)]
  }
}

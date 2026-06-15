// Génère un THÈME aléatoire = uniquement de la structure (STYLE_KEYS) :
// polices, tailles, layout, placements… Aucune couleur (les couleurs sont
// du ressort des palettes).

const rnd = (min, max) => Math.random() * (max - min) + min
const rndInt = (min, max) => Math.floor(rnd(min, max + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const chance = (p = 0.5) => Math.random() < p

export function randomTheme(fonts) {
  const num = (v) => String(v)
  return {
    playerCoinsArrondis: chance(),
    playerBgGradient: chance(0.4),
    playerFontFamily: pick(fonts),
    playerFontSize: rnd(1.3, 2.6).toFixed(1),
    playerFontBold: chance(),
    playerBtnsBottom: chance(0.3),
    playerBtnsTopRounded: chance(),
    playerBtnPlayAtEnd: chance(0.3),
    playerBtnsRounded: chance(0.7),
    playerBtnsHeight: num(rndInt(1, 3)),
    playerBtnsIconsSize: num(rndInt(1, 3)),
    listFullWidth: chance(0.3),
    listRadioRounded: chance(0.7),
    listRadioGradient: chance(0.4),
    listRadioNameCenter: chance(0.4),
    listRadioIMasked: chance(0.3),
    listRadioMargin: num(rndInt(0, 3)),
    listRadioPadding: num(rndInt(1, 3)),
    listRadioNameFont: pick(fonts),
    listRadioNameSize: rnd(1.0, 1.8).toFixed(1),
    listRadioNameBold: chance(0.6),
    listFolderNameBold: chance(0.5),
    listRadioNameShadows: chance(0.3),
    listRadioNameLetterSpacing: chance(0.7) ? '0' : rnd(0.02, 0.12).toFixed(2)
  }
}

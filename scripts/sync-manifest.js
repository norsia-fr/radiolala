const fs = require('fs')
const path = require('path')

const pkgPath = path.resolve(__dirname, '../package.json')
const manifestPath = path.resolve(__dirname, '../public/manifest.json')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

if (manifest.version === pkg.version) {
  console.log(`[sync-manifest] manifest.json déjà à jour (v${pkg.version})`)
  process.exit(0)
}

const previous = manifest.version
manifest.version = pkg.version
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
console.log(`[sync-manifest] manifest.json: v${previous} → v${pkg.version}`)

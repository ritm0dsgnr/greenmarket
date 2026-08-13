import { cp, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const rootDirectory = path.resolve(scriptDirectory, '..')
const sourcePath = path.join(rootDirectory, 'src', 'assets', 'icons', 'sprite.svg')
const targetDirectory = path.join(rootDirectory, 'public', 'img')
const targetPath = path.join(targetDirectory, 'sprite.svg')

const forbiddenContent = [
  /<script\b/i,
  /<style\b/i,
  /<foreignObject\b/i,
  /<(?:animate|animateMotion|animateTransform|image|set|use)\b/i,
  /<a\b/i,
  /\son[a-z]+\s*=/i,
  /\sstyle\s*=/i,
  /(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/|data:)/i,
  /url\(\s*(?:https?:|\/\/|data:)/i,
  /<!DOCTYPE/i,
  /<!ENTITY/i,
]

const sprite = await readFile(sourcePath, 'utf8')

if (!sprite.includes('<svg') || !sprite.includes('</svg>')) {
  throw new Error('SVG sprite must have one root <svg> element.')
}

if (forbiddenContent.some((pattern) => pattern.test(sprite))) {
  throw new Error('SVG sprite contains prohibited active or external content.')
}

const symbols = [...sprite.matchAll(/<symbol\s+([^>]+)>/g)]

if (symbols.length === 0) {
  throw new Error('SVG sprite must include at least one symbol.')
}

const symbolIds = new Set<string>()

for (const [, attributes] of symbols) {
  const id = /\bid=["']([a-z0-9-]+)["']/.exec(attributes ?? '')?.[1]
  const viewBox = /\bviewBox=["'][^"']+["']/.test(attributes ?? '')

  if (!id || !viewBox || symbolIds.has(id)) {
    throw new Error('Each SVG symbol must have a unique kebab-case id and a viewBox.')
  }

  symbolIds.add(id)
}

await mkdir(targetDirectory, { recursive: true })
await cp(sourcePath, targetPath)

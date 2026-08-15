import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function IconSprite() {
  const spritePath = path.join(process.cwd(), 'src/assets/icons/sprite.svg')
  const sprite = await readFile(spritePath, 'utf8')
  const html = sprite.replace(
    '<svg xmlns="http://www.w3.org/2000/svg">',
    '<svg xmlns="http://www.w3.org/2000/svg" class="icon-sprite" aria-hidden="true" focusable="false">',
  )

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

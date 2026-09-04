/**
 * Temporary visual fixtures for catalog cards until CMS/admin images exist.
 * Keys are the last path segment of `/catalog/...` (category or subcategory slug).
 */
const catalogCardImagesBySlug: Record<string, string> = {
  'plodovo-yagodnye': '/img/catalog/plodovo-yagodnye.png',
  hvoynye: '/img/catalog/hvoynye.png',
  gortenzii: '/img/catalog/gortenzii.png',
  rozy: '/img/catalog/rozy.png',
  mnogoletniki: '/img/catalog/mnogoletniki.png',
  lukovichnye: '/img/catalog/lukovichnye.png',
  knyazhik: '/img/catalog/knyazhik.png',
  liliya: '/img/catalog/liliya.png',
  pion: '/img/catalog/pion.png',
  siren: '/img/catalog/siren.png',
}

const PLACEHOLDER = '/img/placeholder.svg'

export function catalogCardImageSrc(href: string) {
  const slug = href.replace(/\/+$/, '').split('/').filter(Boolean).at(-1)

  if (!slug) {
    return PLACEHOLDER
  }

  return catalogCardImagesBySlug[slug] ?? PLACEHOLDER
}

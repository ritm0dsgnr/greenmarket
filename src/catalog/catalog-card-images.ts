/**
 * Temporary visual fixtures for catalog cards until CMS/admin images exist.
 * Keys are the last path segment of `/catalog/...` (category or subcategory slug).
 * Filename revision (`.20260904`) is bumped when photos are replaced, so Next/Image
 * does not keep a stale optimized copy of the same path.
 */
const catalogCardImagesBySlug: Record<string, string> = {
  'plodovo-yagodnye': '/img/catalog/plodovo-yagodnye.20260904.png',
  hvoynye: '/img/catalog/hvoynye.20260904.png',
  gortenzii: '/img/catalog/gortenzii.20260904.png',
  rozy: '/img/catalog/rozy.20260904.png',
  mnogoletniki: '/img/catalog/mnogoletniki.20260904.png',
  lukovichnye: '/img/catalog/lukovichnye.20260904.png',
  'pryanye-travy': '/img/catalog/pryanye-travy.20260904.png',
  'zlaki-i-travy': '/img/catalog/zlaki-i-travy.20260904.png',
  knyazhik: '/img/catalog/knyazhik.20260904.png',
  liliya: '/img/catalog/liliya.20260904.png',
  pion: '/img/catalog/pion.20260904.png',
  siren: '/img/catalog/siren.20260904.png',
  grusha: '/img/catalog/grusha.20260904.png',
  kalina: '/img/catalog/kalina.20260904.png',
  lileynik: '/img/catalog/lileynik.20260904.png',
  sosna: '/img/catalog/sosna.20260904.png',
  hosta: '/img/catalog/hosta.20260904.png',
}

const PLACEHOLDER = '/img/placeholder.svg'

export function catalogCardImageSrc(href: string) {
  const slug = href.replace(/\/+$/, '').split('/').filter(Boolean).at(-1)

  if (!slug) {
    return PLACEHOLDER
  }

  return catalogCardImagesBySlug[slug] ?? PLACEHOLDER
}

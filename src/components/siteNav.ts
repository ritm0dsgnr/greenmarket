export const siteSearchRoute = '/search'

export const siteInfoRoutes = {
  delivery: '/delivery',
  certificates: '/certificates',
  bonusProgram: '/bonus-program',
  price: '/price',
  reviews: '/reviews',
} as const

export const siteBlogRoute = '/blog'

/** Deep links into journal filters — one URL each, not repeated on every card. */
export const siteBlogRoutes = {
  root: siteBlogRoute,
  events: `${siteBlogRoute}?type=events`,
  news: `${siteBlogRoute}?type=news`,
  articles: `${siteBlogRoute}?type=articles`,
} as const

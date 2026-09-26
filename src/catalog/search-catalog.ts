export const SEARCH_QUERY_MAX_LENGTH = 80
export const SEARCH_QUERY_MIN_LENGTH = 2

export type SearchableProduct = {
  name: string
  latin?: string
  nameTag?: string
  available?: boolean
}

export function normalizeSearchText(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»„“”"']/g, '')
    .replace(/\s+/g, ' ')
}

export function parseSearchQuery(
  raw: string | string[] | undefined,
  maxLength = SEARCH_QUERY_MAX_LENGTH,
) {
  const value = Array.isArray(raw) ? raw[0] : raw

  if (!value) {
    return ''
  }

  return normalizeSearchText(value).slice(0, maxLength)
}

export function catalogSearchPath(raw: string | string[] | undefined) {
  const query = parseSearchQuery(raw)

  if (query.length < SEARCH_QUERY_MIN_LENGTH) {
    return '/catalog'
  }

  return `/catalog?q=${encodeURIComponent(query)}`
}

function maxEditDistance(queryLength: number) {
  if (queryLength <= 4) {
    return 1
  }

  if (queryLength <= 8) {
    return 2
  }

  return 3
}

/** Levenshtein with early exit when distance exceeds `limit`. */
export function editDistance(left: string, right: string, limit = Number.POSITIVE_INFINITY) {
  if (left === right) {
    return 0
  }

  const leftLength = left.length
  const rightLength = right.length

  if (Math.abs(leftLength - rightLength) > limit) {
    return limit + 1
  }

  if (leftLength === 0) {
    return rightLength
  }

  if (rightLength === 0) {
    return leftLength
  }

  let previous = Array.from({ length: rightLength + 1 }, (_, index) => index)
  let current = new Array<number>(rightLength + 1)

  for (let i = 1; i <= leftLength; i += 1) {
    current[0] = i
    let rowMin = current[0]!

    for (let j = 1; j <= rightLength; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      const value = Math.min(
        previous[j]! + 1,
        current[j - 1]! + 1,
        previous[j - 1]! + cost,
      )
      current[j] = value
      if (value < rowMin) {
        rowMin = value
      }
    }

    if (rowMin > limit) {
      return limit + 1
    }

    ;[previous, current] = [current, previous]
  }

  return previous[rightLength]!
}

function bestTokenDistance(haystack: string, query: string, limit: number) {
  if (haystack.includes(query)) {
    return 0
  }

  let best = limit + 1
  const tokens = haystack.split(' ').filter(Boolean)

  for (const token of tokens) {
    if (token.includes(query)) {
      return 0
    }

    if (query.includes(token) && token.length >= SEARCH_QUERY_MIN_LENGTH) {
      best = Math.min(best, query.length - token.length)
      continue
    }

    const direct = editDistance(token, query, limit)
    if (direct < best) {
      best = direct
    }

    // Опечатка только в начале слова и только для длинного запроса.
    // Иначе «пион» цепляет «пихта» / «спирея» / «хионодокса» по срезу из 4 букв.
    if (token.length > query.length && query.length >= 5) {
      const prefix = token.slice(0, query.length)
      const distance = editDistance(prefix, query, limit)
      if (distance < best) {
        best = distance
      }
    }

    if (best === 0) {
      return 0
    }
  }

  return best
}

/** Lower score is better. `null` means no match. */
export function searchMatchScore(product: SearchableProduct, query: string) {
  if (query.length < SEARCH_QUERY_MIN_LENGTH) {
    return null
  }

  const haystack = [product.name, product.latin, product.nameTag]
    .filter((part): part is string => Boolean(part))
    .map((part) => normalizeSearchText(part))
    .join(' ')

  if (!haystack) {
    return null
  }

  const parts = query.split(' ').filter(Boolean)
  const limit = maxEditDistance(query.length)
  let total = 0

  for (const part of parts) {
    const partLimit = maxEditDistance(part.length)
    const distance = bestTokenDistance(haystack, part, partLimit)
    if (distance > partLimit) {
      return null
    }
    total += distance
  }

  if (total > limit && parts.length === 1) {
    return null
  }

  return total
}

export function productMatchesSearch(product: SearchableProduct, query: string) {
  return searchMatchScore(product, query) != null
}

export function filterProductsBySearch<T extends SearchableProduct>(
  products: readonly T[],
  query: string,
) {
  if (query.length < SEARCH_QUERY_MIN_LENGTH) {
    return []
  }

  return products
    .map((product) => ({ product, score: searchMatchScore(product, query) }))
    .filter((entry): entry is { product: T; score: number } => entry.score != null)
    .sort((left, right) => {
      const leftAvailable = left.product.available !== false
      const rightAvailable = right.product.available !== false

      if (leftAvailable !== rightAvailable) {
        return leftAvailable ? -1 : 1
      }

      if (left.score !== right.score) {
        return left.score - right.score
      }

      return left.product.name.localeCompare(right.product.name, 'ru')
    })
    .map((entry) => entry.product)
}

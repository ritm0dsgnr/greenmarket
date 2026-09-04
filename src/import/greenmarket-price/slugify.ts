const translitMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

export function slugify(value: string) {
  const lower = value.trim().toLowerCase()
  let result = ''

  for (const char of lower) {
    if (translitMap[char]) {
      result += translitMap[char]
      continue
    }

    if (/[a-z0-9]/.test(char)) {
      result += char
      continue
    }

    if (/\s|[-_/.,]/.test(char)) {
      result += '-'
    }
  }

  return result.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'item'
}

export function uniqueSlug(base: string, used: Set<string>) {
  let slug = slugify(base)
  let suffix = 2

  while (used.has(slug)) {
    slug = `${slugify(base)}-${suffix}`
    suffix += 1
  }

  used.add(slug)
  return slug
}

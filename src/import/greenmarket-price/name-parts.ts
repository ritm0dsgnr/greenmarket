export type NameParts = {
  firstWord: string
  secondWord: string
}

function normalizeNameForSplit(name: string) {
  return name
    .replace(/"[^"]*"/g, ' ')
    .replace(/'[^']*'/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanWord(word: string) {
  return word.replace(/^[,.;:!?«»"']+|[,.;:!?«»"']+$/g, '').trim()
}

export function extractNameParts(name: string): NameParts {
  const words = normalizeNameForSplit(name)
    .split(/\s+/)
    .map(cleanWord)
    .filter(Boolean)

  return {
    firstWord: words[0] ?? '',
    secondWord: words[1] ?? '',
  }
}

export function capitalizeWord(word: string) {
  if (!word) {
    return word
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function subcategoryLabelFromFirstWord(firstWord: string, sampleName: string) {
  if (!firstWord) {
    return ''
  }

  const match = sampleName.match(new RegExp(`^${firstWord}`, 'i'))

  if (match) {
    return sampleName.slice(0, match[0].length)
  }

  return capitalizeWord(firstWord)
}

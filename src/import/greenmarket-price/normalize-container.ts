/**
 * Excel often mixes Latin and Cyrillic lookalikes in container codes
 * (С2 vs C2, Р9 vs P9). Normalize to Latin letters for display and filters.
 */
export function normalizeContainerValue(value: string) {
  return value.replaceAll('С', 'C').replaceAll('с', 'C').replaceAll('Р', 'P').replaceAll('р', 'P')
}

export function normalizeSpecFilterValue(label: string, value: string) {
  if (label === 'Контейнер') {
    return normalizeContainerValue(value)
  }

  return value
}

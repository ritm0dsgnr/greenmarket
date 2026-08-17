const hangingWords = [
  'и',
  'а',
  'но',
  'да',
  'или',
  'либо',
  'в',
  'во',
  'на',
  'с',
  'со',
  'к',
  'ко',
  'о',
  'об',
  'обо',
  'от',
  'до',
  'по',
  'про',
  'при',
  'за',
  'из',
  'без',
  'для',
  'над',
  'под',
  'у',
  'не',
  'ни',
  'же',
  'бы',
  'ли',
  'через',
].join('|')

const hangingPattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${hangingWords})\\s+`, 'giu')

export function bindHangingWords(text: string) {
  return text.replace(hangingPattern, `$1$2\u00A0`)
}

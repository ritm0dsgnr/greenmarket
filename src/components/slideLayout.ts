export const desktopSlideSpanRem = 34.5
export const slideGapRem = 1.6
export const mobileBreakpointPx = 768
export const tabletBreakpointPx = 1024

export function slideLayout(
  viewportWidth: number,
  desktopSpan: number,
  gap: number,
  windowWidth: number,
) {
  const width = Math.max(0, viewportWidth)
  const pack = (count: number) => desktopSpan * count + gap * Math.max(0, count - 1)

  if (width < 1) {
    return { visible: 1, span: 0 }
  }

  if (windowWidth <= mobileBreakpointPx) {
    return { visible: 2, span: Math.max(1, (width - gap) / 2) }
  }

  if (windowWidth <= tabletBreakpointPx) {
    return { visible: 2, span: Math.max(1, (width - gap) / 2) }
  }

  if (width + 0.5 >= pack(4)) {
    return { visible: 4, span: desktopSpan }
  }

  if (width + 0.5 >= pack(2)) {
    return { visible: 2, span: Math.max(1, (width - gap) / 2) }
  }

  return { visible: 1, span: width }
}

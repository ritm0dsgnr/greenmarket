/** Card title for a one-product subcategory: full name without cultivar quotes. */
export function stripQuotedNameParts(name: string) {
  return name
    .replace(/"[^"]*"/g, ' ')
    .replace(/'[^']*'/g, ' ')
    .replace(/«[^»]*»/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function subcategoryCardTitle(subcategory: {
  label: string
  products: ReadonlyArray<{ name: string }>
}) {
  if (subcategory.products.length === 1) {
    const name = subcategory.products[0]?.name
    return (name ? stripQuotedNameParts(name) : '') || subcategory.label
  }

  return subcategory.label
}

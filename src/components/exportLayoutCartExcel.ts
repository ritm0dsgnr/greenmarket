import {
  layoutCartCount,
  layoutCartDiscount,
  layoutCartTotal,
  type LayoutCartLine,
} from './layoutCart'
import {
  siteAddressShort,
  siteBrandCaps,
  siteGardenName,
  siteHours,
  siteMapsHref,
  sitePhone,
  siteVkHref,
} from './siteContacts'

type SheetCell =
  | { type: 'text'; value: string; style?: number }
  | { type: 'number'; value: number; style?: number }
  | { type: 'formula'; formula: string; value: number; style?: number }

const encoder = new TextEncoder()

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff

  for (const byte of data) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function u16(value: number) {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value, true)
  return bytes
}

function u32(value: number) {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value, true)
  return bytes
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0

  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }

  return out
}

function zipStore(files: Array<{ name: string; data: Uint8Array }>) {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const crc = crc32(file.data)
    const header = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      name,
    ])
    const local = concat([header, file.data])

    centrals.push(
      concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(file.data.length),
        u32(file.data.length),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name,
      ]),
    )
    locals.push(local)
    offset += local.length
  }

  const localPart = concat(locals)
  const centralPart = concat(centrals)
  const end = concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralPart.length), u32(localPart.length), u16(0)])

  return concat([localPart, centralPart, end])
}

function cellRef(row: number, col: number) {
  return `${String.fromCharCode(65 + col)}${row}`
}

function sheetCellXml(row: number, col: number, cell: SheetCell) {
  const style = cell.style ? ` s="${cell.style}"` : ''

  if (cell.type === 'number') {
    return `<c r="${cellRef(row, col)}"${style} t="n"><v>${cell.value}</v></c>`
  }

  if (cell.type === 'formula') {
    return `<c r="${cellRef(row, col)}"${style}><f>${xmlEscape(cell.formula)}</f><v>${cell.value}</v></c>`
  }

  return `<c r="${cellRef(row, col)}"${style} t="inlineStr"><is><t>${xmlEscape(cell.value)}</t></is></c>`
}

function sheetRowXml(row: number, cells: Array<SheetCell | undefined>, height?: number) {
  const xml = cells
    .map((cell, col) => (cell ? sheetCellXml(row, col, cell) : ''))
    .join('')
  const ht = height === undefined ? '' : ` ht="${height}" customHeight="1"`

  return `<row r="${row}"${ht}>${xml}</row>`
}

function text(value: string, style?: number): SheetCell {
  return { type: 'text', value, style }
}

function num(value: number, style?: number): SheetCell {
  return { type: 'number', value, style }
}

function formula(value: string, cached: number, style?: number): SheetCell {
  return { type: 'formula', formula: value, value: cached, style }
}

export function buildLayoutCartSheetXml(items: LayoutCartLine[]) {
  const count = layoutCartCount(items)
  const total = layoutCartTotal(items)
  const discount = layoutCartDiscount(items)
  const firstItemRow = 16
  const lastItemRow = items.length === 0 ? 15 : firstItemRow + items.length - 1
  const discountRow = lastItemRow + 1
  const totalRow = discountRow + 1
  const headerRows: Array<{ row: number; cells: Array<SheetCell | undefined>; height?: number }> = [
    { row: 1, cells: [text(siteBrandCaps, 1), text(siteGardenName, 2)] },
    { row: 2, cells: [undefined, text(siteAddressShort, 4)] },
    { row: 3, cells: [undefined, text(sitePhone, 3)] },
    { row: 4, cells: [] },
    { row: 5, cells: [undefined, text('Режим работы:', 5)] },
    { row: 6, cells: [undefined, text(siteHours, 3)] },
    { row: 7, cells: [] },
    { row: 8, cells: [undefined, text('Как к нам проехать:', 5)] },
    { row: 9, cells: [undefined, text(siteMapsHref, 21)] },
    { row: 10, cells: [] },
    { row: 11, cells: [undefined, text('Мы в соц.сетях:', 5)] },
    { row: 12, cells: [undefined, text(siteVkHref, 21)] },
    { row: 13, cells: [], height: 15.75 },
    { row: 14, cells: [text('Ваш заказ', 7)], height: 27 },
    {
      row: 15,
      cells: [
        text('Название', 8),
        text('Размер', 8),
        text('Количество, шт', 9),
        text('Цена, руб', 10),
        text('Сумма, руб', 10),
      ],
      height: 26.25,
    },
  ]
  const itemRows = items.map((item, index) => ({
    row: firstItemRow + index,
    cells: [
      text(item.name, 11),
      text(item.sizeLabel ?? '', 12),
      num(item.quantity, 12),
      num(item.priceRubles, 13),
      num(item.priceRubles * item.quantity, 13),
    ],
    height: 15.75,
  }))
  const qtySum: SheetCell =
    items.length === 0
      ? num(0, 18)
      : formula(`SUM(C${firstItemRow}:C${lastItemRow})`, count, 18)
  const footerRows = [
    {
      row: discountRow,
      cells: [text('Скидка, руб', 14), undefined, undefined, undefined, num(discount, 16)],
      height: 15.75,
    },
    {
      row: totalRow,
      cells: [text('Итого', 17), undefined, qtySum, undefined, num(total, 20)],
      height: 15.75,
    },
  ]
  const rows = [...headerRows, ...itemRows, ...footerRows]
  const merges = [
    'A1:A12',
    'B2:E2',
    'B3:C3',
    'B5:C5',
    'B6:C6',
    'B8:C8',
    'B9:E9',
    'B11:C11',
    'B12:C12',
    `A${discountRow}:B${discountRow}`,
    `A${totalRow}:B${totalRow}`,
  ]

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <cols>
    <col min="1" max="1" width="57.86" customWidth="1"/>
    <col min="2" max="5" width="16" customWidth="1"/>
  </cols>
  <sheetData>
    ${rows.map(({ row, cells, height }) => sheetRowXml(row, cells, height)).join('\n    ')}
  </sheetData>
  <mergeCells count="${merges.length}">
    ${merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('\n    ')}
  </mergeCells>
  <hyperlinks>
    <hyperlink ref="B9" r:id="rId1"/>
    <hyperlink ref="B12" r:id="rId2"/>
  </hyperlinks>
</worksheet>`
}

export function buildLayoutCartSheetRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(siteMapsHref)}" TargetMode="External"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(siteVkHref)}" TargetMode="External"/>
</Relationships>`
}

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Корзина" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="11">
    <font><sz val="11"/><color rgb="FF000000"/><name val="Arial"/></font>
    <font><b/><sz val="18"/><color rgb="FF274E13"/><name val="Calibri"/></font>
    <font><b/><sz val="12"/><color rgb="FF274E13"/><name val="Calibri"/></font>
    <font><color rgb="FF274E13"/><name val="Arial"/><sz val="11"/></font>
    <font><b/><sz val="11"/><color rgb="FF274E13"/><name val="Calibri"/></font>
    <font><b/><sz val="18"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
    <font><sz val="11"/><name val="Arial"/></font>
    <font><b/><sz val="11"/><name val="Arial"/></font>
    <font><b/><sz val="12"/><name val="Calibri"/></font>
    <font><u/><sz val="11"/><color theme="10"/><name val="Arial"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left/><right/><top/><bottom style="thin"><color rgb="FF000000"/></bottom><diagonal/></border>
    <border><left/><right/><top style="thin"><color rgb="FF000000"/></top><bottom style="thin"><color rgb="FF000000"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="10" fillId="0" borderId="0" applyNumberFormat="0" applyFill="0" applyBorder="0" applyAlignment="0" applyProtection="0"/>
  </cellStyleXfs>
  <cellXfs count="22">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment wrapText="0"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="2" fontId="7" fillId="0" borderId="2" xfId="0" applyFont="1" applyBorder="1" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="2" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right"/></xf>
    <xf numFmtId="0" fontId="8" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="2" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1"/>
    <xf numFmtId="2" fontId="9" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center"/></xf>
    <xf numFmtId="0" fontId="10" fillId="0" borderId="0" xfId="1" applyFont="1"/>
  </cellXfs>
  <cellStyles count="2">
    <cellStyle name="Гиперссылка" xfId="1" builtinId="8"/>
    <cellStyle name="Обычный" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`

export function buildLayoutCartXlsx(items: LayoutCartLine[]) {
  return zipStore([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(workbookRels) },
    { name: 'xl/styles.xml', data: encoder.encode(styles) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(buildLayoutCartSheetXml(items)) },
    { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: encoder.encode(buildLayoutCartSheetRels()) },
  ])
}

export function downloadLayoutCartExcel(items: LayoutCartLine[]) {
  const bytes = buildLayoutCartXlsx(items)
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = href
  link.download = 'greenmarket-cart.xlsx'
  link.click()
  URL.revokeObjectURL(href)
}

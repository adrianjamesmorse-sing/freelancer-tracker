export type Entity = 'Squadigital FR' | 'Squadigital UK' | 'Squadigital GE' | 'JV' | 'Unspecified'
export type CsvCurrency = 'EUR' | 'GBP'

export interface FormsCsvRow {
  sourceRowId?: string
  timestamp?: string
  projectManagerEmail?: string
  projectManagerName?: string
  freelancerName?: string
  projectName?: string
  entity?: Entity
  contractStartDate?: string
  contractEndDate?: string
  numberOfDays?: number
  dailyRate?: number
  dailyRateCurrency?: CsvCurrency
  dailyRateNote?: string
  roleWithinProject?: string
  registrationNumber?: boolean
  personalEmail?: string
  phoneNumber?: string
  address?: string
  country?: string
  questionFlag?: boolean
  comments?: string
}

const headerAliases: Record<string, keyof FormsCsvRow | 'addressRaw' | 'currencyRaw' | 'dailyRateRaw'> = {
  id: 'sourceRowId',
  heurededebut: 'timestamp',
  adressedemessagerie: 'projectManagerEmail',
  nom: 'projectManagerName',
  yourname: 'projectManagerName',
  completenameofthefreelanceregantoinedupont: 'freelancerName',
  nameoftheprojectegddemkcapitalpeach: 'projectName',
  onwhichentityisthisprojectbilled: 'entity',
  startingdateoftheproject: 'contractStartDate',
  enddateoftheproject: 'contractEndDate',
  numberofdaysthefreelancerwillworkontheproject: 'numberOfDays',
  dailyratewiththecurrencyeg1000: 'dailyRateRaw',
  rolewithintheprojectmanagerseniorconsultantetc: 'roleWithinProject',
  haveyouensuredthatthefreelancerhasaregistrationnumberautoentrepriseorcompanypleasenotthatifanswerisnowewontbeabletoprovideacontract: 'registrationNumber',
  freelancersemailadress: 'personalEmail',
  freelancerphonenumber: 'phoneNumber',
  question: 'questionFlag',
  whichcurrencyforthedailyrate: 'currencyRaw',
  freelanceremailaddress: 'addressRaw',
  anycomments: 'comments'
}

export function decodeWindows1252Base64(base64: string): string {
  const bytes = Buffer.from(base64, 'base64')
  return new TextDecoder('windows-1252').decode(bytes)
}

export function parseFormsCsv(text: string): FormsCsvRow[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const headers = rows[0].map(normalizeHeader)

  return rows.slice(1).map((cells) => {
    const mapped: FormsCsvRow = {}
    let addressRaw: string | undefined
    let dailyRateRaw: string | undefined
    let currencyRaw: string | undefined

    headers.forEach((header, index) => {
      const alias = headerAliases[header]
      const value = cleanCell(cells[index] ?? '')
      if (!alias || !value) return

      if (alias === 'addressRaw') addressRaw = value
      else if (alias === 'dailyRateRaw') dailyRateRaw = value
      else if (alias === 'currencyRaw') currencyRaw = value
      else mapped[alias] = value as never
    })

    mapped.timestamp = normalizeDateTime(mapped.timestamp)
    mapped.projectManagerEmail = cleanEmail(mapped.projectManagerEmail)
    mapped.projectManagerName = cleanCell(mapped.projectManagerName ?? '') || undefined
    mapped.freelancerName = cleanCell(mapped.freelancerName ?? '') || undefined
    mapped.projectName = cleanCell(mapped.projectName ?? '') || undefined
    mapped.entity = parseEntity(mapped.entity as string | undefined)
    mapped.contractStartDate = normalizeDate(mapped.contractStartDate)
    mapped.contractEndDate = normalizeDate(mapped.contractEndDate)
    mapped.numberOfDays = parseNumberOfDays(mapped.numberOfDays as number | string | undefined)
    mapped.dailyRate = parseMoney(dailyRateRaw)
    mapped.dailyRateCurrency = parseCurrency(currencyRaw || dailyRateRaw)
    mapped.dailyRateNote = buildDailyRateNote(dailyRateRaw, currencyRaw)
    mapped.roleWithinProject = cleanCell(mapped.roleWithinProject ?? '') || undefined
    mapped.registrationNumber = parseBoolean(mapped.registrationNumber as string | undefined)
    mapped.personalEmail = cleanEmail(mapped.personalEmail) || cleanEmail(addressRaw)
    mapped.phoneNumber = cleanCell(mapped.phoneNumber ?? '') || undefined
    mapped.address = isLikelyAddress(addressRaw) ? addressRaw : undefined
    mapped.country = inferCountryFromAddress(mapped.address)
    mapped.questionFlag = parseBoolean(mapped.questionFlag as string | undefined)
    mapped.comments = cleanCell(mapped.comments ?? '') || undefined

    return mapped
  }).filter((row) => row.freelancerName || row.projectName)
}

export function normalizeKey(...parts: Array<string | number | undefined | null>): string {
  return parts
    .map((part) => String(part ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join('|')
}

function parseCsv(text: string): string[][] {
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1
      row.push(current)
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some((cell) => cell.trim().length > 0)) rows.push(row)
  }

  return rows
}

function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const semicolons = (firstLine.match(/;/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  return semicolons >= commas ? ';' : ','
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function cleanCell(value: string): string {
  return value.replace(/\u00a0/g, ' ').trim()
}

function cleanEmail(value?: string): string | undefined {
  if (!value) return undefined
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]?.toLowerCase()
}

function parseBoolean(value?: string): boolean | undefined {
  if (!value) return undefined
  const normalized = cleanCell(value).toLowerCase()
  if (['yes', 'true', '1', 'y', 'oui'].includes(normalized)) return true
  if (['no', 'false', '0', 'n', 'non'].includes(normalized)) return false
  return undefined
}

function parseMoney(value?: string): number | undefined {
  if (!value) return undefined
  const normalized = value.replace(/\s+/g, '')
  const match = normalized.match(/-?\d+(?:[.,]\d+)?/)
  if (!match) return undefined
  const parsed = Number.parseFloat(match[0].replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseNumberOfDays(value?: number | string): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (!value) return undefined
  const normalized = cleanCell(value).toLowerCase()
  const numbers = Array.from(normalized.matchAll(/\d+(?:[.,]\d+)?/g)).map((match) => Number.parseFloat(match[0].replace(',', '.')))
  if (!numbers.length) return undefined
  const base = numbers.length === 1 ? numbers[0] : numbers.reduce((sum, item) => sum + item, 0) / numbers.length
  const days = normalized.includes('week') ? base * 5 : base
  return Number.isFinite(days) ? Math.round(days * 10) / 10 : undefined
}

function parseCurrency(value?: string): CsvCurrency {
  const normalized = cleanCell(value ?? '').toUpperCase()
  if (normalized.includes('GBP') || normalized.includes('£')) return 'GBP'
  return 'EUR'
}

function buildDailyRateNote(rateRaw?: string, currencyRaw?: string): string | undefined {
  const parts = [rateRaw, currencyRaw].map((item) => cleanCell(item ?? '')).filter(Boolean)
  if (!parts.length) return undefined
  const rateLooksSimple = /^\s*[\d.,]+\s*(€|eur|euros|£|gbp|ht)?\s*$/i.test(rateRaw ?? '')
  const currencyLooksSimple = /^(eur|gbp|€|£)?$/i.test(cleanCell(currencyRaw ?? ''))
  return rateLooksSimple && currencyLooksSimple ? undefined : parts.join(' | ')
}

function parseEntity(value?: string): Entity {
  const normalized = cleanCell(value ?? '').toLowerCase()
  if (normalized.includes('fr')) return 'Squadigital FR'
  if (normalized.includes('uk')) return 'Squadigital UK'
  if (normalized.includes('ge')) return 'Squadigital GE'
  if (normalized.includes('jv')) return 'JV'
  return 'Unspecified'
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined
  const raw = cleanCell(value)
  const parts = raw.split(/[\/\-.]/)
  if (parts.length === 3) {
    const [day, month, year] = parts
    if (year.length === 4) return `${year}-${pad(month)}-${pad(day)}`
  }
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return undefined
}

function normalizeDateTime(value?: string): string | undefined {
  const date = normalizeDate(value)
  return date ? `${date}T00:00:00.000Z` : undefined
}

function pad(value: string): string {
  return value.padStart(2, '0')
}

function isLikelyAddress(value?: string): boolean {
  if (!value) return false
  if (cleanEmail(value)) return false
  return /\d|street|st\.?|road|rd\.?|avenue|ave\.?|rue|paris|london|berlin|madrid|france|united kingdom|uk|germany/i.test(value)
}

function inferCountryFromAddress(value?: string): string | undefined {
  if (!value) return undefined
  const normalized = cleanCell(value).toLowerCase()
  if (normalized.includes('france') || normalized.includes('paris')) return 'France'
  if (normalized.includes('united kingdom') || normalized.includes(' uk') || normalized.includes('london')) return 'United Kingdom'
  if (normalized.includes('germany') || normalized.includes('berlin')) return 'Germany'
  if (normalized.includes('spain') || normalized.includes('madrid')) return 'Spain'
  if (normalized.includes('belgium') || normalized.includes('brussels')) return 'Belgium'
  if (normalized.includes('netherlands') || normalized.includes('amsterdam')) return 'Netherlands'
  return undefined
}
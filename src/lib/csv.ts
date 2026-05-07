import { inferCountryFromAddress } from './geo'
import type { Entity, FreelancerStatus } from '../types'

export interface CsvRow {
  id?: string
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
  dailyRateCurrency?: 'EUR' | 'GBP'
  dailyRateNote?: string
  roleWithinProject?: string
  registrationNumber?: boolean
  personalEmail?: string
  phoneNumber?: string
  address?: string
  country?: string
  freelancerStatus?: FreelancerStatus
  questionFlag?: boolean
  comments?: string
}

const headerAliases: Record<string, keyof CsvRow> = {
  id: 'id',
  heurededebut: 'timestamp',
  timestamp: 'timestamp',
  adressedemessagerie: 'projectManagerEmail',
  projectmanageremail: 'projectManagerEmail',
  nom: 'projectManagerName',
  yourname: 'projectManagerName',
  projectmanagername: 'projectManagerName',
  completenameofthefreelanceregantoinedupont: 'freelancerName',
  freelancername: 'freelancerName',
  nameoftheprojectegddemkcapitalpeach: 'projectName',
  projectname: 'projectName',
  onwhichentityisthisprojectbilled: 'entity',
  onwhichentity: 'entity',
  entity: 'entity',
  startingdateoftheproject: 'contractStartDate',
  contractstartdate: 'contractStartDate',
  enddateoftheproject: 'contractEndDate',
  contractenddate: 'contractEndDate',
  numberofdaysthefreelancerwillworkontheproject: 'numberOfDays',
  numberofdays: 'numberOfDays',
  dailyratewiththecurrencyeg1000: 'dailyRate',
  dailyrate: 'dailyRate',
  rolewithintheprojectmanagerseniorconsultantetc: 'roleWithinProject',
  rolewithintheproject: 'roleWithinProject',
  haveyouensuredthatthefreelancerhasaregistrationnumberautoentrepriseorcompanypleasenotthatifanswerisnowewontbeabletoprovideacontract: 'registrationNumber',
  registrationnumberyesno: 'registrationNumber',
  freelancersemailadress: 'personalEmail',
  freelancersemailaddress: 'personalEmail',
  freelancerpersonalemail: 'personalEmail',
  freelancerphonenumber: 'phoneNumber',
  question: 'questionFlag',
  questionyesno: 'questionFlag',
  whichcurrencyforthedailyrate: 'dailyRateCurrency',
  dailyratecurrency: 'dailyRateCurrency',
  freelanceremailaddress: 'address',
  freelanceraddress: 'address',
  anycomments: 'comments',
  comments: 'comments',
}

export function parseCsv(text: string): string[][] {
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
      if (char === '\r' && next === '\n') {
        index += 1
      }
      row.push(current)
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row)
      }
      row = []
      current = ''
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row)
    }
  }

  return rows
}

export function mapCsvRows(text: string): CsvRow[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const headers = rows[0].map((header) => normalizeHeader(header))

  return rows
    .slice(1)
    .map((cells) => {
      const mapped: CsvRow = {}
      const raw: Partial<Record<keyof CsvRow | 'dailyRateRaw' | 'currencyRaw' | 'addressRaw', string>> = {}

      headers.forEach((header, index) => {
        const key = headerAliases[header]
        const value = cleanCell(cells[index] ?? '')
        if (!key || !value) return

        raw[key] = value
        if (key === 'dailyRate') raw.dailyRateRaw = value
        if (key === 'dailyRateCurrency') raw.currencyRaw = value
        if (key === 'address') raw.addressRaw = value
      })

      mapped.id = raw.id
      mapped.timestamp = normalizeDateTime(raw.timestamp)
      mapped.projectManagerEmail = cleanEmail(raw.projectManagerEmail)
      mapped.projectManagerName = raw.projectManagerName
      mapped.freelancerName = cleanFreelancerName(raw.freelancerName)
      mapped.projectName = raw.projectName
      mapped.entity = parseEntity(raw.entity)
      mapped.contractStartDate = normalizeDate(raw.contractStartDate)
      mapped.contractEndDate = normalizeDate(raw.contractEndDate)
      mapped.numberOfDays = parseNumberOfDays(raw.numberOfDays)
      mapped.dailyRate = parseMoney(raw.dailyRateRaw)
      mapped.dailyRateCurrency = parseCurrency(raw.currencyRaw || raw.dailyRateRaw)
      mapped.dailyRateNote = buildDailyRateNote(raw.dailyRateRaw, raw.currencyRaw)
      mapped.roleWithinProject = raw.roleWithinProject
      mapped.registrationNumber = parseBoolean(raw.registrationNumber)
      mapped.personalEmail = cleanEmail(raw.personalEmail) || cleanEmail(raw.addressRaw)
      mapped.phoneNumber = raw.phoneNumber
      mapped.address = isLikelyAddress(raw.addressRaw) ? raw.addressRaw : undefined
      mapped.country = inferCountryFromAddress(mapped.address) || undefined
      mapped.questionFlag = parseBoolean(raw.questionFlag)
      mapped.comments = cleanComment(raw.comments)
      mapped.freelancerStatus = deriveFreelancerStatus(mapped.contractEndDate, mapped.questionFlag)

      return mapped
    })
    .filter((row) => row.freelancerName || row.projectName)
}

export function normalizeKey(...parts: Array<string | number | undefined | null>): string {
  return parts
    .map((part) => String(part ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join('|')
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

function cleanFreelancerName(value?: string): string | undefined {
  if (!value) return undefined
  return cleanCell(value).replace(/<[^>]+>/g, '').trim()
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
  const numbers = Array.from(normalized.matchAll(/\d+(?:[.,]\d+)?/g)).map((match) =>
    Number.parseFloat(match[0].replace(',', '.')),
  )
  if (!numbers.length) return undefined

  const base = numbers.length === 1 ? numbers[0] : numbers.reduce((sum, item) => sum + item, 0) / numbers.length
  const days = normalized.includes('week') ? base * 5 : base
  return Number.isFinite(days) ? Math.round(days * 10) / 10 : undefined
}

function parseCurrency(value?: string): 'EUR' | 'GBP' {
  const normalized = cleanCell(value ?? '').toUpperCase()
  if (normalized.includes('GBP') || normalized.includes('£')) return 'GBP'
  return 'EUR'
}

function buildDailyRateNote(rateRaw?: string, currencyRaw?: string): string | undefined {
  const parts = [rateRaw, currencyRaw]
    .map((item) => cleanCell(item ?? ''))
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index)

  if (!parts.length) return undefined

  const parsedRate = parseMoney(rateRaw)
  const rateLooksSimple = /^\s*[\d.,]+\s*(€|eur|euros|£|gbp|ht)?\s*$/i.test(rateRaw ?? '')
  const currencyLooksSimple = !currencyRaw || /^\s*(€|eur|euros|£|gbp)\s*$/i.test(currencyRaw)
  if (parsedRate && rateLooksSimple && currencyLooksSimple) return undefined

  return parts.join(' · ')
}

function isLikelyAddress(value?: string): boolean {
  if (!value) return false
  if (cleanEmail(value)) return false
  const normalized = cleanCell(value).toLowerCase()
  if (['n/a', 'na', 'none', ''].includes(normalized)) return false
  return true
}

function cleanComment(value?: string): string | undefined {
  if (!value) return undefined
  const cleaned = cleanCell(value)
  return cleaned && cleaned.toLowerCase() !== 'n/a' ? cleaned : undefined
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined
  const cleaned = cleanCell(value)
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (match) {
    const [, month, day, year] = match
    const yyyy = year.length === 2 ? `20${year}` : year
    return `${yyyy}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  const parsed = new Date(cleaned)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString().slice(0, 10)
}

function normalizeDateTime(value?: string): string | undefined {
  if (!value) return undefined
  const cleaned = cleanCell(value)
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (match) {
    const [, month, day, year, hours, minutes, seconds] = match
    const yyyy = year.length === 2 ? `20${year}` : year
    return `${yyyy}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes}:${(seconds ?? '00').padStart(2, '0')}Z`
  }
  const parsed = new Date(cleaned)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

function deriveFreelancerStatus(contractEndDate?: string, questionFlag?: boolean): FreelancerStatus {
  if (questionFlag) return 'Open follow-up'
  if (!contractEndDate) return 'Active'
  const delta = Math.ceil((new Date(contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (delta < 0) return 'Inactive'
  if (delta <= 7) return 'Ending soon'
  return 'Active'
}

function parseEntity(value?: string): Entity {
  const normalized = cleanCell(value ?? '').toLowerCase()
  if (!normalized || ['yes', 'no', 'n/a', 'na'].includes(normalized)) return 'Unspecified'
  if (normalized === 'jv' || normalized.includes('joint')) return 'JV'
  if (normalized.includes('fr')) return 'Squadigital FR'
  if (normalized.includes('ge') || normalized.includes('de')) return 'Squadigital GE'
  if (normalized.includes('uk')) return 'Squadigital UK'
  return 'Unspecified'
}

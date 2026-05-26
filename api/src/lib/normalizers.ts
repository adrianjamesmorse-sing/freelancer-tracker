import iconv from 'iconv-lite'
import { parse } from 'csv-parse/sync'

export function normalizeKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()
    .trim()
}

export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value)
  return normalized === '' ? null : normalized
}

export function parseBooleanish(value: unknown): boolean {
  const normalized = normalizeText(value).toLowerCase()
  return ['yes', 'y', 'true', '1', 'oui'].includes(normalized)
}

export function parseIntegerish(value: unknown): number | null {
  const normalized = normalizeText(value)
  if (!normalized) return null
  const cleaned = normalized.replace(/[^0-9.-]+/g, '')
  const number = Number(cleaned)
  return Number.isFinite(number) ? Math.round(number) : null
}

export function parseAmount(value: unknown): number | null {
  const normalized = normalizeText(value)
  if (!normalized) return null
  const cleaned = normalized.replace(/,/g, '.').replace(/[^0-9.-]+/g, '')
  const number = Number(cleaned)
  return Number.isFinite(number) ? number : null
}

export function parseDate(value: unknown): string | null {
  const normalized = normalizeText(value)
  if (!normalized) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized
  }

  const slash = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const month = slash[1].padStart(2, '0')
    const day = slash[2].padStart(2, '0')
    const year = slash[3]
    return `${year}-${month}-${day}`
  }

  const dash = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dash) {
    const day = dash[1].padStart(2, '0')
    const month = dash[2].padStart(2, '0')
    const year = dash[3]
    return `${year}-${month}-${day}`
  }

  return null
}

export function inferCountry(address: string | null): string | null {
  if (!address) return null
  const value = address.toLowerCase()
  if (value.includes('london') || value.includes('united kingdom') || value.includes('uk')) return 'United Kingdom'
  if (value.includes('paris') || value.includes('france')) return 'France'
  if (value.includes('berlin') || value.includes('germany')) return 'Germany'
  if (value.includes('madrid') || value.includes('spain')) return 'Spain'
  if (value.includes('lisbon') || value.includes('portugal')) return 'Portugal'
  if (value.includes('brussels') || value.includes('belgium')) return 'Belgium'
  if (value.includes('amsterdam') || value.includes('netherlands')) return 'Netherlands'
  if (value.includes('milan') || value.includes('rome') || value.includes('italy')) return 'Italy'
  if (value.includes('new york') || value.includes('usa') || value.includes('united states')) return 'United States'
  return null
}

export function normalizeEntity(value: unknown): string {
  const normalized = normalizeText(value)
  if (!normalized) return 'Unspecified'
  const lowered = normalized.toLowerCase()
  if (['yes', 'no'].includes(lowered)) return 'Unspecified'
  if (lowered.includes('uk')) return 'Squadigital UK'
  if (lowered.includes('fr')) return 'Squadigital FR'
  if (lowered.includes('ge')) return 'Squadigital GE'
  if (lowered === 'jv') return 'JV'
  return normalized
}

const headerAliases: Record<string, string> = {
  id: 'formId',
  starttime: 'startTime',
  heuredebut: 'startTime',
  endtime: 'endTime',
  heuredefin: 'endTime',
  emailaddress: 'submitterEmail',
  adressedemessagerie: 'submitterEmail',
  name: 'submitterName',
  nom: 'submitterName',
  yourname: 'projectManagerName',
  completenameofthefreelanceregantoinedupont: 'freelancerName',
  nameoftheprojectegddemkcapitalpeach: 'projectName',
  onwhichentityisthisprojectbilled: 'entity',
  startingdateoftheproject: 'contractStartDate',
  enddateoftheproject: 'contractEndDate',
  numberofdaysthefreelancerwillworkontheproject: 'numberOfDays',
  dailyratewiththecurrencyeg1000: 'dailyRateRaw',
  rolewithintheprojectmanagerseniorconsultantetc: 'roleWithinProject',
  doesyourfreelancerhavearegistrationnumber: 'registrationNumber',
  freelancersemailadress: 'freelancerEmailPrimary',
  freelanceremailaddress: 'freelancerEmailSecondary',
  freelancerphonenumber: 'freelancerPhoneNumber',
  question: 'questionFlag',
  whichcurrencyforthedailyrate: 'dailyRateCurrency',
  anycomments: 'comments',
}

export function parseFormsCsv(input: string | Buffer): Array<Record<string, string>> {
  const text = Buffer.isBuffer(input) ? iconv.decode(input, 'win1252') : input
  const records = parse(text, {
    bom: true,
    columns: true,
    delimiter: ';',
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>

  return records.map((record) => {
    const mapped: Record<string, string> = {}
    for (const [rawKey, rawValue] of Object.entries(record)) {
      const canonical = headerAliases[normalizeKey(rawKey)] ?? normalizeKey(rawKey)
      mapped[canonical] = normalizeText(rawValue)
    }
    return mapped
  })
}
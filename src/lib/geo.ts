import type { Freelancer } from '../types'

export interface CountryMapDatum {
  id: string
  country: string
  mapCountryName: string
  count: number
}

interface GeoSeed {
  country: string
  patterns: string[]
}

const COUNTRY_ALIASES: Record<string, string> = {
  'United States': 'United States of America',
  'Russia': 'Russian Federation',
  'Czech Republic': 'Czechia',
  'Ivory Coast': "Côte d'Ivoire",
  'Democratic Republic of the Congo': 'Dem. Rep. Congo',
  'Republic of the Congo': 'Congo',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Dominican Republic': 'Dominican Rep.',
  'Central African Republic': 'Central African Rep.',
  'Equatorial Guinea': 'Eq. Guinea',
  'Eswatini': 'eSwatini',
  'South Korea': 'Republic of Korea',
  'North Korea': 'Dem. Rep. Korea',
  'Laos': 'Lao PDR',
  'Moldova': 'Moldova',
  'Macedonia': 'North Macedonia',
  'Myanmar': 'Myanmar',
  'Syria': 'Syrian Arab Republic',
  'Palestine': 'Palestine',
  'Vatican City': 'Vatican',
  'Taiwan': 'Taiwan',
  'Cape Verde': 'Cabo Verde',
}

const COUNTRY_LOOKUP_ALIASES: Record<string, string[]> = {
  'United States': ['United States of America', 'USA'],
  'United Kingdom': ['UK', 'Great Britain'],
  'Ivory Coast': ["Côte d'Ivoire", 'Cote dIvoire', 'Cote d Ivoire'],
  "Côte d'Ivoire": ['Ivory Coast', 'Cote dIvoire', 'Cote d Ivoire'],
  'Russia': ['Russian Federation'],
  'Czech Republic': ['Czechia'],
  'Democratic Republic of the Congo': ['Dem. Rep. Congo', 'DR Congo'],
  'Republic of the Congo': ['Congo'],
  'Bosnia and Herzegovina': ['Bosnia and Herz.'],
  'Dominican Republic': ['Dominican Rep.'],
  'Central African Republic': ['Central African Rep.'],
  'Equatorial Guinea': ['Eq. Guinea'],
  'Eswatini': ['eSwatini'],
  'South Korea': ['Republic of Korea'],
  'North Korea': ['Dem. Rep. Korea'],
  'Laos': ['Lao PDR'],
  'Macedonia': ['North Macedonia'],
  'Syria': ['Syrian Arab Republic'],
  'Vatican City': ['Vatican'],
  'Cape Verde': ['Cabo Verde'],
}

const GEO_SEEDS: GeoSeed[] = [
  { country: 'United Kingdom', patterns: ['london', 'manchester', 'uk', 'united kingdom', 'england', 'scotland', 'wales', 'birmingham', 'leeds'] },
  { country: 'France', patterns: ['paris', 'france', 'lyon', 'marseille', 'bordeaux', 'lille', 'toulouse'] },
  { country: 'Germany', patterns: ['berlin', 'germany', 'deutschland', 'munich', 'frankfurt', 'hamburg', 'cologne'] },
  { country: 'Spain', patterns: ['madrid', 'barcelona', 'spain', 'espana', 'españa', 'valencia', 'sevilla'] },
  { country: 'Portugal', patterns: ['lisbon', 'porto', 'portugal', 'coimbra'] },
  { country: 'Italy', patterns: ['milan', 'rome', 'italy', 'italia', 'turin', 'florence'] },
  { country: 'Netherlands', patterns: ['amsterdam', 'rotterdam', 'netherlands', 'holland', 'utrecht'] },
  { country: 'Belgium', patterns: ['brussels', 'belgium', 'antwerp', 'ghent'] },
  { country: 'Switzerland', patterns: ['zurich', 'geneva', 'switzerland', 'lausanne', 'basel'] },
  { country: 'United States', patterns: ['new york', 'san francisco', 'usa', 'united states', 'california', 'texas', 'boston', 'chicago', 'seattle'] },
  { country: 'Canada', patterns: ['toronto', 'montreal', 'canada', 'vancouver', 'ottawa'] },
  { country: 'Brazil', patterns: ['sao paulo', 'são paulo', 'rio', 'brazil', 'brasil', 'belo horizonte'] },
  { country: 'United Arab Emirates', patterns: ['dubai', 'abu dhabi', 'uae', 'united arab emirates'] },
  { country: 'Saudi Arabia', patterns: ['riyadh', 'jeddah', 'saudi arabia'] },
  { country: 'India', patterns: ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune'] },
  { country: 'Singapore', patterns: ['singapore'] },
  { country: 'Australia', patterns: ['sydney', 'melbourne', 'australia', 'brisbane', 'perth'] },
]

export function inferCountryFromAddress(address?: string): string {
  const value = address?.trim()
  if (!value) return ''
  const haystack = value.toLowerCase()
  const match = GEO_SEEDS.find((seed) => seed.patterns.some((pattern) => haystack.includes(pattern)))
  return match?.country ?? ''
}

export function buildCountryCounts(freelancers: Freelancer[]): CountryMapDatum[] {
  const grouped = new Map<string, CountryMapDatum>()

  for (const freelancer of freelancers) {
    if (freelancer.freelancerStatus !== 'Active') continue
    if (!freelancer.address?.trim()) continue
    const country = freelancer.country?.trim()
    if (!country) continue

    const mapCountryName = getMapCountryName(country)
    const key = normalizeGeographyName(mapCountryName)
    const existing = grouped.get(key)
    if (existing) {
      existing.count += 1
      continue
    }

    grouped.set(key, {
      id: key.replace(/[^a-z0-9]+/g, '-'),
      country,
      mapCountryName,
      count: 1,
    })
  }

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count || a.country.localeCompare(b.country))
}

export function getMapCountryName(country: string): string {
  return COUNTRY_ALIASES[country] ?? country
}

export function getCountryLookupKeys(country: string): string[] {
  const names = new Set<string>()
  const canonical = getMapCountryName(country)

  ;[country, canonical].forEach((value) => {
    if (value) names.add(value)
    for (const alias of COUNTRY_LOOKUP_ALIASES[value] ?? []) names.add(alias)
  })

  return Array.from(names)
    .map(normalizeGeographyName)
    .filter(Boolean)
}

export function normalizeGeographyName(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

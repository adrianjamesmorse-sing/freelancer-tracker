import { useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { ComposableMap, Geographies, Geography, Sphere, ZoomableGroup } from 'react-simple-maps'
import type { CountryMapDatum } from '../lib/geo'
import { getCountryLookupKeys, normalizeGeographyName } from '../lib/geo'
import { Icon } from './Icon'

const geographyUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const DEFAULT_CENTER: [number, number] = [12, 54]
const DEFAULT_ZOOM = 3.2
const MIN_ZOOM = 1
const MAX_ZOOM = 8

interface WorldMapPanelProps {
  countries: CountryMapDatum[]
  compact?: boolean
}

interface TooltipState {
  country: CountryMapDatum
  x: number
  y: number
}

export function WorldMapPanel({ countries, compact = false }: WorldMapPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [position, setPosition] = useState({ coordinates: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
  const mapFrameRef = useRef<HTMLDivElement | null>(null)

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryMapDatum>()
    countries.forEach((country) => {
      getCountryLookupKeys(country.country).forEach((key) => map.set(key, country))
    })
    return map
  }, [countries])

  const totalCountries = countries.length

  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#f6f0e6)] shadow-panel backdrop-blur-sm">
      <header className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">Active freelancers by country</h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">Countries are highlighted only when active freelancers have a usable address and mapped country.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-xs text-stone-700">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-olive-600" />
          Countries {totalCountries}
        </div>
      </header>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="rounded-[24px] border border-stone-200 bg-white/85 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Europe-focused view</div>
            <div className="flex items-center gap-2">
              <MapControl icon="minus" label="Zoom out" onClick={() => setPosition((current) => ({ ...current, zoom: Math.max(MIN_ZOOM, +(current.zoom - 0.8).toFixed(2)) }))} />
              <MapControl icon="plus" label="Zoom in" onClick={() => setPosition((current) => ({ ...current, zoom: Math.min(MAX_ZOOM, +(current.zoom + 0.8).toFixed(2)) }))} />
              <button type="button" onClick={() => setPosition({ coordinates: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })} className="inline-flex h-9 items-center rounded-xl border border-stone-200 bg-[#f8f3ea] px-3 text-xs font-medium text-stone-700 transition hover:border-stone-300 hover:bg-white">Reset</button>
            </div>
          </div>

          <div ref={mapFrameRef} className="relative overflow-hidden rounded-[22px] border border-stone-200 bg-[radial-gradient(circle_at_top,rgba(127,142,108,0.08),transparent_34%),linear-gradient(180deg,#fffdfa_0%,#f7f2e9_100%)]">
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: compact ? 170 : 155 }} style={{ width: '100%', height: compact ? '430px' : '500px' }}>
              <ZoomableGroup center={position.coordinates} zoom={position.zoom} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} onMoveEnd={(position: { coordinates: [number, number]; zoom: number }) => setPosition({ coordinates: position.coordinates, zoom: position.zoom })}>
                <Sphere stroke="#e5ddd0" strokeWidth={0.8} fill="#fbf8f1" />
                <Geographies geography={geographyUrl}>
                  {({ geographies }: { geographies: Array<{ rsmKey: string; properties?: { name?: string } }> }) => geographies.map((geography) => {
                    const normalizedName = normalizeGeographyName(String(geography.properties?.name ?? ''))
                    const match = countryMap.get(normalizedName)
                    return (
                      <Geography
                        key={geography.rsmKey}
                        geography={geography}
                        onMouseMove={(event: MouseEvent<SVGPathElement>) => {
                          if (!match || !mapFrameRef.current) return
                          const bounds = mapFrameRef.current.getBoundingClientRect()
                          setTooltip({ country: match, x: event.clientX - bounds.left + 14, y: event.clientY - bounds.top + 14 })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: { fill: match ? '#8fa07c' : '#efe8db', stroke: '#d8cfbf', strokeWidth: 0.7, outline: 'none' },
                          hover: { fill: match ? '#7c8e68' : '#e8dece', stroke: '#cdbfa8', strokeWidth: 0.9, outline: 'none' },
                          pressed: { fill: match ? '#6f7f5d' : '#e3d7c6', stroke: '#bfae95', strokeWidth: 0.9, outline: 'none' },
                        }}
                      />
                    )
                  })}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {tooltip ? (
              <div className="pointer-events-none absolute z-10 rounded-2xl border border-stone-200 bg-white/95 px-3 py-2 text-xs text-stone-700 shadow-lg" style={{ left: tooltip.x, top: tooltip.y }}>
                <div className="font-medium text-stone-900">{tooltip.country.country}</div>
                <div className="mt-1">{tooltip.country.count} active freelancer{tooltip.country.count === 1 ? '' : 's'}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function MapControl({ icon, label, onClick }: { icon: 'plus' | 'minus'; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-[#f8f3ea] text-stone-700 transition hover:border-stone-300 hover:bg-white">
      <Icon name={icon} className="h-4 w-4" />
    </button>
  )
}

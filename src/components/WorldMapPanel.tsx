import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  ZoomableGroup,
} from 'react-simple-maps'
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
}

interface TooltipState {
  country: CountryMapDatum
  x: number
  y: number
}

export function WorldMapPanel({ countries }: WorldMapPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [position, setPosition] = useState({ coordinates: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
  const mapFrameRef = useRef<HTMLDivElement | null>(null)

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryMapDatum>()
    countries.forEach((country) => {
      getCountryLookupKeys(country.country).forEach((key) => map.set(key, country))
      map.set(normalizeGeographyName(country.mapCountryName), country)
    })
    return map
  }, [countries])

  const handleZoomIn = () => {
    setPosition((current) => ({ ...current, zoom: Math.min(current.zoom * 1.35, MAX_ZOOM) }))
  }

  const handleZoomOut = () => {
    setPosition((current) => ({ ...current, zoom: Math.max(current.zoom / 1.35, MIN_ZOOM) }))
  }

  const handleReset = () => {
    setPosition({ coordinates: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
  }

  const showTooltip = (event: React.MouseEvent<SVGPathElement>, country: CountryMapDatum | null) => {
    if (!country || !mapFrameRef.current) {
      setTooltip(null)
      return
    }

    const bounds = mapFrameRef.current.getBoundingClientRect()
    setTooltip({
      country,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(52,150,255,0.12),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.94))] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">Active freelancers by country</div>
          <p className="mt-1 text-sm text-slate-400">
            Only active freelancers with both a saved country and a saved address are shown here.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/15 bg-brand-500/10 px-3 py-1.5 text-xs text-brand-100">
          <Icon name="globe" className="h-3.5 w-3.5" />
          <span>Countries</span>
          <span className="font-semibold text-white">{countries.length}</span>
        </div>
      </div>

      <div ref={mapFrameRef} className="relative overflow-hidden rounded-[24px] border border-white/8 bg-slate-950/60 p-2 sm:p-3">
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/85 p-1 shadow-xl backdrop-blur">
          <MapControlButton label="Zoom in" onClick={handleZoomIn}>
            <Icon name="plus" className="h-4 w-4" />
          </MapControlButton>
          <MapControlButton label="Zoom out" onClick={handleZoomOut}>
            <Icon name="minus" className="h-4 w-4" />
          </MapControlButton>
          <MapControlButton label="Reset view" onClick={handleReset}>
            <Icon name="globe" className="h-4 w-4" />
          </MapControlButton>
        </div>

        {tooltip ? (
          <div
            className="pointer-events-none absolute z-20 min-w-[160px] rounded-2xl border border-white/10 bg-slate-950/92 px-3 py-2 text-xs shadow-xl backdrop-blur"
            style={{
              left: Math.min(tooltip.x + 12, (mapFrameRef.current?.clientWidth ?? tooltip.x) - 176),
              top: Math.max(tooltip.y - 54, 16),
            }}
          >
            <div className="font-semibold text-white">{tooltip.country.country}</div>
            <div className="mt-1 text-slate-300">
              {tooltip.country.count} active freelancer{tooltip.country.count > 1 ? 's' : ''}
            </div>
          </div>
        ) : null}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 135 }}
          className="h-[360px] w-full touch-pan-y lg:h-[500px]"
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          >
            <Sphere fill="rgba(30,41,59,0.65)" stroke="rgba(148,163,184,0.18)" strokeWidth={0.5} />
            <Geographies geography={geographyUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geographyName =
                    geo.properties?.name ?? geo.properties?.NAME ?? geo.properties?.admin ?? geo.properties?.ADMIN ?? ''
                  const mappedCountry = countryMap.get(normalizeGeographyName(String(geographyName)))
                  const isActive = Boolean(mappedCountry)
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isActive ? 'rgba(96,165,250,0.95)' : 'rgba(71,85,105,0.5)'}
                      stroke={isActive ? 'rgba(255,255,255,0.4)' : 'rgba(148,163,184,0.18)'}
                      strokeWidth={isActive ? 0.7 : 0.35}
                      onMouseEnter={(event) => showTooltip(event, mappedCountry ?? null)}
                      onMouseMove={(event) => showTooltip(event, mappedCountry ?? null)}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: isActive ? 'rgba(129,191,255,1)' : 'rgba(96,165,250,0.2)', outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {!countries.length ? (
        <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No active freelancers currently have both an address and a country saved, so the map is empty.
        </div>
      ) : null}
    </div>
  )
}

function MapControlButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-brand-400/30 hover:bg-brand-500/15 hover:text-white"
    >
      {children}
    </button>
  )
}

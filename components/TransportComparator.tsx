'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import {
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api'
import CostCard from './CostCard'
import NumberField from './NumberField'
import {
  calcBusCost,
  calcCarCost,
  calcRideHailCost,
  defaultBusParams,
  defaultCabifyParams,
  defaultCarParams,
  defaultUberParams,
} from '@/lib/pricing'

const LIBRARIES: 'places'[] = ['places']
const MAP_CONTAINER_STYLE = { width: '100%', height: '320px', borderRadius: '0.75rem' }
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 } // Buenos Aires

const RIDE_HAIL_DISCLAIMER =
  'Estimación aproximada. El precio real de la app puede variar según demanda, tarifa dinámica, promociones y otros factores externos al momento del viaje.'

export default function TransportComparator() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  })

  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const destAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const [originAddress, setOriginAddress] = useState('')
  const [destAddress, setDestAddress] = useState('')
  const [originLatLng, setOriginLatLng] = useState<google.maps.LatLngLiteral | null>(null)
  const [destLatLng, setDestLatLng] = useState<google.maps.LatLngLiteral | null>(null)

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [drivingMinutes, setDrivingMinutes] = useState<number | null>(null)
  const [transitMinutes, setTransitMinutes] = useState<number | null>(null)

  const [manualMode, setManualMode] = useState(false)
  const [manualDistanceKm, setManualDistanceKm] = useState(10)
  const [manualMinutes, setManualMinutes] = useState(25)

  const [error, setError] = useState<string | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  const [carParams, setCarParams] = useState(defaultCarParams)
  const [busParams, setBusParams] = useState(defaultBusParams)
  const [uberParams, setUberParams] = useState(defaultUberParams)
  const [cabifyParams, setCabifyParams] = useState(defaultCabifyParams)

  const onOriginPlaceChanged = useCallback(() => {
    const place = originAutocompleteRef.current?.getPlace()
    if (place?.geometry?.location) {
      setOriginLatLng({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      setOriginAddress(place.formatted_address || place.name || originAddress)
    }
  }, [originAddress])

  const onDestPlaceChanged = useCallback(() => {
    const place = destAutocompleteRef.current?.getPlace()
    if (place?.geometry?.location) {
      setDestLatLng({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      setDestAddress(place.formatted_address || place.name || destAddress)
    }
  }, [destAddress])

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setOriginLatLng(loc)
        setOriginAddress('Mi ubicación actual')
      },
      () => setError('No se pudo obtener tu ubicación. Ingresá el origen manualmente.')
    )
  }

  const calculateRoute = async () => {
    setError(null)
    if (!originLatLng || !destLatLng) {
      setError('Elegí un origen y un destino de la lista de sugerencias.')
      return
    }
    setLoadingRoute(true)
    try {
      const directionsService = new google.maps.DirectionsService()

      const drivingResult = await directionsService.route({
        origin: originLatLng,
        destination: destLatLng,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      setDirections(drivingResult)
      const leg = drivingResult.routes[0]?.legs[0]
      setDistanceKm(leg?.distance ? leg.distance.value / 1000 : null)
      setDrivingMinutes(leg?.duration ? leg.duration.value / 60 : null)

      try {
        const transitResult = await directionsService.route({
          origin: originLatLng,
          destination: destLatLng,
          travelMode: google.maps.TravelMode.TRANSIT,
        })
        const transitLeg = transitResult.routes[0]?.legs[0]
        setTransitMinutes(transitLeg?.duration ? transitLeg.duration.value / 60 : null)
        setBusParams((p) => ({
          ...p,
          legs: transitResult.routes[0]?.legs[0]?.steps.filter((s) => s.travel_mode === 'TRANSIT')
            .length || p.legs,
        }))
      } catch {
        setTransitMinutes(null)
      }
    } catch {
      setError('No se pudo calcular la ruta. Probá con otra dirección o ingresá los datos manualmente.')
    } finally {
      setLoadingRoute(false)
    }
  }

  const effectiveDistanceKm = manualMode ? manualDistanceKm : distanceKm
  const effectiveMinutes = manualMode ? manualMinutes : drivingMinutes

  const costs = useMemo(() => {
    if (effectiveDistanceKm === null || effectiveMinutes === null) return null
    return {
      car: calcCarCost(effectiveDistanceKm, carParams),
      bus: calcBusCost(busParams),
      uber: calcRideHailCost(effectiveDistanceKm, effectiveMinutes, uberParams),
      cabify: calcRideHailCost(effectiveDistanceKm, effectiveMinutes, cabifyParams),
    }
  }, [effectiveDistanceKm, effectiveMinutes, carParams, busParams, uberParams, cabifyParams])

  const cheapest = costs
    ? Object.entries(costs).reduce((min, [key, val]) => (val < costs[min as keyof typeof costs] ? key : min), 'car')
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600">Origen</label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(a) => (originAutocompleteRef.current = a)}
                onPlaceChanged={onOriginPlaceChanged}
              >
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  placeholder="Dirección de origen"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                />
              </Autocomplete>
            ) : (
              <input
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                placeholder="Dirección de origen"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
              />
            )}
            <button
              type="button"
              onClick={useMyLocation}
              className="mt-1 text-xs text-blue-600 hover:underline"
            >
              Usar mi ubicación actual
            </button>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600">Destino</label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(a) => (destAutocompleteRef.current = a)}
                onPlaceChanged={onDestPlaceChanged}
              >
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  placeholder="Dirección de destino"
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                />
              </Autocomplete>
            ) : (
              <input
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                placeholder="Dirección de destino"
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
              />
            )}
          </div>
        </div>

        {!apiKey && (
          <p className="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            No hay una clave de Google Maps configurada (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY), así que el
            autocompletado y el mapa están desactivados. Podés usar la carga manual de distancia y tiempo
            de abajo mientras tanto.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={calculateRoute}
            disabled={!isLoaded || loadingRoute}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingRoute ? 'Calculando…' : 'Calcular ruta'}
          </button>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={manualMode}
              onChange={(e) => setManualMode(e.target.checked)}
            />
            Ingresar distancia y tiempo manualmente
          </label>
        </div>

        {manualMode && (
          <div className="flex flex-wrap gap-4 rounded bg-gray-50 p-3">
            <NumberField
              label="Distancia (km)"
              value={manualDistanceKm}
              onChange={setManualDistanceKm}
              step={0.5}
            />
            <NumberField
              label="Tiempo de viaje (min)"
              value={manualMinutes}
              onChange={setManualMinutes}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={originLatLng || DEFAULT_CENTER}
            zoom={directions ? undefined : 12}
          >
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}

        {effectiveDistanceKm !== null && effectiveMinutes !== null && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span>📏 {effectiveDistanceKm.toFixed(1)} km</span>
            <span>🚗 {Math.round(effectiveMinutes)} min en auto</span>
            {!manualMode && transitMinutes !== null && (
              <span>🚌 {Math.round(transitMinutes)} min en transporte público</span>
            )}
          </div>
        )}
      </div>

      {costs && effectiveDistanceKm !== null && effectiveMinutes !== null && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CostCard
            icon="🚗"
            title="Auto propio"
            subtitle="Combustible + estacionamiento + peajes"
            cost={costs.car}
            isCheapest={cheapest === 'car'}
          >
            <NumberField
              label="Precio nafta ($/litro)"
              value={carParams.fuelPricePerLiter}
              onChange={(v) => setCarParams((p) => ({ ...p, fuelPricePerLiter: v }))}
              step={10}
            />
            <NumberField
              label="Consumo (L/100km)"
              value={carParams.consumptionL100km}
              onChange={(v) => setCarParams((p) => ({ ...p, consumptionL100km: v }))}
              step={0.5}
            />
            <NumberField
              label="Estacionamiento ($)"
              value={carParams.parkingCost}
              onChange={(v) => setCarParams((p) => ({ ...p, parkingCost: v }))}
              step={50}
            />
            <NumberField
              label="Peajes ($)"
              value={carParams.tollCost}
              onChange={(v) => setCarParams((p) => ({ ...p, tollCost: v }))}
              step={50}
            />
          </CostCard>

          <CostCard
            icon="🚌"
            title="Colectivo / Bondi"
            subtitle="Tarifa SUBE por tramo"
            cost={costs.bus}
            isCheapest={cheapest === 'bus'}
          >
            <NumberField
              label="Tarifa por tramo ($)"
              value={busParams.farePerLeg}
              onChange={(v) => setBusParams((p) => ({ ...p, farePerLeg: v }))}
              step={10}
            />
            <NumberField
              label="Cantidad de colectivos"
              value={busParams.legs}
              onChange={(v) => setBusParams((p) => ({ ...p, legs: Math.max(1, Math.round(v)) }))}
              step={1}
              min={1}
            />
          </CostCard>

          <CostCard
            icon="🚕"
            title="Uber"
            subtitle="Estimado por distancia y tiempo"
            cost={costs.uber}
            isCheapest={cheapest === 'uber'}
            disclaimer={RIDE_HAIL_DISCLAIMER}
          >
            <NumberField
              label="Tarifa base ($)"
              value={uberParams.baseFare}
              onChange={(v) => setUberParams((p) => ({ ...p, baseFare: v }))}
              step={50}
            />
            <NumberField
              label="Por km ($)"
              value={uberParams.perKm}
              onChange={(v) => setUberParams((p) => ({ ...p, perKm: v }))}
              step={10}
            />
            <NumberField
              label="Por minuto ($)"
              value={uberParams.perMin}
              onChange={(v) => setUberParams((p) => ({ ...p, perMin: v }))}
              step={5}
            />
            <label className="flex items-center justify-between gap-2 text-xs text-gray-600">
              <span>Precio actual en la app ($, opcional)</span>
              <input
                type="number"
                className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-gray-900"
                placeholder="—"
                value={uberParams.manualPrice ?? ''}
                onChange={(e) =>
                  setUberParams((p) => ({
                    ...p,
                    manualPrice: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </label>
          </CostCard>

          <CostCard
            icon="🚖"
            title="Cabify"
            subtitle="Estimado por distancia y tiempo"
            cost={costs.cabify}
            isCheapest={cheapest === 'cabify'}
            disclaimer={RIDE_HAIL_DISCLAIMER}
          >
            <NumberField
              label="Tarifa base ($)"
              value={cabifyParams.baseFare}
              onChange={(v) => setCabifyParams((p) => ({ ...p, baseFare: v }))}
              step={50}
            />
            <NumberField
              label="Por km ($)"
              value={cabifyParams.perKm}
              onChange={(v) => setCabifyParams((p) => ({ ...p, perKm: v }))}
              step={10}
            />
            <NumberField
              label="Por minuto ($)"
              value={cabifyParams.perMin}
              onChange={(v) => setCabifyParams((p) => ({ ...p, perMin: v }))}
              step={5}
            />
            <label className="flex items-center justify-between gap-2 text-xs text-gray-600">
              <span>Precio actual en la app ($, opcional)</span>
              <input
                type="number"
                className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-gray-900"
                placeholder="—"
                value={cabifyParams.manualPrice ?? ''}
                onChange={(e) =>
                  setCabifyParams((p) => ({
                    ...p,
                    manualPrice: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </label>
          </CostCard>
        </div>
      )}
    </div>
  )
}

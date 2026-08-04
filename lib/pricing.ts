export interface RouteInfo {
  distanceKm: number
  drivingMinutes: number
  transitMinutes: number | null
}

export interface CarParams {
  fuelPricePerLiter: number
  consumptionL100km: number
  parkingCost: number
  tollCost: number
}

export interface BusParams {
  farePerLeg: number
  legs: number
}

export interface RideHailParams {
  baseFare: number
  perKm: number
  perMin: number
  manualPrice: number | null
}

export const defaultCarParams: CarParams = {
  fuelPricePerLiter: 1200,
  consumptionL100km: 9,
  parkingCost: 0,
  tollCost: 0,
}

export const defaultBusParams: BusParams = {
  farePerLeg: 650,
  legs: 1,
}

export const defaultUberParams: RideHailParams = {
  baseFare: 900,
  perKm: 220,
  perMin: 80,
  manualPrice: null,
}

export const defaultCabifyParams: RideHailParams = {
  baseFare: 850,
  perKm: 210,
  perMin: 75,
  manualPrice: null,
}

export function calcCarCost(distanceKm: number, params: CarParams): number {
  const fuelCost = (distanceKm / 100) * params.consumptionL100km * params.fuelPricePerLiter
  return fuelCost + params.parkingCost + params.tollCost
}

export function calcBusCost(params: BusParams): number {
  return params.farePerLeg * params.legs
}

export function calcRideHailCost(
  distanceKm: number,
  minutes: number,
  params: RideHailParams
): number {
  if (params.manualPrice !== null && params.manualPrice > 0) {
    return params.manualPrice
  }
  return params.baseFare + params.perKm * distanceKm + params.perMin * minutes
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

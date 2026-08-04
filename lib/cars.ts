export interface CarModel {
  id: string
  brand: string
  model: string
  /** Consumo mixto estimado en litros cada 100 km. Aproximado: varía según versión, motorización y uso real. */
  consumptionL100km: number
}

export const CAR_LIST: CarModel[] = [
  { id: 'vw-up', brand: 'Volkswagen', model: 'Up!', consumptionL100km: 6.0 },
  { id: 'vw-gol-trend', brand: 'Volkswagen', model: 'Gol Trend', consumptionL100km: 7.5 },
  { id: 'vw-polo', brand: 'Volkswagen', model: 'Polo', consumptionL100km: 7.2 },
  { id: 'vw-virtus', brand: 'Volkswagen', model: 'Virtus', consumptionL100km: 7.3 },
  { id: 'vw-tcross', brand: 'Volkswagen', model: 'T-Cross', consumptionL100km: 7.8 },
  { id: 'vw-taos', brand: 'Volkswagen', model: 'Taos', consumptionL100km: 7.5 },
  { id: 'vw-amarok', brand: 'Volkswagen', model: 'Amarok (diésel)', consumptionL100km: 8.5 },

  { id: 'chevrolet-onix', brand: 'Chevrolet', model: 'Onix', consumptionL100km: 6.8 },
  { id: 'chevrolet-onix-plus', brand: 'Chevrolet', model: 'Onix Plus', consumptionL100km: 6.9 },
  { id: 'chevrolet-cruze', brand: 'Chevrolet', model: 'Cruze', consumptionL100km: 7.5 },
  { id: 'chevrolet-tracker', brand: 'Chevrolet', model: 'Tracker', consumptionL100km: 7.2 },
  { id: 'chevrolet-s10', brand: 'Chevrolet', model: 'S10 (diésel)', consumptionL100km: 9.5 },

  { id: 'toyota-etios', brand: 'Toyota', model: 'Etios', consumptionL100km: 6.5 },
  { id: 'toyota-yaris', brand: 'Toyota', model: 'Yaris', consumptionL100km: 6.8 },
  { id: 'toyota-corolla', brand: 'Toyota', model: 'Corolla', consumptionL100km: 7.4 },
  { id: 'toyota-corolla-cross', brand: 'Toyota', model: 'Corolla Cross', consumptionL100km: 7.6 },
  { id: 'toyota-hilux', brand: 'Toyota', model: 'Hilux (diésel)', consumptionL100km: 9.0 },
  { id: 'toyota-sw4', brand: 'Toyota', model: 'SW4 (diésel)', consumptionL100km: 10.0 },

  { id: 'ford-ka', brand: 'Ford', model: 'Ka', consumptionL100km: 6.8 },
  { id: 'ford-fiesta', brand: 'Ford', model: 'Fiesta', consumptionL100km: 7.3 },
  { id: 'ford-ecosport', brand: 'Ford', model: 'EcoSport', consumptionL100km: 7.6 },
  { id: 'ford-territory', brand: 'Ford', model: 'Territory', consumptionL100km: 7.8 },
  { id: 'ford-ranger', brand: 'Ford', model: 'Ranger (diésel)', consumptionL100km: 9.8 },

  { id: 'renault-kwid', brand: 'Renault', model: 'Kwid', consumptionL100km: 5.8 },
  { id: 'renault-sandero', brand: 'Renault', model: 'Sandero', consumptionL100km: 7.0 },
  { id: 'renault-logan', brand: 'Renault', model: 'Logan', consumptionL100km: 7.1 },
  { id: 'renault-duster', brand: 'Renault', model: 'Duster', consumptionL100km: 7.8 },
  { id: 'renault-oroch', brand: 'Renault', model: 'Duster Oroch', consumptionL100km: 8.0 },
  { id: 'renault-alaskan', brand: 'Renault', model: 'Alaskan (diésel)', consumptionL100km: 8.5 },

  { id: 'fiat-mobi', brand: 'Fiat', model: 'Mobi', consumptionL100km: 6.0 },
  { id: 'fiat-cronos', brand: 'Fiat', model: 'Cronos', consumptionL100km: 6.8 },
  { id: 'fiat-argo', brand: 'Fiat', model: 'Argo', consumptionL100km: 6.9 },
  { id: 'fiat-pulse', brand: 'Fiat', model: 'Pulse', consumptionL100km: 7.0 },
  { id: 'fiat-strada', brand: 'Fiat', model: 'Strada', consumptionL100km: 6.5 },
  { id: 'fiat-toro', brand: 'Fiat', model: 'Toro', consumptionL100km: 8.2 },

  { id: 'peugeot-208', brand: 'Peugeot', model: '208', consumptionL100km: 6.9 },
  { id: 'peugeot-2008', brand: 'Peugeot', model: '2008', consumptionL100km: 7.4 },
  { id: 'peugeot-308', brand: 'Peugeot', model: '308', consumptionL100km: 7.5 },
  { id: 'peugeot-partner', brand: 'Peugeot', model: 'Partner', consumptionL100km: 7.6 },

  { id: 'citroen-c3', brand: 'Citroën', model: 'C3', consumptionL100km: 7.0 },
  { id: 'citroen-c4-cactus', brand: 'Citroën', model: 'C4 Cactus', consumptionL100km: 7.3 },

  { id: 'honda-fit', brand: 'Honda', model: 'Fit', consumptionL100km: 6.8 },
  { id: 'honda-city', brand: 'Honda', model: 'City', consumptionL100km: 6.7 },
  { id: 'honda-civic', brand: 'Honda', model: 'Civic', consumptionL100km: 7.6 },
  { id: 'honda-hrv', brand: 'Honda', model: 'HR-V', consumptionL100km: 7.5 },

  { id: 'nissan-march', brand: 'Nissan', model: 'March', consumptionL100km: 6.9 },
  { id: 'nissan-versa', brand: 'Nissan', model: 'Versa', consumptionL100km: 7.0 },
  { id: 'nissan-kicks', brand: 'Nissan', model: 'Kicks', consumptionL100km: 7.3 },
  { id: 'nissan-frontier', brand: 'Nissan', model: 'Frontier (diésel)', consumptionL100km: 9.2 },

  { id: 'jeep-renegade', brand: 'Jeep', model: 'Renegade', consumptionL100km: 7.8 },
  { id: 'jeep-compass', brand: 'Jeep', model: 'Compass', consumptionL100km: 8.0 },

  { id: 'hyundai-hb20', brand: 'Hyundai', model: 'HB20', consumptionL100km: 6.5 },
  { id: 'hyundai-creta', brand: 'Hyundai', model: 'Creta', consumptionL100km: 7.4 },

  { id: 'suzuki-fun', brand: 'Suzuki', model: 'Fun', consumptionL100km: 6.2 },
  { id: 'suzuki-baleno', brand: 'Suzuki', model: 'Baleno', consumptionL100km: 6.8 },

  { id: 'chery-tiggo2', brand: 'Chery', model: 'Tiggo 2', consumptionL100km: 7.2 },
  { id: 'chery-tiggo3', brand: 'Chery', model: 'Tiggo 3', consumptionL100km: 7.6 },
]

export const CAR_BRANDS = Array.from(new Set(CAR_LIST.map((c) => c.brand))).sort()

export function carsByBrand(brand: string): CarModel[] {
  return CAR_LIST.filter((c) => c.brand === brand)
}

export function findCar(id: string): CarModel | undefined {
  return CAR_LIST.find((c) => c.id === id)
}

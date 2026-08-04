# TransBot 🚦

Comparador de costos de transporte: ingresá un origen y un destino y compará cuánto te
conviene ir en **auto propio**, en **colectivo/bondi**, en **Uber** o en **Cabify**.

## Cómo funciona

- El origen y destino se buscan con el autocompletado de **Google Places** y la ruta
  (distancia y tiempo) se calcula con la **Directions API** de Google Maps (modo auto y,
  cuando hay datos disponibles, modo transporte público).
- **Auto propio**: se elige el auto de una lista de modelos comunes en Argentina, que
  autocompleta el consumo (L/100km) — igual queda editable por si el uso real difiere.
  El precio de la nafta se trae automáticamente de
  [surtidores.com.ar](https://surtidores.com.ar/precios/) (endpoint propio en
  `app/api/fuel-price`); si no se puede obtener, se puede cargar a mano. Se suman
  estacionamiento y peajes (editables).
- **Colectivo/bondi**: tarifa SUBE por tramo, editable, con la cantidad de colectivos
  necesarios.
- **Uber / Cabify**: como ninguna de las dos apps ofrece una API pública de precios,
  se calcula una **estimación** (tarifa base + $/km + $/min, todo editable). También se
  puede cargar el precio real que muestra la app en ese momento, que reemplaza al
  estimado. Se aclara siempre que el cálculo es aproximado y puede variar según demanda,
  tarifa dinámica y otros factores externos.
- Si no hay una clave de Google Maps configurada, o mientras se prueba, se puede tildar
  **"Ingresar distancia y tiempo manualmente"** para cargar esos datos a mano y comparar
  igual.
- La opción más barata queda resaltada.

## Setup rápido

```bash
cp .env.example .env
# Completar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY con una clave que tenga habilitadas
# las APIs: Maps JavaScript API, Places API y Directions API
# https://console.cloud.google.com/google/maps-apis/credentials

npm install
npm run dev
```

Abrir http://localhost:3000

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `@react-google-maps/api` para el mapa, autocompletado de direcciones y cálculo de rutas

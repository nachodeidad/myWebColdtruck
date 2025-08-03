import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Iconos personalizados para origen y destino
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'origin-marker'
})

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'destination-marker'
})

export interface MapViewProps {
  origin: [number, number]         // [lng, lat]
  destination: [number, number]    // [lng, lat]
  path?: [number, number][]        // Array de puntos [lng, lat]
}

// Componente para manejar actualizaciones del mapa sin re-crear
const MapUpdater: React.FC<MapViewProps> = ({ origin, destination, path }) => {
  const map = useMap()
  const prevBounds = useRef<L.LatLngBounds | null>(null)

  // Asegura el invalidateSize al montar
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])

  useEffect(() => {
    try {
      const bounds = L.latLngBounds([])

      // Validar que las coordenadas sean válidas
      if (origin && origin.length === 2 && !isNaN(origin[0]) && !isNaN(origin[1])) {
        bounds.extend([origin[1], origin[0]]) // [lat, lng]
      }

      if (destination && destination.length === 2 && !isNaN(destination[0]) && !isNaN(destination[1])) {
        bounds.extend([destination[1], destination[0]]) // [lat, lng]
      }

      // Si hay path válido, agregar todos los puntos
      if (path && Array.isArray(path) && path.length > 0) {
        path.forEach(point => {
          if (point && point.length === 2 && !isNaN(point[0]) && !isNaN(point[1])) {
            bounds.extend([point[1], point[0]]) // [lat, lng]
          }
        })
      }

      // Solo actualizar si los bounds han cambiado significativamente
      if (bounds.isValid()) {
        const currentBounds = bounds
        if (!prevBounds.current || !prevBounds.current.equals(currentBounds)) {
          setTimeout(() => {
            try {
              map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 15
              })
              prevBounds.current = currentBounds
            } catch (error) {
              console.warn('Error fitting bounds:', error)
            }
          }, 100)
        }
      }
    } catch (error) {
      console.warn('Error in MapUpdater:', error)
    }
  }, [map, origin, destination, path])

  return null
}

const MapView: React.FC<MapViewProps> = ({ origin, destination, path }) => {
  // Validar props de entrada
  const isValidCoordinate = (coord: [number, number]) => {
    return coord &&
      Array.isArray(coord) &&
      coord.length === 2 &&
      !isNaN(coord[0]) &&
      !isNaN(coord[1]) &&
      coord[0] >= -180 && coord[0] <= 180 &&
      coord[1] >= -90 && coord[1] <= 90
  }

  if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
    return (
      <div className="relative">
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">⚠️ Invalid coordinates</div>
            <div className="text-sm text-gray-400">
              Origin: {JSON.stringify(origin)}<br />
              Destination: {JSON.stringify(destination)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calcula centro entre los puntos
  const center: [number, number] = [
    (origin[1] + destination[1]) / 2,  // latitud promedio
    (origin[0] + destination[0]) / 2   // longitud promedio
  ]

  // Convertir y validar path
  const pathPositions: [number, number][] = []
  if (path && Array.isArray(path) && path.length > 0) {
    path.forEach(point => {
      if (isValidCoordinate(point)) {
        pathPositions.push([point[1], point[0]]) // Convertir [lng, lat] a [lat, lng]
      }
    })
  }

  // Debugging detallado
  console.log('=== MapView Debug ===')
  console.log('Origin:', origin)
  console.log('Destination:', destination)
  console.log('Path raw:', path)
  console.log('Path length:', path?.length || 0)
  console.log('Path positions converted:', pathPositions)
  console.log('Path positions length:', pathPositions.length)
  console.log('Center:', center)
  console.log('=====================')

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Componente para manejar actualizaciones */}
        <MapUpdater origin={origin} destination={destination} path={path} />

        {/* Marcador de origen */}
        <Marker
          position={[origin[1], origin[0]]}
          icon={originIcon}
        />

        {/* Marcador de destino */}
        <Marker
          position={[destination[1], destination[0]]}
          icon={destinationIcon}
        />

        {/* Línea de ruta si hay datos válidos */}
        {pathPositions.length > 1 && (
          <Polyline
            positions={pathPositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Línea directa como fallback si no hay path válido */}
        {pathPositions.length <= 1 && (
          <Polyline
            positions={[
              [origin[1], origin[0]],
              [destination[1], destination[0]]
            ]}
            pathOptions={{
              color: '#ef4444',
              weight: 2,
              opacity: 0.6,
              dashArray: '10, 5'
            }}
          />
        )}
      </MapContainer>

      {/* Indicadores de estado */}
      <div className="absolute top-4 left-4 z-[1] bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="font-medium">Origin</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[1] bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="font-medium">Destination</span>
        </div>
      </div>

      {/* Indicador de estado de la ruta */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
        {pathPositions.length > 1 ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
            <span className="font-medium">Route ({pathPositions.length} points)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 rounded-full opacity-60" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, #ef4444 4px, #ef4444 8px)'
            }}></div>
            <span className="font-medium">Direct line (no route data)</span>
          </div>
        )}
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-xs max-w-xs">
          <div>Path: {path?.length || 0} points</div>
          <div>Valid: {pathPositions.length} points</div>
          <div>Origin: [{origin[0]?.toFixed(3)}, {origin[1]?.toFixed(3)}]</div>
          <div>Dest: [{destination[0]?.toFixed(3)}, {destination[1]?.toFixed(3)}]</div>
        </div>
      )}
    </div>
  )
}

export default MapView

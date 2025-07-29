import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapViewProps {
  origin: [number, number]         // [lng, lat]
  destination: [number, number]    // [lng, lat]
  path?: [number, number][]        // Array de puntos [lng, lat]
}

const MapView: React.FC<MapViewProps> = ({ origin, destination, path }) => {
  // Calcula centro entre los puntos, pero ¡ojo! en [lat, lng]
  const center: [number, number] = [
    (origin[1] + destination[1]) / 2,  // latitud promedio
    (origin[0] + destination[0]) / 2   // longitud promedio
  ]

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '400px', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[origin[1], origin[0]]} />
      <Marker position={[destination[1], destination[0]]} />
      {path && (
        <Polyline positions={path.map((p) => [p[1], p[0]])} color="blue" />
      )}
    </MapContainer>
  )
}

export default MapView

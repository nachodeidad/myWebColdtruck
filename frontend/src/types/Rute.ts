export interface GeoPoint {
    type: 'Point'
    coordinates: [number, number]
}

export interface Rute {
    _id: number
    name: string
    maxTemp: number
    minTemp: number
    maxHum: number
    minHum: number
    origin: GeoPoint
    destination: GeoPoint
    IDAdmin: number
}

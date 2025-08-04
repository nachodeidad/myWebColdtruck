export interface Tracking {
    _id: string;
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    dateTime: string;
    IDTrip: number;
}

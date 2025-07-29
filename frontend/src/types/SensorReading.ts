export interface SensorReading {
    _id: number;
    tempReadingValue: number;
    humReadingValue: number;
    dateTime: string;
    IDSensor: string;
    IDTrip?: number;
}
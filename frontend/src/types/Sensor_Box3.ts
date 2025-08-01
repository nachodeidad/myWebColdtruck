export interface Sensor_Box3 {
    _id: number;
    IDSensor: string | { _id: string; status: string; type: string };
    IDBox: number | { _id: number; status: string };
    dateStart: string;
    dateEnd: string | null;
}


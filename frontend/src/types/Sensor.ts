export interface Sensor {
    _id: string;
    type: "Temperature" | "Humidity" | "Temp&Hum";
    status: "Active" | "Out of Service";
}
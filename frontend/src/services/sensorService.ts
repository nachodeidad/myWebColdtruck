import { Sensor } from "../types/Sensor";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/sensors'

const BASE_URL_Active = '/sensors/Active'

export const getSensors = async (): Promise<Sensor[]> => {
    const { data } = await apiLocalHost.get<Sensor[]>(BASE_URL)
    return data
}

export const getSensorsActive= async (): Promise<Sensor[]> => {
    const { data } = await apiLocalHost.get<Sensor[]>(BASE_URL_Active)
    return data
}

export const createSensor = async (payload: Omit<Sensor, '_id'>): Promise<Sensor> => {
    const { data } = await apiLocalHost.post<Sensor>(BASE_URL, payload);
    return data;
}

export const updateSensor = async (id: string, data: Partial<Sensor>) => {
    const res = await apiLocalHost.put(`/sensors/${id}`, data)
    return res.data
}

// Tipo de respuesta esperada desde el endpoint
export interface ActiveBoxResponse {
    IDBox: string;
    status: string;
}

// Consulta para obtener la caja activa de un sensor
export const getActiveBoxBySensor = async (sensorId: string): Promise<ActiveBoxResponse | null> => {
    try {
        const response = await apiLocalHost.get<ActiveBoxResponse>(`/sensor_box/active-box/${sensorId}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Error del servidor:", error.response.data);
        } else {
            console.error("Error al conectar con el servidor:", error.message);
        }
        return null;
    }
};
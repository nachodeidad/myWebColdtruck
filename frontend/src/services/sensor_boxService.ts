import { Sensor_Box } from "../types/Sensor_Box";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/sensor_box'

export const getSensors = async (): Promise<Sensor_Box[]> => {
    const { data } = await apiLocalHost.get<Sensor_Box[]>(BASE_URL)
    return data
}

export const createSensor_Box = async (payload: Omit<Sensor_Box, '_id'>): Promise<Sensor_Box> => {
    const { data } = await apiLocalHost.post<Sensor_Box>(BASE_URL, payload);
    return data;
}
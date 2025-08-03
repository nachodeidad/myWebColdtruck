import { Sensor_Box } from "../types/Sensor_Box";
import apiLocalHost from "./apiLocalHost";
import type { Sensor } from "../types/Sensor";

const BASE_URL = '/sensor_box'
const URL_MORE = '/sensor_box/available-sensors'

export const getSensor_box = async (): Promise<Sensor_Box[]> => {
    const { data } = await apiLocalHost.get<Sensor_Box[]>(BASE_URL)
    return data
}

export const createSensor_Box = async (payload: Omit<Sensor_Box, '_id'>): Promise<Sensor_Box> => {
    const { data } = await apiLocalHost.post<Sensor_Box>(BASE_URL, payload);
    return data;
}

export const getSensor_boxAvailable = async (): Promise<Sensor[]> => {
    const { data } = await apiLocalHost.get<Sensor[]>(URL_MORE)
    return data
}
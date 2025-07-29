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
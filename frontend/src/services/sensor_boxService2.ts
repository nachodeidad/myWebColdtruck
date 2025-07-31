import { Sensor_Box2 } from "../types/Sensor_Box2";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/sensor_box'

export const getSensor_box2 = async (): Promise<Sensor_Box2[]> => {
    const { data } = await apiLocalHost.get<Sensor_Box2[]>(BASE_URL)
    return data
}

export const createSensor_Box2 = async (payload: Omit<Sensor_Box2, '_id'>): Promise<Sensor_Box2> => {
    const { data } = await apiLocalHost.post<Sensor_Box2>(BASE_URL, payload);
    return data;
}
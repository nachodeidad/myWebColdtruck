import { Sensor_Box3 } from "../types/Sensor_Box3";
import { Sensor } from "../types/Sensor";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/sensor_box'
const URL_MORE = '/sensor_box/available-sensors'

export const getSensor_box3 = async (): Promise<Sensor_Box3[]> => {
    const { data } = await apiLocalHost.get<Sensor_Box3[]>(BASE_URL)
    return data
}

export const createSensor_Box3 = async (payload: Omit<Sensor_Box3, '_id'>): Promise<Sensor_Box3> => {
    const { data } = await apiLocalHost.post<Sensor_Box3>(BASE_URL, payload);
    return data;
}

export const getSensor_boxAvailable3 = async (): Promise<Sensor[]> => {
    const { data } = await apiLocalHost.get<Sensor[]>(URL_MORE);
    return data;
};

export const deassignSensorBox = async (boxId: number): Promise<Sensor_Box3> => {
    const { data } = await apiLocalHost.put<Sensor_Box3>(`${BASE_URL}/deassign/${boxId}`);
    return data;
};

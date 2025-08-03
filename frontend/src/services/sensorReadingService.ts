import apiLocalHost from './apiLocalHost';
import type { SensorReading } from '../types/SensorReading';

const BASE_URL = '/sensorReadings';

export const getSensorReadings = async (): Promise<SensorReading[]> => {
    const { data } = await apiLocalHost.get<SensorReading[]>(BASE_URL);
    return data;
};

export const createSensorReading = async (payload: Omit<SensorReading, '_id'>): Promise<SensorReading> => {
    const { data } = await apiLocalHost.post<SensorReading>(BASE_URL, payload);
    return data;
};

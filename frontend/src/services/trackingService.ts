import apiLocalHost from './apiLocalHost';
import type { Tracking } from '../types';

const BASE_URL = '/tracking';

export const getTrackingByTrip = async (tripId: number): Promise<Tracking[]> => {
    const { data } = await apiLocalHost.get<Tracking[]>(`${BASE_URL}/trip/${tripId}`);
    return data;
};

import apiLocalHost from './apiLocalHost';
import type { Alert } from '../types/Alert';

const BASE_URL = '/alerts';

export const getAlerts = async (): Promise<Alert[]> => {
    const { data } = await apiLocalHost.get<Alert[]>(BASE_URL);
    return data;
};

export const getAlertsByTruck = async () => {
    const { data } = await apiLocalHost.get(BASE_URL + '/byTruck');
    return data;
};

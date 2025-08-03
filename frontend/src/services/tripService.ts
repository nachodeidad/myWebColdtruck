import apiLocalHost from './apiLocalHost'
import type { Trip } from '../types/Trip'

const BASE_URL = '/trips'
const SPECIFIC_URL = '/trips/specific'

export const getTrips = async (): Promise<Trip[]> => {
    const { data } = await apiLocalHost.get<Trip[]>(SPECIFIC_URL)
    return data
}

export interface TripInput {
    scheduledDepartureDate: string
    scheduledArrivalDate: string
    IDDriver: number
    IDAdmin: number
    IDBox: number
    IDRute: number
    IDTruck: number
    IDCargoType: number
}

export const createTrip = async (payload: TripInput): Promise<Trip> => {
    const { data } = await apiLocalHost.post<Trip>(BASE_URL, payload)
    return data
}

export const getTripById = async (id: string): Promise<Trip> => {
    const { data } = await apiLocalHost.get<Trip>(`${BASE_URL}${id}`);
    return data;
};

export const updateTrip = async (id: string, payload: Partial<{ scheduledDepartureDate: string; scheduledArrivalDate: string; status: string; }>): Promise<Trip> => {
    const { data } = await apiLocalHost.put<Trip>(`${BASE_URL}/${id}`, payload);
    return data;
};
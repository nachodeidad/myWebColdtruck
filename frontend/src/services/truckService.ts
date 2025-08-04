import apiLocalHost from "./apiLocalHost";
import { Truck } from "../types/Truck";

export interface TruckInput {
    plates: string;
    loadCapacity: number;
    status?: "Available";
    IDAdmin: number;
    IDBrand: number;
    IDModel: number;
}

export const createTruck = async (payload: TruckInput): Promise<Truck> => {
    const { data } = await apiLocalHost.post<Truck>("/trucks", {
        ...payload,
        status: "Available",
    });
    return data;
};

export const getTrucks = async (): Promise<Truck[]> => {
    const { data } = await apiLocalHost.get<Truck[]>("/trucks");
    return data;
};

export const updateTruck = async (
    id: number,
    payload: Partial<TruckInput>
): Promise<Truck> => {
    const { data } = await apiLocalHost.put<Truck>(`/trucks/${id}`, payload);
    return data;
};

export const getTrucksAvailable = async (): Promise<Truck[]> => {
    const { data } = await apiLocalHost.get<Truck[]>("/trucks/Available");
    return data;
};
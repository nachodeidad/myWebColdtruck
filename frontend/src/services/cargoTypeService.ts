import { CargoType } from "../types/CargoType";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/cargoType'

export const getCargoTypes = async (): Promise<CargoType[]> => {
    const { data } = await apiLocalHost.get<CargoType[]>(BASE_URL)
    return data
}

export const createCargoType = async (payload: Omit<CargoType, '_id'>): Promise<CargoType> => {
    const { data } = await apiLocalHost.post<CargoType>(BASE_URL, payload);
    return data;
}

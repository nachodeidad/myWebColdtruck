import { Box } from "../types/Box";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/boxs'

const BASE_URL_Available = '/boxs/Available'

export const getBoxs = async (): Promise<Box[]> => {
    const { data } = await apiLocalHost.get<Box[]>(BASE_URL)
    return data
}

export const getBoxsAvailable = async (): Promise<Box[]> => {
    const { data } = await apiLocalHost.get<Box[]>(BASE_URL_Available)
    return data
}

export const createBox = async (payload: Omit<Box, '_id'>): Promise<Box> => {
    const { data } = await apiLocalHost.post<Box>(BASE_URL, payload);
    return data;
}

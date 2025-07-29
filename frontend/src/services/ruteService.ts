import apiLocalHost from './apiLocalHost'
import type { Rute } from '../types/Rute'

const BASE_URL = '/rutes'

export const getRutes = async (): Promise<Rute[]> => {
    const { data } = await apiLocalHost.get<Rute[]>(BASE_URL)
    return data
}

export const createRute = async (payload: Omit<Rute, '_id'>): Promise<Rute> => {
    const { data } = await apiLocalHost.post<Rute>(BASE_URL, payload)
    return data
}

export const getRuteGeometry = async (id: number): Promise<[number, number][]> => {
    const { data } = await apiLocalHost.get<[number, number][]>(`${BASE_URL}/${id}/geometry`)
    return data
}

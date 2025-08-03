import { Model } from "../types/Model";
import axios from "axios";

const API_URL = "http://localhost:5000/api/models";
const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

export async function getModels(): Promise<Model[]> {
    const res = await fetch(API_URL);
    return res.json();
}

export async function getModelsByBrand(IDBrand: number): Promise<Model[]> {
    const { data } = await api.get<Model[]>("/models", { params: { IDBrand } });
    return data;
}

interface ModelInput {
    name: string;
    IDBrand: number;
}

export const createModel = async (
        payload: { name: string; IDBrand: number }
    ): Promise<Model> => {
        const { data } = await api.post<Model>("/models", payload);
        return data;
};
import axios from "axios";
import { Brand } from "../types/Brand";

const API_URL = "http://localhost:5000/api/brands";
export const getBrands = async (): Promise<Brand[]> => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const createBrand = async (name: string): Promise<Brand> => {
    const res = await axios.post(API_URL, { name });
    return res.data;
};


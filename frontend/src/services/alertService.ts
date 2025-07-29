import { Alert } from "../types/Alert";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/alerts';

export const getAlerts = async (): Promise<Alert[]> => {
  const { data } = await apiLocalHost.get<Alert[]>(BASE_URL);
  return data;
};
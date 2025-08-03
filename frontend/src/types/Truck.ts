import { Brand } from "./Brand";
import { Model } from "./Model";

export interface Truck {
    _id: number;
    plates: string;
    loadCapacity: number;
    status: "Available" | "On Trip" | "Under Maintenance" | "Inactive";
    IDAdmin: number;
    IDBrand: number | Brand;
    IDModel: number | Model;
}

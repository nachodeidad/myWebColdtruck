export interface Box {
    _id: number;
    status: "Available" | "On Trip" | "Under Maintenance" | "Inactive";
    length: number;
    width: number;
    height: number;
    maxWeigth: number;
    IDAdmin: number;
}
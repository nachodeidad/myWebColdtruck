export interface Alert {
    _id: number;
    type: 'Cancellation' | 'Route Started' | 'Route Ended' | 'High Temperature' | 'Low Temperature' | 'High Humidity' | 'Low Humidity';
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

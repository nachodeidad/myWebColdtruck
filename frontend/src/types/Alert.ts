export interface Alert {
    _id: number;
    type: 'Cancellation' | 'Route Started' | 'Route Ended' | 'High Temperature' | 'Low Temperature';
    description: string;
}
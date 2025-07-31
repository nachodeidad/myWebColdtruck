export interface Sensor_Box2 {
  _id: number;
  IDSensor?: {
    _id: number;
    type: string;
    status: string;
    // otros campos opcionales
  } | string; // <-- Puede ser string si aún no está populado
  IDBox?: {
    _id: number;
    status: string;
    // otros campos opcionales
  } | number;
  dateStart: string;
}

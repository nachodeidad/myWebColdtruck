export interface Sensor_Box2 {
  _id: number;
  IDSensor?: {
    _id: number;
    type: string;
    status: string;
  } | string;
  IDBox?: {
    _id: number;
    status: string;
  } | number;
  dateStart: string;
  dateEnd: string;
}

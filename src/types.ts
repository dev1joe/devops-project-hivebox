export type Sensor = {
  boxId: string,
  sensorId: string,
}

export type SensorLatestMeasurement = {
  title: string,
  unit: string,
  sensorType: string,
  icon: string,
  _id: string,
  lastMeasurement: {
    createdAt: string,
    value: string,
  }
}

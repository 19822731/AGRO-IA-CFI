export interface DepartmentData {
  id: string
  name: string
  area: number
  production: number
  yield: number
  levelId: string
  coordinates: {
    lat: number
    lng: number
  }
}

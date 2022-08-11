import { Vector3 } from "../utils";
import { Vector2 } from "../utils/Vector2";

export interface PolyZoneOptions {
  name?: string,
  minZ?: number,
  maxZ?: number,
  gridDivisions?: number,
  debugGrid?: boolean,
  useGrid?: boolean,
  useZ?: boolean // CircleZone
  lazyGrid?: boolean
  debugPoly?: boolean
  debugColors?: DebugColors
  data?: any
  // Other options
  center?: Vector3,
  min?: Vector2;
  max?: Vector2;
  size?: Vector2;
  area?: number,
}

export interface CircleOptions extends Omit<PolyZoneOptions, "debugColors"> {
  debugColors?: [number, number, number]
}
export interface BoxOptions extends PolyZoneOptions {
  scale?: [number, number, number] | [number, number, number, number, number, number];
  offset?: [number, number, number] | [number, number, number, number, number, number];
  heading?: number;
}

export interface DebugColors {
  walls: [number, number, number]
  outline: [number, number, number]
  grid: [number, number, number]
}
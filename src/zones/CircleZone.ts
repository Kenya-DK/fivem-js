import { CircleOptions, MarkerType } from "../enums";
import { Color, Vector3 } from "../utils";
import { BasePoly } from "./BasePoly";
import { World } from "../World";

export class CircleZone extends BasePoly {

  public name: string;
  public center: Vector3;
  public radius: number;
  public diameter: number;
  public debugPoly: boolean;
  public debugColor: [number, number, number];
  public data: any;
  public destroyed: boolean;
  constructor(center: Vector3, radius: number, options?: CircleOptions) {
    super([], { ...options, debugColors: undefined }, "Circle");
    this.center = center;
    this.radius = radius;
    this.diameter = radius * 2;
    this.debugPoly = options.debugPoly || false;
    this.debugColor = options.debugColors || [0, 255, 0];
    this.data = options.data || null;
  }

  public draw() {
    const center = this.center
    const [r, g, b] = this.debugColor;
    if (this.useZ)
      World.drawMarker(MarkerType.DebugSphere, center, new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(this.radius, this.radius, this.radius), new Color(84, r, g, b))
    else
      World.drawMarker(MarkerType.VerticalCylinder, new Vector3(center.x, center.y, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(this.diameter, this.diameter, 400), new Color(50, r, g, b))
  }

  public isPointInside(point: Vector3): boolean {
    if (this.destroyed) {
      console.log("[Fivem-Js-PolyZone] Error: PolyZone is destroyed");
      return false;
    }
    const center = this.center
    const radius = this.radius
    if (this.useZ)
      return center.distance(point) <= radius
    else 
      return point.distance2D(center) <= radius
  }

  public setRadius(radius: number) {
    if (this.radius == radius) return;
    this.radius = radius;
    this.diameter = radius * 2;
  }
  public getCenter() {
    return this.center
  }
  public setCenter(center: Vector3) {
    if (this.center == center) return;
    this.center = center;
  }
}
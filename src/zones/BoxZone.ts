import { BoxOptions } from "../enums";
import { BoxZoneCalculateMinAndMaxZ, degreesToRadians, Vector2, Vector3 } from "../utils";
import { BasePoly } from "./BasePoly";


const defaultMinOffset = new Vector3(0, 0, 0)
const defaultMaxOffset = new Vector3(0, 0, 0)
const defaultMinScale = new Vector3(1, 1, 1)
const defaultMaxScale = new Vector3(1, 1, 1)
const defaultScaleZ = [defaultMinScale.z, defaultMaxScale.z]
const defaultOffsetZ = [defaultMinOffset.z, defaultMaxOffset.z]
export class BoxZone extends BasePoly {

  public length: number;
  public width: number;
  public startPos: Vector2;
  public offsetPos: Vector2;
  public offsetRot: number;
  public minScale: Vector3;
  public maxScale: Vector3;
  public minOffset: Vector3;
  public maxOffset: Vector3;
  public scaleZ: number[];
  public offsetZ: number[];
  constructor(center: Vector3, length: number, width: number, options?: BoxOptions) {
    let [minOffset, maxOffset, minScale, maxScale] = [defaultMinOffset, defaultMaxOffset, defaultMinScale, defaultMaxScale]
    let [scaleZ, offsetZ] = [defaultScaleZ, defaultOffsetZ]

    if (options.scale != null || options.offset != null) {
      [minOffset, maxOffset, minScale, maxScale] = CalculateScaleAndOffset(options);
      [scaleZ, offsetZ] = [[minScale.z, maxScale.z], [minOffset.z, maxOffset.z]]
    }
    const points = CalculatePoints(center, length, width, minScale, maxScale, minOffset, maxOffset)

    const min = points[0]
    const max = points[3]
    const size = max.subtract(min)

    const [minZ, maxZ] = BoxZoneCalculateMinAndMaxZ(options.minZ, options.maxZ, scaleZ, offsetZ)
    options.minZ = minZ
    options.maxZ = maxZ

    // Box Zones don't use the grid optimization because they are already rectangles/cubes
    options.useGrid = false

    // Pre-setting all these values to avoid PolyZone:new() having to calculate them
    options.min = min
    options.max = max
    options.size = size
    options.center = center
    options.area = size.x * size.y
    super(points, options, "Box");


    this.length = length
    this.width = width
    this.startPos = center.toVector2()
    this.offsetPos = new Vector2(0.0, 0.0)
    this.offsetRot = options.heading || 0.0
    this.minScale, this.maxScale = minScale, maxScale
    this.minOffset, this.maxOffset = minOffset, maxOffset
    this.scaleZ, this.offsetZ = scaleZ, offsetZ
  }

  public transformPoint(point: Vector3) {    
    const rot = this.rotate(this.startPos, point.toVector2(), this.offsetRot).add(this.offsetPos);
    return new Vector3(rot.x, rot.y, point.z)
  }

  public isPointInside(point: Vector3): boolean {
    if (this.destroyed) {
      console.log("[Fivem-Js-PolyZone] Error: PolyZone is destroyed");
      return false;
    }
    const startPos = this.startPos
    const actualPos = point.toVector2().subtract(this.offsetPos)
    if (actualPos.distance(startPos) > this.boundingRadius) return false

    const rotatedPoint = this.rotate(startPos, actualPos, -this.offsetRot);
    const [pX, pY, pZ] = [rotatedPoint.x, rotatedPoint.y, point.z];
    const [min, max] = [this.min, this.max];
    const [minX, minY, maxX, maxY] = [min.x, min.y, max.x, max.y]
    const [minZ, maxZ] = [this.minZ, this.maxZ]

    if (pX < minX || pX > maxX || pY < minY || pY > maxY) return false

    if ((minZ && pZ < minZ) || (maxZ && pZ > maxZ)) return false
    return true
  }

  public rotate(origin: Vector2, point: Vector2, theta: number): Vector2 {
    if (theta == 0.0) return point
    const p = point.subtract(origin)
    const [pX, pY] = [p.x, p.y]
    theta = degreesToRadians(theta)
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    const x = pX * cosTheta - pY * sinTheta
    const y = pX * sinTheta + pY * cosTheta
    const vec = new Vector2(x, y).add(origin)
    return new Vector2(vec.x, vec.y)
  }
}

const CalculatePoints = (center: Vector3, length: number, width: number, minScale: Vector3, maxScale: Vector3, minOffset: Vector3, maxOffset: Vector3): Vector3[] => {
  const [halfLength, halfWidth] = [length / 2, width / 2]
  let min = new Vector3(-halfWidth, -halfLength, 0.0)
  let max = new Vector3(halfWidth, halfLength, 0.0)
  min = min.multiply(minScale.subtract(minOffset))
  max = max.multiply(maxScale.add(maxOffset))

  const p1 = center.toVector2().add(new Vector2(min.x, min.y))
  const p2 = center.toVector2().add(new Vector2(max.x, min.y))
  const p3 = center.toVector2().add(new Vector2(max.x, max.y))
  const p4 = center.toVector2().add(new Vector2(min.x, max.y))
  return [
    new Vector3(p1.x, p1.y, 0.0),
    new Vector3(p2.x, p2.y, 0.0),
    new Vector3(p3.x, p3.y, 0.0),
    new Vector3(p4.x, p4.y, 0.0)
  ]
}

const CalculateScaleAndOffset = (options: BoxOptions) => {
  let scale = options.scale || [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
  let offset = options.offset || [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

  if (scale.length != 3 && scale.length != 6) throw new Error("Scale must be an array of 3 or 6 values")
  if (offset.length != 3 && offset.length != 6) throw new Error("Offset must be an array of 3 or 6 values")

  if (scale.length == 3)
    scale = [scale[0], scale[0], scale[1], scale[1], scale[2], scale[2]]

  if (offset.length == 3)
    offset = [offset[0], offset[0], offset[1], offset[0], offset[1], offset[1]]
  const minOffset = new Vector3(offset[2], offset[1], offset[5])
  const maxOffset = new Vector3(offset[3], offset[0], offset[4])
  const minScale = new Vector3(scale[2], scale[1], scale[5])
  const maxScale = new Vector3(scale[3], scale[0], scale[4])
  return [minOffset, maxOffset, minScale, maxScale]
}
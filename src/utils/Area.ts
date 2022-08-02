import { Color } from ".."
import { PolyZoneOptions } from "../models"
import { PolyZone } from "../PolyZone"
import { World } from "../World"
import { Delay } from "./Delay"
import { Vector2 } from "./Vector2"
import { Vector3 } from "./Vector3"

export const DrawWall = (p1: Vector3, p2: Vector3, minZ: number, maxZ: number, color: Color) => {
  const bottomLeft = new Vector3(p1.x, p1.y, minZ)
  const topLeft = new Vector3(p1.x, p1.y, maxZ)
  const bottomRight = new Vector3(p2.x, p2.y, minZ)
  const topRight = new Vector3(p2.x, p2.y, maxZ)

  World.drawPoly(bottomLeft, topLeft, bottomRight, color);
  World.drawPoly(topLeft, topRight, bottomRight, color);
  World.drawPoly(bottomRight, topRight, topLeft, color);
  World.drawPoly(bottomRight, topLeft, bottomLeft, color);
}
export const DrawGrid = (poly: PolyZone) => {

}
export const PointInPoly = (point: Vector3, poly: PolyZone): boolean => {
  const x = point.x
  const y = point.y
  const min = poly.min
  const minX = min.x
  const minY = min.y
  const max = poly.max
  // Checks if point is within the polygon's bounding box
  if (x < minX ||
    x > max.x ||
    y < minY ||
    y > max.y)
    return false

  // Checks if point is within the polygon's height bounds
  const minZ = poly.minZ
  const maxZ = poly.maxZ
  const z = point.z
  if ((minZ && z < minZ) || (maxZ && z > maxZ))
    return false

  // Returns true if the grid cell associated with the point is entirely inside the poly
  const grid = poly.grid
  if (grid) {
    // local gridDivisions = poly.gridDivisions
    // local size = poly.size
    // local gridPosX = x - minX
    // local gridPosY = y - minY
    // local gridCellX = (gridPosX * gridDivisions) // size.x
    // local gridCellY = (gridPosY * gridDivisions) // size.y
    // local gridCellValue = grid[gridCellY + 1][gridCellX + 1]
    // if gridCellValue == nil and poly.lazyGrid then
    // gridCellValue = _isGridCellInsidePoly(gridCellX, gridCellY, poly)
    // grid[gridCellY + 1][gridCellX + 1] = gridCellValue
    // if gridCellValue then return true end
  }
  return WindingNumber(point, poly.points)
}
export const IsIntersecting = (a: Vector2, b: Vector2, c: Vector3, d: Vector3): boolean => {
  const ax_minus_cx = a.x - c.x
  const bx_minus_ax = b.x - a.x
  const dx_minus_cx = d.x - c.x
  const ay_minus_cy = a.y - c.y
  const by_minus_ay = b.y - a.y
  const dy_minus_cy = d.y - c.y
  const denominator = ((bx_minus_ax) * (dy_minus_cy)) - ((by_minus_ay) * (dx_minus_cx))
  const numerator1 = ((ay_minus_cy) * (dx_minus_cx)) - ((ax_minus_cx) * (dy_minus_cy))
  const numerator2 = ((ay_minus_cy) * (bx_minus_ax)) - ((ax_minus_cx) * (by_minus_ay))

  if (denominator == 0) return numerator1 == 0 && numerator2 == 0

  const r = numerator1 / denominator
  const s = numerator2 / denominator

  return (r >= 0 && r <= 1) && (s >= 0 && s <= 1)
}
export const IsLeft = (p0: Vector2, p1: Vector2, p2: Vector2) => {
  const p0x = p0.x
  const p0y = p0.y
  return ((p1.x - p0x) * (p2.y - p0y)) - ((p2.x - p0x) * (p1.y - p0y))
}
export const WindingNumber = (point: Vector2, points: Vector2[]) => {
  let wn = 0
  for (let index = 0; index < points.length - 2; index++) {
    wn = Wn_inner_loop(points[index], points[index + 1], point, wn)
  }
  wn = Wn_inner_loop(points[points.length - 1], points[1], point, wn)
  return wn != 0
}
export const Wn_inner_loop = (p0: Vector2, p1: Vector2, p2: Vector2, wn: number) => {
  const p2y = p2.y
  if (p0.y <= p2y) {
    if (p1.y > p2y) {
      if (IsLeft(p0, p1, p2) > 0) {
        return wn + 1
      }
    }
  } else {
    if (p1.y <= p2y)
      if (IsLeft(p0, p1, p2) < 0)
        return wn - 1
  }
  return wn
}
export const CalculateGridCellPoints = (cellX: number, cellY: number, poly: PolyZone) => {
  const gridCellWidth = poly.gridCellWidth
  const gridCellHeight = poly.gridCellHeight
  const min = poly.min
  const x = cellX * gridCellWidth + min.x
  const y = cellY * gridCellHeight + min.y
  return [
    new Vector2(x, y),
    new Vector2(x + gridCellWidth, y),
    new Vector2(x + gridCellWidth, y + gridCellHeight),
    new Vector2(x, y + gridCellHeight),
    new Vector2(x, y)
  ]
}
export const IsGridCellInsidePoly = (cellX: number, cellY: number, poly: PolyZone) => {
  const gridCellPoints = CalculateGridCellPoints(cellX, cellY, poly)
  
  let polyPoints = [...poly.points]
  polyPoints[polyPoints.length - 1] = polyPoints[0]
  let isOnePointInPoly = false;

  for (let index = 0; index < gridCellPoints.length; index++) {
    const cellPoint = gridCellPoints[index]
    const x = cellPoint.x
    const y = cellPoint.y
    if (WindingNumber(cellPoint, poly.points)) {
      isOnePointInPoly = true
      if (poly.lines) {
        if (!poly.gridXPoints[x]) poly.gridXPoints[x] = []
        if (!poly.gridYPoints[y]) poly.gridYPoints[y] = []
        poly.gridXPoints[x][y] = true
        poly.gridYPoints[y][x] = true
      }
    } else break
  }
  if (!isOnePointInPoly) return false

  for (let index = 0; index < gridCellPoints.length; index++) {
    const gridCellP1 = gridCellPoints[index]
    const gridCellP2 = gridCellPoints[index + 1]
    for (let j = 0; j < polyPoints.length; j++) {
      const gridCellP1 = gridCellPoints[index]
      const gridCellP2 = gridCellPoints[index + 1]
      if (IsIntersecting(gridCellP1, gridCellP2, polyPoints[j], polyPoints[j + 1]))
        return false
    }
  }
  return true
}
export const CalculateLinesForDrawingGrid = (poly: PolyZone) => {
  console.log('CalculateLinesForDrawingGrid');
}
export const CreateGrid = async (poly: PolyZone, options: PolyZoneOptions) => {
  poly.gridArea = 0.0
  poly.gridCellWidth = poly.size.x / poly.gridDivisions
  poly.gridCellHeight = poly.size.y / poly.gridDivisions
  const isInside: Array<Array<boolean>> = []
  const gridCellArea = poly.gridCellWidth * poly.gridCellHeight
  for (let y = 0; y < poly.gridDivisions; y++) {
    await Delay(0);
    for (let x = 0; x < poly.gridDivisions; x++) {
      await Delay(0);
      if (IsGridCellInsidePoly(x - 1, y - 1, poly)) {
        poly.gridArea = poly.gridArea + gridCellArea
        isInside[y][x] = true
      }

    }
  }
  poly.grid = isInside
  poly.gridCoverage = poly.gridArea / poly.area
}
export const CalculatePoly = (poly: PolyZone, options: PolyZoneOptions) => {
  if (!options.min || !options.max || !options.size || !options.center || !options.area) {
    let [minX, minY] = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    let [maxX, maxY] = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
    poly.points.forEach(point => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    });
    poly.min = new Vector2(minX, minY)
    poly.max = new Vector2(maxX, maxY)
    poly.size = poly.max.subtract(poly.min)
    console.log(minX, minY)
    console.log(maxX, maxY)
    console.log(poly.size);

    // this.center = this.max.subtract(this.min) / 2
  }

  // this.boundingRadius = Math.sqrt(this.size.y * this.size.y + this.size.x * this.size.x) / 2

  // if (this.useGrid && !this.lazyGrid) {
  //   if (options.debugGrid) {
  //     this.gridXPoints = []
  //     this.gridYPoints = []
  //     this.lines = []
  //   }
  //   this.createGrid(options)
  // } else if (this.useGrid) {
  //   const isInside: Array<Array<boolean>> = [[]]
  //   for (let index = 0; index < this.gridDivisions; index++)
  //     isInside[index] = [];
  //   this.grid = isInside
  //   this.gridCellWidth = this.size.x / this.gridDivisions
  //   this.gridCellHeight = this.size.y / this.gridDivisions
  // }
}
export const InitDebug = (poly: PolyZone, options: PolyZoneOptions) => {
  if (!options.debugPoly && !options.debugGrid) return

  setTick(() => {
    if (!poly.destroyed) {
      poly.draw()
      if (options.debugGrid && poly.lines)
        DrawGrid(poly)
    }
  })
}
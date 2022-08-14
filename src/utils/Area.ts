import { Color, Entity, Game, toFixed } from ".."
import { PolyZoneOptions } from "../enums"
import { World } from "../World"
import { BasePoly, EntityZone } from "../zones"
import { Delay } from "./Delay"
import { Vector2 } from "./Vector2"
import { Vector3 } from "./Vector3"

export const DrawWall = (p1: Vector2, p2: Vector2, minZ: number, maxZ: number, color: Color) => {
  const bottomLeft = new Vector3(p1.x, p1.y, minZ)
  const topLeft = new Vector3(p1.x, p1.y, maxZ)
  const bottomRight = new Vector3(p2.x, p2.y, minZ)
  const topRight = new Vector3(p2.x, p2.y, maxZ)

  World.drawPoly(bottomLeft, topLeft, bottomRight, color);
  World.drawPoly(topLeft, topRight, bottomRight, color);
  World.drawPoly(bottomRight, topRight, topLeft, color);
  World.drawPoly(bottomRight, topLeft, bottomLeft, color);
}
export const DrawGrid = (poly: BasePoly) => {
  let minZ = poly.minZ
  let maxZ = poly.maxZ
  if (minZ == null || maxZ == null) {
    const plyPos = Game.PlayerPed.Position;
    minZ = plyPos.z - 46.0;
    maxZ = plyPos.z - 45.0;
  }
  const lines = poly.lines;
  const [r, g, b] = poly.debugColors.grid;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const min = line.min;
    const max = line.max;
    console.log("DrawGrid", min, max);

    World.drawLine(
      new Vector3(min.x, min.y, minZ),
      new Vector3(max.x, max.y, minZ),
      new Color(196, r, g, b)
    );
  }
}
export const CalculatePolygonArea = (points: Vector3[]) => {
  const det2 = (i: number, j: number) => {
    return points[i].x * points[j].y - points[j].x * points[i].y
  }
  let sum = points.length > 2 && det2((points.length - 1), 0) || 0
  for (let i = 0; i < points.length - 1; i++) { sum += det2(i, i + 1) }
  return Math.abs(0.5 * sum)
}
export const PointInPoly = (point: Vector3, poly: BasePoly): boolean => {
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
  if (grid) { // TODO: Implement grid
    const gridDivisions = poly.gridDivisions
    const size = poly.size
    const gridPosX = x - minX
    const gridPosY = y - minY
    const gridCellX = (gridPosX * gridDivisions) // size.x
    const gridCellY = (gridPosY * gridDivisions) // size.y
    let gridCellValue: boolean | undefined = undefined;
    if (grid[gridCellX + 1] && grid[gridCellX + 1][gridCellY + 1])
      gridCellValue = grid[gridCellX + 1][gridCellY + 1];
    // console.log("PolyTest:",
    //   gridDivisions,
    //   size,
    //   gridPosX,
    //   gridPosY,
    //   gridCellX,
    //   gridCellY,
    //   gridCellValue,
    // );
    if (gridCellValue == undefined && poly.lazyGrid) {
      gridCellValue = IsGridCellInsidePoly(gridCellX, gridCellY, poly)
      console.log("PolyTest:", gridCellValue);

    }

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
  wn = Wn_inner_loop(points[points.length - 1], points[0], point, wn)
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
export const CalculateGridCellPoints = (cellX: number, cellY: number, poly: BasePoly) => {
  const gridCellWidth = poly.gridCellWidth
  const gridCellHeight = poly.gridCellHeight
  const min = poly.min
  const x = cellX * gridCellWidth + min.x
  const y = cellY * gridCellHeight + min.y
  return [
    new Vector2(x, y).round(3),
    new Vector2(x + gridCellWidth, y).round(3),
    new Vector2(x + gridCellWidth, y + gridCellHeight).round(3),
    new Vector2(x, y + gridCellHeight).round(3),
    new Vector2(x, y).round(3)
  ]
}
export const IsGridCellInsidePoly = (cellX: number, cellY: number, poly: BasePoly) => {
  const gridCellPoints = CalculateGridCellPoints(cellX, cellY, poly)
  let polyPoints = [...poly.points]
  polyPoints[polyPoints.length] = new Vector3(polyPoints[0].x, polyPoints[0].y, polyPoints[0].z)
  let isOnePointInPoly = false;

  for (let index = 0; index < gridCellPoints.length - 1; index++) {
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

  for (let index = 0; index < gridCellPoints.length - 1; index++) {
    let gridCellP1 = gridCellPoints[index]
    let gridCellP2 = gridCellPoints[index + 1]
    for (let j = 0; j < polyPoints.length - 2; j++) {
      gridCellP1 = gridCellPoints[index]
      gridCellP2 = gridCellPoints[index + 1]
      if (IsIntersecting(gridCellP1, gridCellP2, polyPoints[j], polyPoints[j + 1]))
        return false
    }
  }
  return true
}
export const CalculateLinesForDrawingGrid = (poly: BasePoly) => {
  const lines: Array<{ max: Vector2, min: Vector2 }> = []
  for (let x = 0; x < poly.gridXPoints.length; x++) {
    let yValues = []
    for (let y = 0; y < poly.gridXPoints[x].length; y++)
      yValues[yValues.length] = y

    if (yValues.length >= 2) {
      yValues = yValues.sort((a, b) => a - b)
      let minY = yValues[0]
      let lastY = yValues[0]
      for (let yv = 0; yv < yValues.length; yv++) {
        const y = yValues[yv]
        // Checks for breaks in the grid. If the distance between the last value and the current one
        // is greater than the size of a grid cell, that means the line between them must go outside the polygon.
        // Therefore, a line must be created between minY and the lastY, and a new line started at the current y
        console.log(y, lastY, poly.gridCellHeight)
        if (y - lastY > poly.gridCellHeight + 0.01) {
          console.log(`Add Line at ${y}`);
          
          lines[lines.length] = { min: new Vector2(x, minY), max: new Vector2(x, lastY) }
          minY = y
        } else if (yv == yValues.length - 1) {
          lines[lines.length] = { min: new Vector2(x, minY), max: new Vector2(x, y) }
        }

        lastY = y
      }
    }
  }
  poly.gridXPoints = []

  // for (let y = 0; y < poly.gridYPoints.length; y++) {
  //   let xValues = []
  //   for (let x = 0; x < poly.gridYPoints[x].length; x++)
  //     xValues[xValues.length] = x

  //   if (xValues.length >= 2) {
  //     xValues = xValues.sort((a, b) => a - b)
  //     let minX = xValues[0]
  //     let lastX = xValues[0]
  //     for (let xv = 0; xv < xValues.length; xv++) {
  //       const x = xValues[xv]
  //       if (x - lastX > poly.gridCellWidth + 0.01) {
  //         lines[lines.length] = { min: new Vector2(x, minX), max: new Vector2(x, lastX) }
  //         minX = x
  //       } else if (xv == xValues.length - 1)
  //         lines[lines.length] = { min: new Vector2(x, minX), max: new Vector2(x, x) }

  //       lastX = x
  //     }
  //   }
  // }
  poly.gridYPoints = []
  return lines;
}
export const CreateGrid = async (poly: BasePoly, options: PolyZoneOptions) => {
  poly.gridArea = 0.0
  poly.gridCellWidth = poly.size.x / poly.gridDivisions
  poly.gridCellHeight = poly.size.y / poly.gridDivisions
  const isInside: Array<{ [key: string]: boolean }> = []
  const gridCellArea = poly.gridCellWidth * poly.gridCellHeight
  for (let y = 0; y < poly.gridDivisions; y++) {
    await Delay(0);
    isInside[y] = {}
    for (let x = 0; x < poly.gridDivisions; x++) {
      console.log(`Key: ${x}/${y}`, IsGridCellInsidePoly(x, y, poly));
      if (IsGridCellInsidePoly(x + 1, y + 1, poly)) {
        poly.gridArea += gridCellArea
        isInside[y][x.toString()] = true
      }
    }
    break;
  }
  poly.grid = isInside
  poly.gridCoverage = poly.gridArea / poly.area
  if (options.debugGrid) {
    const coverage = (poly.gridCoverage * 100).toFixed(2)
    console.log("[PolyZone] Debug: Grid Coverage at " + coverage + "% with " + poly.gridDivisions
      + " divisions. Optimal coverage for memory usage and startup time is 80-90%");

    poly.lines = CalculateLinesForDrawingGrid(poly)
    console.log("[PolyZone] Debug: Lines: " + poly.lines.length);

  }
}
export const CalculatePoly = (poly: BasePoly, options: PolyZoneOptions) => {
  if (!options.min || !options.max || !options.size || !options.center || !options.area) {
    let [minX, minY] = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    let [maxX, maxY] = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
    poly.points.forEach(point => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    });

    poly.min = new Vector2(minX, minY);
    poly.max = new Vector2(maxX, maxY);
    poly.size = poly.max.subtract(poly.min);

    poly.center = Vector2.divide(Vector2.add(poly.max, poly.min), 2);

    poly.area = CalculatePolygonArea(poly.points)
  }

  poly.boundingRadius = Math.sqrt(poly.size.y * poly.size.y + poly.size.x * poly.size.x) / 2

  if (poly.useGrid && !poly.lazyGrid) {
    if (options.debugGrid) {
      poly.gridXPoints = []
      poly.gridYPoints = []
      poly.lines = []
    }
    CreateGrid(poly, options)
  } else if (poly.useGrid) {
    let isInside: Array<{ [key: string]: boolean }>
    for (let index = 0; index < poly.gridDivisions; index++)
      isInside[index] = {};
    poly.grid = isInside
    poly.gridCellWidth = poly.size.x / poly.gridDivisions
    poly.gridCellHeight = poly.size.y / poly.gridDivisions
  }
}
export const InitDebug = (poly: BasePoly, options: PolyZoneOptions) => {
  if (!options.debugPoly && !options.debugGrid && poly.type != "Entity") return

  setTick(() => {
    if (!poly.destroyed) {
      poly.draw()
      if (options.debugGrid && poly.lines)
        DrawGrid(poly)
    }
  })
}
export const BoxZoneCalculateMinAndMaxZ = (minZ: number, maxZ: number, scaleZ: number[], offsetZ: number[]) => {
  const [minScaleZ, maxScaleZ, minOffsetZ, maxOffsetZ] = [scaleZ[0] || 1.0, scaleZ[1] || 1.0, offsetZ[0] || 0.0, offsetZ[1] || 0.0]
  if ((minZ == undefined && maxZ == undefined) || (minScaleZ == 1.0 && maxScaleZ == 1.0 && minOffsetZ == 0.0 && maxOffsetZ == 0.0))
    return [minZ, maxZ]

  if (minScaleZ != 1.0 || maxScaleZ != 1.0) {

    if (minZ != undefined && maxZ != undefined) {

      const halfHeight = (maxZ - minZ) / 2
      const centerZ = minZ + halfHeight
      minZ = centerZ - halfHeight * minScaleZ
      maxZ = centerZ + halfHeight * maxScaleZ
    }
    else
      console.log(`[PolyZone] Warning: The minZ/maxZ of a BoxZone can only be scaled if both minZ and maxZ are non-nil (minZ=${minZ}, maxZ=${maxZ})`)
  }
  if (minZ) minZ = minZ - minOffsetZ
  if (maxZ) maxZ = maxZ + maxOffsetZ
  return [minZ, maxZ]
}
export const EntityCalculateMinAndMaxZ = (entity: Entity, dimensions: [Vector3, Vector3], scaleZ: number[], offsetZ: number[]) => {
  const [min, max] = [dimensions[0], dimensions[1]]
  const [minX, minY, minZ, maxX, maxY, maxZ] = [min.x, min.y, min.z, max.x, max.y, max.z]

  // Bottom vertices
  const p1 = GetOffsetFromEntityInWorldCoords(entity.Handle, minX, minY, minZ)[2]
  const p2 = GetOffsetFromEntityInWorldCoords(entity.Handle, maxX, minY, minZ)[2]
  const p3 = GetOffsetFromEntityInWorldCoords(entity.Handle, maxX, maxY, minZ)[2]
  const p4 = GetOffsetFromEntityInWorldCoords(entity.Handle, minX, maxY, minZ)[2]

  // Top vertices[2]
  const p5 = GetOffsetFromEntityInWorldCoords(entity.Handle, minX, minY, maxZ)[2]
  const p6 = GetOffsetFromEntityInWorldCoords(entity.Handle, maxX, minY, maxZ)[2]
  const p7 = GetOffsetFromEntityInWorldCoords(entity.Handle, maxX, maxY, maxZ)[2]
  const p8 = GetOffsetFromEntityInWorldCoords(entity.Handle, minX, maxY, maxZ)[2]

  const entityMinZ = Math.min(p1, p2, p3, p4, p5, p6, p7, p8)
  const entityMaxZ = Math.max(p1, p2, p3, p4, p5, p6, p7, p8)

  return BoxZoneCalculateMinAndMaxZ(entityMinZ, entityMaxZ, scaleZ, offsetZ)
}
export const UpdateOffsets = (entity: Entity, zone: EntityZone) => {
  const pos = entity.Position;
  const rot = entity.ForwardDegrees;
  zone.offsetPos = pos.toVector2().subtract(zone.startPos)
  zone.offsetRot = rot - 90.0
  if (zone.useZ) {
    const [minZ, maxZ] = EntityCalculateMinAndMaxZ(entity, zone.dimensions, zone.scaleZ, zone.offsetZ);

    [zone.minZ, zone.maxZ] = [minZ, maxZ]
  }
}
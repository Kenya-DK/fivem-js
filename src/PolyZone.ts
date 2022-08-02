import { Game } from './Game';
import { Entity, Player, PolyZoneOptions } from './models';
import { DebugColors } from './models/PolyZoneOptions';
import { UIMenuItem } from './ui';
import { Color, Vector3 } from './utils';
import { CalculatePoly, DrawWall, InitDebug, PointInPoly } from './utils/Area';
import { Delay } from './utils/Delay';
import { Vector2 } from './utils/Vector2';
import { World } from './World';

/**
 * 
 * Class to manage polyZones ropes between entities.
 */
export class PolyZone {
  private _onPlayerInOut: (Player: Player, isPointInside: boolean, point: Vector3) => void | null = null;

  private defaultColorWalls: [number, number, number] = [0, 255, 0]
  private defaultColorOutline: [number, number, number] = [255, 0, 0]

  public name: string;
  public minZ: number;
  public maxZ: number;
  public min: Vector2;
  public max: Vector2;
  public size: Vector2;
  public center: Vector3;
  public useGrid: boolean;
  public lazyGrid: boolean;
  public gridDivisions: number;
  public debugColors: DebugColors;
  public debugPoly: boolean;
  public debugGrid: boolean;
  public paused: boolean;
  public data: any;
  public destroyed = false;

  public boundingRadius: number;
  public area: number;
  public grid: Array<Array<boolean>>;
  public gridXPoints: Array<Array<boolean>>;
  public gridYPoints: Array<Array<boolean>>;
  public gridCellHeight: number;
  public gridCoverage: number;
  public gridCellWidth: number;
  public gridArea: number;
  public lines: Array<Array<{ max: number, min: number }>>;

  constructor(public points: Vector3[], options?: PolyZoneOptions) {
    if (this.points.length < 3) {
      throw new Error(`[Fivem-Js-PolyZone] Error: PolyZone must have at least 3 points`)
    }
    const cloneOptions = options || {}
    const useGrid = cloneOptions.useGrid || true
    const lazyGrid = cloneOptions.lazyGrid || true

    this.name = options.name;
    this.center = options.center;
    this.size = options.size;
    this.max = options.max;
    this.min = options.min;
    this.area = options.area;
    this.minZ = options.minZ;
    this.maxZ = options.maxZ;
    this.useGrid = useGrid;
    this.lazyGrid = lazyGrid;
    this.gridDivisions = options.gridDivisions || 30;
    this.debugColors = options.debugColors || {
      walls: this.defaultColorWalls,
      outline: this.defaultColorOutline,
      grid: [0, 0, 0]
    }
    this.debugPoly = options.debugPoly || false;
    this.debugGrid = options.debugGrid || false;
    this.data = options.data || {};
    CalculatePoly(this, options)
    // this.isPolyZone = true,;
    InitDebug(this, options);
  }

  public draw() {
    const zDrawDist = 45.0
    const oColor = this.defaultColorOutline;
    const [oR, oG, oB] = oColor

    const wColor = this.defaultColorWalls;
    const [wR, wG, wB] = wColor

    const player = Game.Player
    const playerPos = player.Character.Position

    const minZ = this.minZ || playerPos.z - zDrawDist
    const maxZ = this.maxZ || playerPos.z + zDrawDist

    const points = this.points;
    for (let index = 0; index < points.length; index++) {
      const point = this.transformPoint(points[index])
      World.drawLine(new Vector3(point.x, point.y, minZ), new Vector3(point.x, point.y, maxZ), new Color(164, oR, oG, oB))
      if (index < (points.length - 1)) {
        const p2 = this.transformPoint(points[index + 1]);
        World.drawLine(new Vector3(point.x, point.y, maxZ), new Vector3(p2.x, p2.y, maxZ), new Color(184, oR, oG, oB))
        DrawWall(point, p2, minZ, maxZ, new Color(48, wR, wG, wB))
      }
    }

    if (this.points.length > 2) {
      const firstPoint = this.transformPoint(points[0])
      const lastPoint = this.transformPoint(points[points.length - 1])
      World.drawLine(new Vector3(firstPoint.x, firstPoint.y, maxZ), new Vector3(lastPoint.x, lastPoint.y, maxZ), new Color(164, oR, oG, oB))
      DrawWall(firstPoint, lastPoint, minZ, maxZ, new Color(48, wR, wG, wB))
    }
  }

  private transformPoint(point: Vector3) {
    // No point transform necessary for regular PolyZones, unlike zones like Entity Zones, whose points can be rotated and offset
    return point
  }

  private isPointInside(point: Vector3): boolean {
    if (this.destroyed) {
      console.log(`[Fivem-Js-PolyZone] Warning: Called isPointInside on destroyed zone {name="${this.name}"}"`)
    }
    return PointInPoly(point, this)
  }

  // Events
  public onPlayerInOut(handler: (Player: Player, isPointInside: boolean, point: Vector3) => void, waitInMS?: number,) {
    this._onPlayerInOut = handler
    let isInside = false;
    const Tick = setTick(async () => {
      if(this.destroyed) clearTick(Tick)
      if(this.paused) return;
      const point = Game.Player.Character.Position;
      const newIsInside = this.isPointInside(point);
      if (newIsInside !== isInside) {
        this._onPlayerInOut(Game.Player, newIsInside, point)
        isInside = newIsInside
      }
      Delay(waitInMS || 500)
    })
  }

  public destroy() {
    this.destroyed = true
  }
}

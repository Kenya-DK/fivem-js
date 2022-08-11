import { Color, Vector2, Vector3, Delay, CalculatePoly, DrawWall, InitDebug, PointInPoly } from "../utils";
import { Player } from "../models";
import { DebugColors, PolyZoneOptions } from "../enums";
import { Game } from "../Game";
import { World } from "../World";
import { Blip } from "../Blip";

export class BasePoly {
  private _onPlayerInOut: (Player: Player, isPointInside: boolean, point: Vector3) => void | null = null;
  private HeadBone = 0x796e;
  private eventPrefix = "poly";
  private defaultColorWalls: [number, number, number] = [0, 255, 0]
  private defaultColorOutline: [number, number, number] = [255, 0, 0]

  public name: string;
  public minZ: number;
  public maxZ: number;
  public min: Vector2;
  public max: Vector2;
  public size: Vector2;
  public center: Vector3 | Vector2;
  public useGrid: boolean;
  public lazyGrid: boolean;
  public gridDivisions: number;
  public debugColors: DebugColors;
  public debugPoly: boolean;
  public debugGrid: boolean;
  public paused: boolean;
  public data: any;
  public destroyed = false;
  public useZ: boolean;


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
  private events: Array<Function> = [];
  constructor(public points: Vector3[], public options?: PolyZoneOptions, public type?: string) {
    if (this.points.length < 3 && type == "Base") {
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
    this.useZ = options.useZ || false;
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

  // Events
  public transformPoint(point: Vector3) {
    // No point transform necessary for regular PolyZones, unlike zones like Entity Zones, whose points can be rotated and offset
    return point.toVector2();
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
  public drawPoly() {
    throw new Error("Method not implemented.");
  }
  public isPointInside(point: Vector3): boolean {
    if (this.destroyed) {
      console.log(`[Fivem-Js-PolyZone] Warning: Called isPointInside on destroyed zone {name="${this.name}"}"`)
    }

    return PointInPoly(point, this)
  }
  public destroy() {
    this.destroyed = true
  }
  public getPlayerPosition(): Vector3 {
    return Game.Player.Character.Position;
  }
  public getPlayerHeadPosition() {
    return GetPedBoneCoords(Game.PlayerPed.Handle, this.HeadBone, 0, 0, 0);
  }
  /**
  * Creates a event on player enter or leave.
  *
  * @param handler The handler has args Player: Player, isPointInside: boolean, point: Vector3.
  * @param waitInMS The dealy time deafault 500 ms.
  */
  public async onPlayerInOut(handler: (Player: Player, isPointInside: boolean, point: Vector3) => void, waitInMS?: number) {
    this._onPlayerInOut = handler
    let isInside = false;
    const Tick = setTick(async () => {
      if (this.destroyed) clearTick(Tick)
      if (this.paused) return;
      const point = Game.Player.Character.Position;
      const newIsInside = this.isPointInside(point);
      if (newIsInside !== isInside) {
        this._onPlayerInOut(Game.Player, newIsInside, point)
        isInside = newIsInside
      }
      await Delay(waitInMS || 500)
    })
  }
  public addEvent(event: string) {
    const internalEventName = this.eventPrefix + event
    this.events[internalEventName] = on(internalEventName, (...args) => {
      const coords = Game.PlayerPed.Position;
      if (this.isPointInside(coords)) {
        TriggerEvent(event, ...args)
      }
    })
  }
  public setType(type: string) {
    this.type = type
  }

  public removeEvent(event: string) {
    if (this.events[event]) {
      removeEventListener(event, () => { })
      this.events.splice(this.events.indexOf(this.events[event]), 1)
    }
  }
  public addDebugBlip(): Blip {
    const blip = World.createBlip(new Vector3(this.center.x, this.center.y, 0))
    blip.Color = 7
    blip.Display = 8
    blip.Scale = 1.0
    blip.IsShortRange = true
    return blip
  }
  public setPaused(paused: boolean) {
    this.paused = paused
  }
  public isPaused(): boolean {
    return this.paused
  }
  public getBoundingBoxMin(): Vector2 {
    return this.min
  }
  public getBoundingBoxMax(): Vector2 {
    return this.max
  }
  public getBoundingBoxSize(): Vector2 {
    return this.size
  }
  public getBoundingBoxCenter(): Vector3 | Vector2 {
    return this.center
  }
}
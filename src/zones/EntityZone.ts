import { PolyZoneOptions } from "../enums";
import { Entity } from "../models";
import { UpdateOffsets, Vector3 } from "../utils";
import { BoxZone } from "./BoxZone";

export class EntityZone extends BoxZone {
  public dimensions: [Vector3, Vector3];
  constructor(public entity: Entity, options?: PolyZoneOptions) {
    if (!entity.exists()) throw new Error("Entity does not exist");

    const [min, max] = entity.Model.DimensionMinMax;
    const length = max.y - min.y;
    const width = max.x - min.x;
    const pos = entity.Position;
    super(pos, length, width, options)
    super.setType("Entity");
    this.dimensions = [min, max];
  }
  public draw(): void {
    UpdateOffsets(this.entity, this);
    super.draw();
  }
  public isPointInside(point: Vector3): boolean {
    UpdateOffsets(this.entity, this);
    return super.isPointInside(point);
  }
}

import { BoxOptions, CircleOptions, PolyZoneOptions } from '.';
import { Entity } from './models';
import { Vector3 } from './utils';
import { BasePoly, BoxZone, CircleZone, ComboZone, EntityZone } from './zones';

/**
 * 
 * Class to manage polyZones ropes between entities.
 */
export class PolyZone {

    /**
   * Creates a new polyzone.
   *
   * @param points The points of the polyzone.
   * @param options The options of the polyzone.
   */
     public static cretatePolyZone(points: Vector3[], options?: PolyZoneOptions): BasePoly {
      const poly = new BasePoly(points, options, "Base");
  
      return poly;
    }
    /**
     * Creates a new boxzone.
     *
     * @param center The center of the box.
     * @param length The length of the box.
     * @param width The width of the box.
     * @param options The options of the box.
     */
    public static cretateBoxZone(center: Vector3, length: number, width: number, options?: BoxOptions): BoxZone {
      const box = new BoxZone(center, length, width, options);
  
      return box;
    }
    /**
     * Creates a new circle zone.
     *
     * @param center The center of the circle.
     * @param radius The length of the circle.
     * @param options The options of the circle.
     */
    public static cretateCircleZone(center: Vector3, radius: number, options?: CircleOptions): CircleZone {
      const circle = new CircleZone(center, radius, options);
  
      return circle;
    }
    /**
     * Creates a new Combo zone.
     *
     * @param zones The zones of the combo.
     * @param options The options of the combo.
     */
    public static cretateComboZone(zones: BasePoly[], options?: PolyZoneOptions): ComboZone {
      const combo = new ComboZone(zones, options);
  
      return combo;
    }
    /**
     * Creates a new entity zone.
     *
     * @param entity The entity of the entity zone.
     * @param options The options of the entity zone.
     */
    public static cretateEntityZone(entity: Entity, options?: PolyZoneOptions): EntityZone {
      const entityZone = new EntityZone(entity, options);
  
      return entityZone;
    }
}

import { PolyZoneOptions } from "../enums";
import { BasePoly } from "./BasePoly";

export class ComboZone extends BasePoly {
  constructor(zones: BasePoly[], options?: PolyZoneOptions) {

    super([], options)
  }
}
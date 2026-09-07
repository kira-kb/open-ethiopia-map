export interface LocationHierarchyConstructor {
  id?: string;
  locationId: string;
  parentId: string;
  relationType?: string;
  depth?: number;
}

export class LocationHierarchy {
  readonly id: string;
  readonly locationId: string;
  readonly parentId: string;
  readonly relationType: string;
  readonly depth: number;

  constructor(props: LocationHierarchyConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.parentId = props.parentId;
    this.relationType = props.relationType || "contains";
    this.depth = props.depth || 0;
  }
}

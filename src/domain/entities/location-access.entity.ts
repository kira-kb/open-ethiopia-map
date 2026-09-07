export interface LocationAccessConstructor {
  id?: string;
  locationId: string;
  hasGate?: boolean;
  hasSecurity?: boolean;
  hasElevator?: boolean;
  hasParking?: boolean;
  accessHours?: string;
  accessNotes?: string;
}

export class LocationAccess {
  readonly id: string;
  readonly locationId: string;
  readonly hasGate: boolean;
  readonly hasSecurity: boolean;
  readonly hasElevator: boolean;
  readonly hasParking: boolean;
  readonly accessHours?: string;
  readonly accessNotes?: string;

  constructor(props: LocationAccessConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.hasGate = props.hasGate || false;
    this.hasSecurity = props.hasSecurity || false;
    this.hasElevator = props.hasElevator || false;
    this.hasParking = props.hasParking || false;
    this.accessHours = props.accessHours;
    this.accessNotes = props.accessNotes;
  }
}

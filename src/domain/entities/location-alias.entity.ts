export interface LocationAliasConstructor {
  id?: string;
  locationId: string;
  alias: string;
  language?: string;
  isPreferred?: boolean;
  source?: string;
}

export class LocationAlias {
  readonly id: string;
  readonly locationId: string;
  readonly alias: string;
  readonly language?: string;
  readonly isPreferred: boolean;
  readonly source?: string;
  readonly createdAt: Date;

  constructor(props: LocationAliasConstructor) {
    this.id = props.id || "";
    this.locationId = props.locationId;
    this.alias = props.alias;
    this.language = props.language;
    this.isPreferred = props.isPreferred || false;
    this.source = props.source;
    this.createdAt = new Date();
  }
}

export class DeliveryCompleted {
  constructor(
    readonly placeId: string | undefined,
    readonly coordHash: string | undefined,
    readonly deliveryId: string,
    readonly userId: string | undefined,
    readonly locationId?: string,
    readonly firstAttempt?: boolean,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class DeliveryAddressCorrected {
  constructor(
    readonly placeId: string | undefined,
    readonly coordHash: string | undefined,
    readonly deliveryId: string,
    readonly correction: string,
    readonly locationId?: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class DeliveryFailedLocation {
  constructor(
    readonly placeId: string | undefined,
    readonly coordHash: string | undefined,
    readonly deliveryId: string,
    readonly reason: string,
    readonly locationId?: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

export class DeliveryDriverRequestedHelp {
  constructor(
    readonly placeId: string | undefined,
    readonly coordHash: string | undefined,
    readonly deliveryId: string,
    readonly reason: string,
    readonly locationId?: string,
    readonly timestamp: Date = new Date(),
  ) {}
}

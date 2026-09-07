import { PrismaClient } from "../../../node_modules/.prisma/map-client";
import {
  IRouteSessionRepository,
  SaveRouteSessionData,
  SaveRouteRevisionData,
} from "../../domain/interfaces/route-session-repository.interface";
import {
  RouteSession,
  RouteRevision,
  RouteGeometry,
  RouteInstruction,
  ReplanReason,
} from "../../domain/entities/route-session.entity";
import { Coordinates } from "../../domain/value-objects";

function toJson<T>(val: T): any {
  return JSON.parse(JSON.stringify(val));
}

export class PrismaRouteSessionRepository implements IRouteSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createSession(data: SaveRouteSessionData): Promise<RouteSession> {
    const record = await this.prisma.routeSession.create({
      data: {
        deliveryId: data.deliveryId,
        provider: data.provider,
        profile: data.profile,
        originLat: data.originLat,
        originLng: data.originLng,
        destLat: data.destLat,
        destLng: data.destLng,
        distanceMeters: data.distanceMeters,
        durationSeconds: data.durationSeconds,
        geometry: toJson(data.geometry),
        instructions: data.instructions ? toJson(data.instructions) : undefined,
        routeHash: data.routeHash,
        currentRevision: 1,
        status: "active",
        revisions: {
          create: {
            version: 1,
            provider: data.provider,
            profile: data.profile,
            geometry: toJson(data.geometry),
            distanceMeters: data.distanceMeters,
            durationSeconds: data.durationSeconds,
            instructions: data.instructions ? toJson(data.instructions) : undefined,
            reason: "INITIAL",
            processingTimeMs: null,
            cacheHit: false,
          },
        },
      },
      include: { revisions: true },
    });

    return this.toSession(record);
  }

  async createRevision(data: SaveRouteRevisionData): Promise<RouteRevision> {
    const record = await this.prisma.routeRevision.create({
      data: {
        sessionId: data.sessionId,
        version: data.version,
        previousRevisionId: data.previousRevisionId,
        provider: data.provider,
        profile: data.profile,
        geometry: toJson(data.geometry),
        distanceMeters: data.distanceMeters,
        durationSeconds: data.durationSeconds,
        instructions: data.instructions ? toJson(data.instructions) : undefined,
        reason: data.reason,
        processingTimeMs: data.processingTimeMs,
        cacheHit: data.cacheHit,
      },
    });

    return this.toRevision(record);
  }

  async findSessionById(id: string): Promise<RouteSession | null> {
    const record = await this.prisma.routeSession.findUnique({
      where: { id },
      include: { revisions: true },
    });
    return record ? this.toSession(record) : null;
  }

  async findSessionByDeliveryId(deliveryId: string): Promise<RouteSession | null> {
    const record = await this.prisma.routeSession.findUnique({
      where: { deliveryId },
      include: { revisions: true },
    });
    return record ? this.toSession(record) : null;
  }

  async updateSessionStatus(id: string, status: string): Promise<void> {
    await this.prisma.routeSession.update({
      where: { id },
      data: { status },
    });
  }

  async bumpRevision(sessionId: string, newVersion: number): Promise<void> {
    await this.prisma.routeSession.update({
      where: { id: sessionId },
      data: { currentRevision: newVersion },
    });
  }

  async findRevisionsBySessionId(sessionId: string): Promise<RouteRevision[]> {
    const records = await this.prisma.routeRevision.findMany({
      where: { sessionId },
      orderBy: { version: "asc" },
    });
    return records.map((r: any) => this.toRevision(r));
  }

  private toSession(record: any): RouteSession {
    return new RouteSession(
      record.id,
      record.deliveryId,
      record.provider,
      record.profile,
      new Coordinates(record.originLat, record.originLng),
      new Coordinates(record.destLat, record.destLng),
      record.distanceMeters,
      record.durationSeconds,
      record.geometry as RouteGeometry,
      record.instructions as RouteInstruction[] | null,
      record.routeHash,
      record.currentRevision,
      record.status,
      record.createdAt,
      record.updatedAt,
      (record.revisions || []).map((r: any) => this.toRevision(r)),
    );
  }

  private toRevision(record: any): RouteRevision {
    return new RouteRevision(
      record.id,
      record.sessionId,
      record.version,
      record.provider,
      record.profile,
      record.geometry as RouteGeometry,
      record.distanceMeters,
      record.durationSeconds,
      record.instructions as RouteInstruction[] | null,
      record.reason as ReplanReason,
      record.processingTimeMs,
      record.cacheHit,
      record.createdAt,
      record.previousRevisionId,
    );
  }
}

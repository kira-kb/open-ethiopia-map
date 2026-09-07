import { RouteSession, RouteRevision, RouteGeometry, RouteInstruction, ReplanReason } from "../entities/route-session.entity";

export interface SaveRouteSessionData {
  deliveryId: string;
  provider: string;
  profile: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
  instructions: RouteInstruction[] | null;
  routeHash: string;
}

export interface SaveRouteRevisionData {
  sessionId: string;
  version: number;
  previousRevisionId: string | null;
  provider: string;
  profile: string;
  geometry: RouteGeometry;
  distanceMeters: number;
  durationSeconds: number;
  instructions: RouteInstruction[] | null;
  reason: ReplanReason;
  processingTimeMs: number | null;
  cacheHit: boolean;
}

export interface IRouteSessionRepository {
  createSession(data: SaveRouteSessionData): Promise<RouteSession>;
  createRevision(data: SaveRouteRevisionData): Promise<RouteRevision>;
  findSessionById(id: string): Promise<RouteSession | null>;
  findSessionByDeliveryId(deliveryId: string): Promise<RouteSession | null>;
  updateSessionStatus(id: string, status: string): Promise<void>;
  bumpRevision(
    sessionId: string,
    newVersion: number,
  ): Promise<void>;
  findRevisionsBySessionId(sessionId: string): Promise<RouteRevision[]>;
}

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../../../node_modules/.prisma/map-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Logger, IRecommendationCache } from "../../domain/interfaces";
import { config } from "../../infrastructure/config";
import {
  IngestLocationPayloadSchema,
  SingleLocationItem,
  IngestItemResult,
  IngestLocationResponseDto,
} from "../dto/ingest-location.dto";
import { errorResponse } from "../dto";

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function calculateSimilarity(s1: string, s2: string): number {
  const n1 = normalizeStr(s1);
  const n2 = normalizeStr(s2);
  if (n1 === n2) return 1.0;
  if (!n1 || !n2) return 0.0;
  if (n1.includes(n2) || n2.includes(n1)) return 0.85;

  const getBigrams = (s: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(n1);
  const b2 = getBigrams(n2);
  let intersection = 0;
  for (const bg of b1) {
    if (b2.has(bg)) intersection++;
  }
  return (2.0 * intersection) / (b1.size + b2.size || 1);
}

export class LocationIngestController {
  private prisma: PrismaClient;

  constructor(
    private readonly logger?: Logger,
    private readonly recommendationCache?: IRecommendationCache,
  ) {
    const dbUrl = config.database.url;
    if (!dbUrl) {
      throw new Error("MAP_DATABASE_URL is not set for LocationIngestController");
    }
    const adapter = new PrismaPg({ connectionString: dbUrl });
    this.prisma = new PrismaClient({ adapter });
  }

  async ingest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = IngestLocationPayloadSchema.parse(req.body);

      let items: SingleLocationItem[] = [];
      let defaultProvider: string = "EXTERNAL_IMPORT";

      if (Array.isArray(parsed)) {
        items = parsed;
      } else if ("locations" in parsed && Array.isArray(parsed.locations)) {
        items = parsed.locations;
        defaultProvider = parsed.sourceProvider || defaultProvider;
      } else {
        items = [parsed as SingleLocationItem];
      }

      if (items.length === 0) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "No location data provided"));
        return;
      }

      const results: IngestItemResult[] = [];
      let createdCount = 0;
      let aliasesAddedCount = 0;
      let updatedCount = 0;
      let failedCount = 0;

      for (const item of items) {
        try {
          const provider = item.sourceProvider || defaultProvider;
          const lat = item.latitude;
          const lng = item.longitude;
          const normalized = normalizeStr(item.name);

          // 1. Check for existing places within 25m (~0.00025 deg)
          const delta = 0.00025;
          const nearbyPlaces = await this.prisma.place.findMany({
            where: {
              latitude: { gte: lat - delta, lte: lat + delta },
              longitude: { gte: lng - delta, lte: lng + delta },
            },
          });

          let bestMatch: (typeof nearbyPlaces)[0] | null = null;
          let bestScore = 0;

          for (const candidate of nearbyPlaces) {
            // Check candidate name
            const score = calculateSimilarity(item.name, candidate.displayName || candidate.officialName || candidate.normalizedName);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = candidate;
            }

            // Check candidate aliases
            for (const alias of candidate.aliases) {
              const aliasScore = calculateSimilarity(item.name, alias);
              if (aliasScore > bestScore) {
                bestScore = aliasScore;
                bestMatch = candidate;
              }
            }
          }

          // 2. High similarity match -> Add as Alias to avoid duplicate entity
          if (bestMatch && bestScore >= 0.75) {
            const existingAliases = new Set<string>(bestMatch.aliases);
            let aliasesModified = false;

            if (!existingAliases.has(item.name) && normalizeStr(bestMatch.displayName || "") !== normalized) {
              existingAliases.add(item.name);
              aliasesModified = true;
            }

            for (const incomingAlias of item.aliases || []) {
              if (incomingAlias.trim() && !existingAliases.has(incomingAlias.trim())) {
                existingAliases.add(incomingAlias.trim());
                aliasesModified = true;
              }
            }

            if (aliasesModified) {
              await this.prisma.place.update({
                where: { id: bestMatch.id },
                data: {
                  aliases: Array.from(existingAliases),
                  popularity: { increment: 0.1 },
                  updatedAt: new Date(),
                },
              });

              aliasesAddedCount++;
              results.push({
                name: item.name,
                latitude: lat,
                longitude: lng,
                action: "ALIAS_ADDED",
                locationId: bestMatch.id,
                matchedPlaceId: bestMatch.id,
                matchedName: bestMatch.displayName || bestMatch.officialName || bestMatch.normalizedName,
                aliasesCount: existingAliases.size,
              });
            } else {
              updatedCount++;
              results.push({
                name: item.name,
                latitude: lat,
                longitude: lng,
                action: "UPDATED",
                locationId: bestMatch.id,
                matchedPlaceId: bestMatch.id,
                matchedName: bestMatch.displayName || bestMatch.officialName || bestMatch.normalizedName,
              });
            }

            // Also record in recommendation cache
            if (this.recommendationCache) {
              const coordHash = `${Math.round(lat * 10000) / 10000}:${Math.round(lng * 10000) / 10000}`;
              await this.recommendationCache.recordEnrichment(coordHash, item.name, false).catch(() => {});
            }
          } else {
            // 3. New Distinct POI or distinct name at the same coordinates
            const allAliases = Array.from(
              new Set([
                ...(item.aliases || []),
                ...(item.officialName && item.officialName !== item.name ? [item.officialName] : []),
                ...(item.shortName && item.shortName !== item.name ? [item.shortName] : []),
              ].filter(Boolean)),
            );

            const newPlace = await this.prisma.place.create({
              data: {
                officialName: item.officialName || item.name,
                displayName: item.displayName || item.name,
                shortName: item.shortName || undefined,
                normalizedName: normalized,
                aliases: allAliases,
                latitude: lat,
                longitude: lng,
                formattedAddress: item.formattedAddress || undefined,
                street: item.street || undefined,
                houseNumber: item.houseNumber || undefined,
                building: item.building || undefined,
                block: item.block || undefined,
                floor: item.floor || undefined,
                unit: item.unit || undefined,
                district: item.district || undefined,
                subcity: item.subcity || undefined,
                city: item.city || "Addis Ababa",
                country: item.country || "Ethiopia",
                postalCode: item.postalCode || undefined,
                locationType: (item.locationType as any) || undefined,
                category: item.category || undefined,
                subcategory: item.subcategory || undefined,
                sourceProvider: provider,
                providerPlaceId: item.providerPlaceId || undefined,
                verified: item.verified || false,
                confidence: item.verified ? 0.9 : 0.5,
                metadata: (item.metadata as any) || undefined,
              },
            });

            createdCount++;
            results.push({
              name: item.name,
              latitude: lat,
              longitude: lng,
              action: "CREATED",
              locationId: newPlace.id,
              aliasesCount: allAliases.length,
            });

            // Also record in recommendation cache
            if (this.recommendationCache) {
              const coordHash = `${Math.round(lat * 10000) / 10000}:${Math.round(lng * 10000) / 10000}`;
              await this.recommendationCache.recordEnrichment(coordHash, item.name, false).catch(() => {});
            }
          }
        } catch (itemErr) {
          failedCount++;
          results.push({
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            action: "ERROR",
            error: (itemErr as Error).message || "Failed to process location item",
          });
        }
      }

      this.logger?.info("Location batch ingested", {
        totalReceived: items.length,
        created: createdCount,
        aliasesAdded: aliasesAddedCount,
        updated: updatedCount,
        failed: failedCount,
      });

      const response: IngestLocationResponseDto = {
        success: true,
        data: {
          message: `Ingested ${items.length} locations (${createdCount} created, ${aliasesAddedCount} aliases added, ${updatedCount} updated, ${failedCount} failed)`,
          totalReceived: items.length,
          created: createdCount,
          aliasesAdded: aliasesAddedCount,
          updated: updatedCount,
          failed: failedCount,
          results,
        },
      };

      res.status(200).json(response);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        res.status(400).json(errorResponse("VALIDATION_ERROR", "Invalid location payload", err));
        return;
      }
      next(err);
    }
  }
}

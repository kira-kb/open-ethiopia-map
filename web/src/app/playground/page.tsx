"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getEffectiveApiUrl } from "@/lib/api-config";

interface Scenario {
  id: string;
  category: "routing" | "dispatch" | "session" | "search" | "places" | "admin";
  name: string;
  nameAmharic: string;
  description: string;
  descriptionAmharic: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  path: string;
  body?: any;
  params?: Record<string, string>;
  redis: {
    keyPattern: string;
    commands: string;
    strategy: string;
    strategyAmharic: string;
    ttl: string;
    benefit: string;
    benefitAmharic: string;
  };
}

const ALL_API_SCENARIOS: Scenario[] = [
  // ── Category 1: Routing & Navigation ──
  {
    id: "route-addis-car",
    category: "routing",
    name: "Addis Ababa: Bole Airport → Kazanchis (Car)",
    nameAmharic: "አዲስ አበባ፡ ቦሌ አውሮፕላን ማረፊያ → ካዛንቺስ (መኪና)",
    description: "Standard highway car routing through Debre Zeit Road with elevation and rush-hour calibration.",
    descriptionAmharic: "በደብረ ዘይት መንገድ በኩል የኮረብታ ተዳፋትና የትራፊክ መጨናነቅን ያገናዘበ የመኪና መንገድ ዕቅድ።",
    method: "POST",
    path: "/api/v1/map/route",
    body: {
      origin: { lat: 8.9806, lng: 38.7578 },
      destination: { lat: 9.0195, lng: 38.7710 },
      profile: "car",
      lang: "en",
      steps: true,
    },
    redis: {
      keyPattern: "map:route:{md5(origin|dest|profile|lang)}",
      commands: "GET, SETEX",
      strategy: "Read-through cache with deterministic MD5 hash of coordinates, profile, and language.",
      strategyAmharic: "ተመሳሳይ መነሻና መድረሻ ያላቸው የመንገድ ጥሪዎች በ MD5 ቁልፍ በመሸጎጥ በቀጥታ ከሬዲስ በ 1.2 ሚሊሰከንድ ይመለሳሉ።",
      ttl: "3,600s (1 Hour)",
      benefit: "Sub-2ms cache hit latency; avoids redundant graph Dijkstra/MLD path search on hot corridors.",
      benefitAmharic: "የኦኤስአርኤም (OSRM) ኮምፒውቴሽን ጫናን በመቀነስ የ 1.2 ሚሊሰከንድ ምላሽ ይሰጣል።",
    },
  },
  {
    id: "route-gondar-bajaj",
    category: "routing",
    name: "Gondar: Arada Post Office → Kebele 18 (Bajaj)",
    nameAmharic: "ጎንደር፡ አራዳ ፖስታ ቤት → ቀበሌ 18 (ባጃጅ)",
    description: "Bajaj profile routing avoiding steep stairways with cobblestone (chigign) surface speed caps.",
    descriptionAmharic: "የድንጋይ ንጣፍ (ጭጊኝ) መንገዶችንና ደረጃዎችን ያገናዘበ የጎንደር የባጃጅ መንገድ ዕቅድ።",
    method: "POST",
    path: "/api/v1/map/route",
    body: {
      origin: { lat: 12.6078, lng: 37.4697 },
      destination: { lat: 12.5910, lng: 37.4520 },
      profile: "bajaj",
      lang: "en",
      steps: true,
    },
    redis: {
      keyPattern: "map:route:{md5(gondar_arada|kebele18|bajaj|lang)}",
      commands: "GET, SETEX",
      strategy: "Profile-isolated cache storing steep gradient and cobblestone-penalized bajaj geometries.",
      strategyAmharic: "የባጃጅ ልዩ የፍጥነት ገደብና የድንጋይ ንጣፍ ቅጣት ያረፈበትን መንገድ ለይቶ ይሸጉጣል።",
      ttl: "3,600s (1 Hour)",
      benefit: "Instant response for high-frequency short-distance 3-wheeler dispatch queries in hilly terrain.",
      benefitAmharic: "በተደጋጋሚ ለሚጠየቁ አጫጭር የባጃጅ ጉዞዎች ፈጣን ምላሽ ይሰጣል።",
    },
  },
  {
    id: "route-amharic-maneuvers",
    category: "routing",
    name: "Turn-by-Turn Navigation (Amharic lang: 'am')",
    nameAmharic: "የመታጠፊያ አቅጣጫዎች በአማርኛ (lang: 'am')",
    description: "Generates localized Amharic navigation maneuvers (በቀኝ ታጠፍ፣ በግራ ታጠፍ፣ መድረሻዎ ደርሰዋል).",
    descriptionAmharic: "የአማርኛ የመታጠፊያና የአቅጣጫ መመሪያዎችን በቀጥታ ያመነጫል።",
    method: "POST",
    path: "/api/v1/map/route",
    body: {
      origin: { lat: 9.0108, lng: 38.7615 },
      destination: { lat: 8.9806, lng: 38.7578 },
      profile: "car",
      lang: "am",
      steps: true,
    },
    redis: {
      keyPattern: "map:route:{md5(coords|profile|am)}",
      commands: "GET, SETEX",
      strategy: "Language-partitioned caching: Amharic step instructions cached separately from English.",
      strategyAmharic: "የአማርኛ ቋንቋ መመሪያዎች ከእንግሊዝኛው ተለይተው በራሳቸው የሬዲስ ቁልፍ ይቀመጣሉ።",
      ttl: "3,600s (1 Hour)",
      benefit: "Guarantees Amharic driver audio/text prompts load instantly on mobile networks.",
      benefitAmharic: "ለአሽከርካሪዎች የሚላኩ የአማርኛ የድምጽና የጽሑፍ መመሪያዎች በፍጥነት እንዲደርሱ ያደርጋል።",
    },
  },
  {
    id: "route-walking",
    category: "routing",
    name: "Walking / Foot Navigation (Piassa → Churchill Ave)",
    nameAmharic: "የእግር ጉዞ መንገድ (ፒያሳ → ቸርችል ጎዳና)",
    description: "Pedestrian network routing taking footpaths, pedestrian crossings, and avoiding motorways.",
    descriptionAmharic: "የእግረኛ መንገዶችንና ማቋረጫዎችን ብቻ የሚጠቀም የእግር ጉዞ ዕቅድ።",
    method: "POST",
    path: "/api/v1/map/route",
    body: {
      origin: { lat: 9.0354, lng: 38.7516 },
      destination: { lat: 9.0210, lng: 38.7525 },
      profile: "foot",
      lang: "en",
      steps: true,
    },
    redis: {
      keyPattern: "map:route:{md5(coords|foot|lang)}",
      commands: "GET, SETEX",
      strategy: "Footpath routing cache indexed by pedestrian velocity profiles.",
      strategyAmharic: "የእግረኛ መንገዶችን ብቻ ያካተተ የተለየ የመሸጎጫ መዝገብ።",
      ttl: "3,600s (1 Hour)",
      benefit: "Serves courier foot delivery requests instantly without re-traversing pedestrian subgraphs.",
      benefitAmharic: "በእግር ለሚጓዙ የፖስታና የማድረሻ መልእክተኞች ፈጣን መንገድ ይሰጣል።",
    },
  },
  {
    id: "matrix-compute",
    category: "routing",
    name: "Distance Matrix (3 Drivers → 1 Pickup)",
    nameAmharic: "የርቀትና የጊዜ ሰንጠረዥ (3 አሽከርካሪዎች → 1 ደንበኛ)",
    description: "Calculates an N x M road distance and duration table in a single sub-15ms call.",
    descriptionAmharic: "በአንድ ፈጣን ጥሪ የብዙ መነሻዎችንና መድረሻዎችን የኪሎሜትርና የደቂቃ ሰንጠረዥ ያሰላል።",
    method: "POST",
    path: "/api/v1/map/matrix",
    body: {
      origins: [
        { latitude: 9.0120, longitude: 38.7600 },
        { latitude: 9.0150, longitude: 38.7700 },
        { latitude: 9.0200, longitude: 38.7800 },
      ],
      destinations: [
        { latitude: 9.0108, longitude: 38.7615 },
      ],
      profile: "car",
      annotations: ["duration", "distance"],
    },
    redis: {
      keyPattern: "map:matrix:{md5(origins|destinations|profile)}",
      commands: "GET, SETEX",
      strategy: "Short-TTL matrix memoization for high-concurrency order batch matching.",
      strategyAmharic: "በአንድ አካባቢ ለሚገኙ በርካታ ትዕዛዞች የርቀት ሰንጠረዥን ለአጭር ጊዜ በመያዝ ድግግሞሽን ያስቀራል።",
      ttl: "300s (5 Minutes)",
      benefit: "Reduces OSRM matrix solver CPU time during peak dispatch rushes by up to 80%.",
      benefitAmharic: "በትራፊክ መጨናነቅ ሰዓት የሰርቨሩን ፕሮሰሰር ጫና በ 80% ይቀንሳል።",
    },
  },
  {
    id: "map-match-trace",
    category: "routing",
    name: "GPS Breadcrumb Snap-to-Roads (/match)",
    nameAmharic: "የተበታተነ የጂፒኤስ ነጥቦችን ከመንገድ ጋር ማስተካከል (/match)",
    description: "Snaps noisy raw mobile GPS traces to OpenStreetMap centerlines with bearing calculation.",
    descriptionAmharic: "የሞባይል ጂፒኤስ ነጥቦችን ከእውነተኛው የመንገድ መስመር ጋር ያጠምዳል።",
    method: "POST",
    path: "/api/v1/map/match",
    body: {
      coordinates: [
        { latitude: 9.0108, longitude: 38.7615, timestamp: 1711200000 },
        { latitude: 9.0112, longitude: 38.7620, timestamp: 1711200005 },
        { latitude: 9.0118, longitude: 38.7625, timestamp: 1711200010 },
      ],
      profile: "car",
    },
    redis: {
      keyPattern: "map:match:{traceHash}",
      commands: "GET, SETEX",
      strategy: "Caches matched roadway segments for completed driver trace chunks.",
      strategyAmharic: "የተስተካከሉ የጂፒኤስ የመንገድ ቁርጥራጮችን ለጊዜው በመያዝ ድጋሚ እንዳይሰሉ ያደርጋል።",
      ttl: "600s (10 Minutes)",
      benefit: "Prevents repeated Hidden Markov Model (HMM) Viterbi decoding on repeated breadcrumb segments.",
      benefitAmharic: "ውስብስብ የሒሳብ ስሌቶችን በማስቀረት ፈጣን የመንገድ ጥምረት ይሰጣል።",
    },
  },

  // ── Category 2: Dispatch & Fleet Logistics ──
  {
    id: "dispatch-nearby",
    category: "dispatch",
    name: "Pack-Man Dispatch: Road ETA Driver Ranking",
    nameAmharic: "የተሸከርካሪ ስምሪት፡ በእውነተኛ የጎዳና ጊዜ አሽከርካሪዎችን መመደብ",
    description: "Evaluates candidate drivers and returns them pre-sorted by exact Ethiopian road ETA.",
    descriptionAmharic: "በአካባቢው ያሉ አሽከርካሪዎችን በእውነተኛ የመንገድ ርቀትና ደቂቃ ደርድረው ያቀርባል።",
    method: "POST",
    path: "/api/v1/map/dispatch/nearby",
    body: {
      pickup: { latitude: 9.0108, longitude: 38.7615 },
      vehicleType: "bajaj",
      deliveryId: "del_109283",
      radiusKm: 5,
      limit: 5,
      candidates: [
        { driverId: "drv_meskel_01", latitude: 9.0130, longitude: 38.7615, vehicleType: "bajaj" },
        { driverId: "drv_kazanchis_02", latitude: 9.0180, longitude: 38.7615, vehicleType: "bajaj" },
        { driverId: "drv_gotera_03", latitude: 8.9950, longitude: 38.7600, vehicleType: "bajaj" },
      ],
    },
    redis: {
      keyPattern: "active_drivers (GEO), driver:{driverId} (HASH)",
      commands: "GEORADIUS/GEOSEARCH, PIPELINE HMGET",
      strategy: "Two-stage spatial pipeline: Redis GEO filters candidate IDs, followed by pipeline HMGET for vehicle/duty status.",
      strategyAmharic: "በመጀመሪያ ሬዲስ ጂኦ (GEO) በአቅራቢያ ያሉትን ይለያል፤ ከዚያም በፓይፕላይን (Pipeline) የተሽከርካሪውን አይነትና የስራ ዝግጁነት ያጣራል።",
      ttl: "Real-time (Sliding 120s driver heartbeat)",
      benefit: "Sub-5ms evaluation of 5,000+ simultaneous mobile couriers across Addis and Gondar.",
      benefitAmharic: "በአንድ ጊዜ ከ 5,000 በላይ አሽከርካሪዎችን በ 5 ሚሊሰከንድ ውስጥ በማጣራት ፈጣን ስምሪት ያከናውናል።",
    },
  },
  {
    id: "traffic-telemetry",
    category: "dispatch",
    name: "Fleet Traffic Telemetry Ingestion",
    nameAmharic: "የፍጥነትና የትራፊክ ቴሌሜትሪ መረጃ መመዝገብ",
    description: "Streams high-frequency vehicle pings into Redis sorted sets for dynamic road speeds.",
    descriptionAmharic: "የተሽከርካሪዎችን ፍጥነት በመሰብሰብ የቀጥታ የትራፊክ ፍጥነትን ያዘምናል።",
    method: "POST",
    path: "/api/v1/map/traffic/telemetry",
    body: {
      deviceId: "dev_truck_bole_881",
      latitude: 8.9810,
      longitude: 38.7580,
      speedKmh: 42.5,
      headingDeg: 120,
      timestamp: Math.floor(Date.now() / 1000),
    },
    redis: {
      keyPattern: "traffic:segment:{segmentId} (ZSET)",
      commands: "ZADD, ZREMRANGEBYSCORE",
      strategy: "Sorted set indexed by Unix epoch timestamp. Outdated records automatically trimmed.",
      strategyAmharic: "የፍጥነት መረጃዎችን በሰዓት ቅደም ተከተል በ Sorted Set ያከማቻል፤ ያረጁትን በየጊዜው ይሰርዛል።",
      ttl: "900s (15-Minute rolling traffic window)",
      benefit: "Enables zero-disk dynamic speed calculations for live corridor congestion detection.",
      benefitAmharic: "ሃርድ ድራይቭ ሳይነካ የቀጥታ የትራፊክ መጨናነቅን በቅጽበት ለማወቅ ያስችላል።",
    },
  },

  // ── Category 3: Delivery Route Sessions (Immutable & Audited) ──
  {
    id: "session-create",
    category: "session",
    name: "Create Route Session (/routes/create)",
    nameAmharic: "አዲስ የመንገድ ክፍለ ጊዜ መፍጠር (/routes/create)",
    description: "Creates an authoritative, immutable RouteSession aggregate stored in PostgreSQL + Redis.",
    descriptionAmharic: "ለአንድ እሽግ ማድረሻ ሕጋዊና የማይለወጥ የመንገድ ክፍለ ጊዜ ይፈጥራል።",
    method: "POST",
    path: "/api/v1/map/routes/create",
    body: {
      deliveryId: "deliv_ethiopia_9941",
      origin: { lat: 8.9806, lng: 38.7578 },
      destination: { lat: 9.0195, lng: 38.7710 },
      profile: "driving",
    },
    redis: {
      keyPattern: "map:session:{id}, map:session:delivery:{deliveryId}",
      commands: "SETEX, MSET",
      strategy: "Write-through dual-key caching: primary by sessionId, secondary index by deliveryId.",
      strategyAmharic: "በአንድ ጊዜ በክፍለ ጊዜ መለያውም ሆነ በማድረሻ ቁጥሩ በቀጥታ በሬዲስ ውስጥ ይቀመጣል።",
      ttl: "86,400s (24 Hours sliding)",
      benefit: "Guarantees customer tracking UI and driver apps load canonical route in <2ms with zero DB load.",
      benefitAmharic: "የደንበኛና የአሽከርካሪ መተግበሪያዎች ዳታቤዙን ሳይነኩ መንገዱን በ 2 ሚሊሰከንድ ውስጥ ያገኛሉ።",
    },
  },
  {
    id: "session-get-id",
    category: "session",
    name: "Get Route Session by ID",
    nameAmharic: "የመንገድ ክፍለ ጊዜን በቁጥሩ መፈለግ",
    description: "Fetches full canonical geometry and current revision using Redis write-through cache.",
    descriptionAmharic: "የተመዘገበውን የመንገድ ጂኦሜትሪና መረጃ ከመሸጎጫ (Cache) ወይም ከዳታቤዝ ያመጣል።",
    method: "GET",
    path: "/api/v1/map/routes/session/sess_sample_test",
    redis: {
      keyPattern: "map:session:{sessionId}",
      commands: "GET, EXPIRE",
      strategy: "Read-through with sliding TTL touch: extends 24h expiration on every active access.",
      strategyAmharic: "መረጃው በተነበበ ቁጥር የ 24 ሰዓት የመቆያ ጊዜው እንደ አዲስ ይታደሳል።",
      ttl: "86,400s (Refreshed on read)",
      benefit: "Sub-millisecond retrieval of GeoJSON coordinates and turn maneuvers.",
      benefitAmharic: "ሙሉ የመንገድ መስመሩን ያለ አንዳች መዘግየት በቅጽበት ያቀርባል።",
    },
  },
  {
    id: "session-get-delivery",
    category: "session",
    name: "Get Route Session by Delivery ID",
    nameAmharic: "በማድረሻ ቁጥር (Delivery ID) የመንገድ መረጃን መፈለግ",
    description: "Looks up active route session linked to PackMan order ID (e.g. deliv_ethiopia_9941).",
    descriptionAmharic: "በማድረሻ ቁጥሩ ተያይዞ የተመደበለትን የመንገድ መረጃ ያቀርባል።",
    method: "GET",
    path: "/api/v1/map/routes/delivery/deliv_ethiopia_9941",
    redis: {
      keyPattern: "map:session:delivery:{deliveryId} -> map:session:{id}",
      commands: "GET, MGET",
      strategy: "Secondary pointer resolution in Redis avoiding relational SQL joins on deliveries table.",
      strategyAmharic: "በሬዲስ ውስጥ ባለው አቋራጭ መረጃ የዳታቤዝ ማፈላለግ ጫናን ያስቀራል።",
      ttl: "86,400s (24 Hours)",
      benefit: "Allows mobile client to query strictly by order number while maintaining DDD aggregate boundary.",
      benefitAmharic: "ተጠቃሚው በዕቃው ማዘዣ ቁጥር ብቻ መንገዱን በቀላሉ እንዲከታተል ያስችላል።",
    },
  },
  {
    id: "session-check-deviation",
    category: "session",
    name: "GPS Corridor Deviation Guard (>100m)",
    nameAmharic: "የመንገድ መዛባት ቁጥጥር (>100 ሜትር)",
    description: "Verifies if active driver GPS point has deviated beyond the 100m planned route corridor.",
    descriptionAmharic: "አሽከርካሪው ከተመደበው መንገድ ከ100 ሜትር በላይ መውጣቱን ወይም አለመውጣቱን ያጣራል።",
    method: "POST",
    path: "/api/v1/map/routes/session/sess_sample_test/check-deviation",
    body: {
      latitude: 9.0145,
      longitude: 38.7690,
    },
    redis: {
      keyPattern: "map:session:{sessionId}",
      commands: "GET (Geometry only)",
      strategy: "Fetches LineString coordinates from Redis cache to compute perpendicular distance in RAM.",
      strategyAmharic: "የመንገዱን መስመር ከሬዲስ በማንበብ አሽከርካሪው ከመስመሩ ምን ያህል እንደራቀ በኮምፒውተር ሜሞሪ ውስጥ ያሰላል።",
      ttl: "86,400s",
      benefit: "<1ms corridor check per GPS ping; handles thousands of pings/sec without database lock contention.",
      benefitAmharic: "በሰከንድ በሺዎች የሚቆጠሩ የጂፒኤስ ነጥቦችን ያለ ዳታቤዝ ጫና በ 1 ሚሊሰከንድ ውስጥ ያጣራል።",
    },
  },
  {
    id: "session-replan",
    category: "session",
    name: "Replan Route Session (Immutable Revision v2)",
    nameAmharic: "አዲስ መንገድ እንደገና ማቀድ (ስሪት 2)",
    description: "Recalculates route due to traffic or driver deviation and bumps immutable revision version.",
    descriptionAmharic: "በትራፊክ ወይም በመንገድ መዛባት ምክንያት አዲስ ስሪት (Revision v2) ይፈጥራል።",
    method: "POST",
    path: "/api/v1/map/routes/session/sess_sample_test/replan",
    body: {
      origin: { lat: 9.0145, lng: 38.7690 },
      destination: { lat: 9.0195, lng: 38.7710 },
      profile: "driving",
      reason: "driver_deviation",
    },
    redis: {
      keyPattern: "map:session:{sessionId}",
      commands: "DEL, SETEX",
      strategy: "Cache invalidation on replan: deletes v1 cache entry, writes updated v2 geometry atomically.",
      strategyAmharic: "የቀደመውን ስሪት ከሬዲስ በማጥፋት አዲሱን ስሪት (v2) በቅጽበት ይተካል።",
      ttl: "86,400s (Refreshed)",
      benefit: "Guarantees driver and customer devices never show conflicting route lines after replanning.",
      benefitAmharic: "አሽከርካሪውና ደንበኛው ሁልጊዜ አንድ ወጥ የሆነ ትክክለኛ መስመር እንዲያዩ ያደርጋል።",
    },
  },
  {
    id: "session-history",
    category: "session",
    name: "Route Audit History (All Revisions)",
    nameAmharic: "የመንገድ ክለሳ ታሪክ (የሁሉም ስሪቶች ሰንሰለት)",
    description: "Returns complete immutable audit trail of route revisions for claims or dispute review.",
    descriptionAmharic: "በጉዞው ወቅት የተከናወኑ ሁሉንም የመንገድ ለውጦች ለኦዲት ይመልሳል።",
    method: "GET",
    path: "/api/v1/map/routes/session/sess_sample_test/history",
    redis: {
      keyPattern: "map:session:history:{sessionId}",
      commands: "GET, SETEX",
      strategy: "Audit trail caching for dispute resolution and post-delivery claims analysis.",
      strategyAmharic: "የተደረጉ የመንገድ ለውጦችን ለክርክርና ለኦዲት ምርመራ በሬዲስ አዘጋጅቶ ያቀርባል።",
      ttl: "3,600s (1 Hour)",
      benefit: "Zero DB load when operations agents inspect driver deviation histories during disputes.",
      benefitAmharic: "አስተዳዳሪዎች የአሽከርካሪውን ታሪክ ሲመረምሩ ዳታቤዙ እንዳይጨናነቅ ይከላከላል።",
    },
  },
  {
    id: "session-close",
    category: "session",
    name: "Close Route Session (Completed / Cancelled)",
    nameAmharic: "የመንገድ ክፍለ ጊዜን መዝጋት",
    description: "Finalizes session upon successful delivery completion or cancellation.",
    descriptionAmharic: "ዕቃው ደርሶ ሲጠናቀቅ የመንገድ ክፍለ ጊዜውን በይፋ ይዘጋል።",
    method: "POST",
    path: "/api/v1/map/routes/session/sess_sample_test/close",
    body: {
      reason: "completed",
    },
    redis: {
      keyPattern: "map:session:{id}, map:session:delivery:{deliveryId}",
      commands: "DEL",
      strategy: "Cache eviction on lifecycle termination: removes active keys from Redis while PG keeps permanent audit.",
      strategyAmharic: "ስራው ሲጠናቀቅ ከሬዲስ ማህደረ-ትውስታ ያጸዳል፤ ቋሚ መረጃው ግን በዳታቤዝ ውስጥ ይቀመጣል።",
      ttl: "Instant Eviction",
      benefit: "Prevents memory bloat by freeing in-memory RAM immediately upon trip completion.",
      benefitAmharic: "የሰርቨሩን ራም (RAM) ነፃ በማድረግ አቅሙን ሁልጊዜ ከፍተኛ ያደርገዋል።",
    },
  },

  // ── Category 4: Search & Spatial Intelligence ──
  {
    id: "search-autocomplete",
    category: "search",
    name: "Multi-Source Autocomplete Search",
    nameAmharic: "የቦታዎች ፍለጋ (Autocomplete)",
    description: "Ranks places across local landmarks, saved user places, and geocoder fallbacks.",
    descriptionAmharic: "የአካባቢ ታዋቂ ቦታዎችን፣ የተመዘገቡ አድራሻዎችን በፍጥነት ይፈልጋል።",
    method: "GET",
    path: "/api/v1/map/autocomplete",
    params: { q: "Bole Medhanialem", limit: "5", lang: "en" },
    redis: {
      keyPattern: "map:search:{query}:{userId}:{lang}",
      commands: "GET, SETEX",
      strategy: "User-segment and query caching across the 4-source search pipeline.",
      strategyAmharic: "የተጠቃሚውን ተደጋጋሚ ፍለጋዎች በቋንቋ ለይቶ በመሸጎጥ ፈጣን የጽሑፍ ማሟያ ይሰጣል።",
      ttl: "21,600s (6 Hours)",
      benefit: "Absorbs 90% of repeated autocomplete keystroke bursts without database ILIKE / tsvector queries.",
      benefitAmharic: "ተጠቃሚው በሞባይል ሲጽፍ የሚፈጠረውን የፍለጋ ጫና 90% በሬዲስ ይወጣዋል።",
    },
  },
  {
    id: "search-reverse-geocode",
    category: "search",
    name: "Reverse Geocode (Lat/Lng → Address)",
    nameAmharic: "አድራሻ መለወጫ (ከጂፒኤስ ቁጥር ወደ አድራሻ)",
    description: "Converts GPS coordinates into human-readable street names and landmarks in Ethiopia.",
    descriptionAmharic: "የላቲትዩድና ሎንጊትዩድ ነጥቦችን ወደ ግልጽ የኢትዮጵያ አድራሻ ይቀይራል።",
    method: "GET",
    path: "/api/v1/map/reverse-geocode",
    params: { lat: "9.0108", lng: "38.7615", lang: "en" },
    redis: {
      keyPattern: "map:revgeo:{lat_4dec}_{lng_4dec}:{lang}",
      commands: "GET, SETEX",
      strategy: "Spatial grid snap cache (rounded to 4 decimals ~11m precision) storing localized addresses.",
      strategyAmharic: "በ 11 ሜትር ራዲየስ ውስጥ ያሉ ነጥቦችን በማመሳሰል የተተረጎመ አድራሻን በሬዲስ ያስቀምጣል።",
      ttl: "86,400s (24 Hours)",
      benefit: "Prevents duplicate geocoding API rate limits and achieves <2ms reverse lookups.",
      benefitAmharic: "ውጫዊ የካርታ አቅራቢዎችን ወጪ በማዳን በ 2 ሚሊሰከንድ ውስጥ አድራሻ ያቀርባል።",
    },
  },
  {
    id: "search-nearby",
    category: "search",
    name: "Nearby Places of Interest (POI Radius)",
    nameAmharic: "በአቅራቢያ ያሉ አገልግሎት ሰጪ ቦታዎች",
    description: "Finds fuel stations, hospitals, clinics, and banks within a specified radius.",
    descriptionAmharic: "በተወሰነ ራዲየስ ውስጥ ያሉ ነዳጅ ማደያዎችን፣ ሆስፒታሎችንና ባንኮችን ያገኛል።",
    method: "GET",
    path: "/api/v1/map/nearby",
    params: { lat: "9.0108", lng: "38.7615", radius: "1500", category: "fuel", lang: "en" },
    redis: {
      keyPattern: "map:nearby:{category}:{lat_3dec}_{lng_3dec}:{radius}",
      commands: "GET, SETEX",
      strategy: "Grid-bucketed spatial POI cache storing categorized amenities per neighborhood.",
      strategyAmharic: "በየመንደሩ ያሉ ነዳጅ ማደያዎችንና ሆስፒታሎችን በምድብ ከፋፍሎ በሬዲስ ያዘጋጃል።",
      ttl: "3,600s (1 Hour)",
      benefit: "Zero spatial distance Haversine calculations during high-volume customer map pans.",
      benefitAmharic: "ደንበኛው ካርታውን ሲያንቀሳቅስ የሚፈጠረውን የርቀት ስሌት ጫና ሙሉ በሙሉ ያጠፋል።",
    },
  },
  {
    id: "search-enrichment",
    category: "search",
    name: "Location Crowdsourced Enrichment",
    nameAmharic: "የአካባቢ መረጃ ማበልጸጊያ (Enrichment)",
    description: "Submits vernacular landmark details (e.g. 'Behind Medhanialem Mall, Gate 2').",
    descriptionAmharic: "የአካባቢው ህብረተሰብ የሚጠራባቸውን ልዩ ምልክቶችና የበር መረጃዎችን ያክላል።",
    method: "POST",
    path: "/api/v1/map/location-enrichment",
    body: {
      latitude: 8.9961,
      longitude: 38.7877,
      suggestedName: "Bole Medhanialem Mall Back Entrance",
      locationType: "commercial",
      extraDetails: { gate: "Gate 2", floor: "Ground" },
    },
    redis: {
      keyPattern: "map:recommendation:{coordHash}",
      commands: "HSET, EXPIRE",
      strategy: "Recommendation cache storing accepted vernacular names without falsely boosting confidence scores.",
      strategyAmharic: "የህብረተሰቡን መጠሪያ ስሞች በመያዝ ለቀጣይ ፍለጋዎች ያዘጋጃል፤ ነገር ግን ትክክለኛ የማድረስ ውጤት ሳይረጋገጥ ነጥብ አይሰጥም።",
      ttl: "604,800s (7 Days)",
      benefit: "Instant vernacular address recommendations for couriers without AI hallucination risks.",
      benefitAmharic: "ለፖስታ አድራሾች ትክክለኛና የአካባቢው ሰው የሚያውቀውን መጠሪያ ስም በቅጽበት ይጠቁማል።",
    },
  },

  // ── Category 5: Saved Places ──
  {
    id: "saved-places-list",
    category: "places",
    name: "List User Saved Places",
    nameAmharic: "የተመዘገቡ ተወዳጅ ቦታዎችን ማየት",
    description: "Retrieves user-saved shortcuts (Home, Office, Warehouse) with soft-delete filtering.",
    descriptionAmharic: "ተጠቃሚው ያስቀመጣቸውን የግል አድራሻዎች (ቤት፣ ቢሮ፣ መጋዘን) ያመጣል።",
    method: "GET",
    path: "/api/v1/map/saved-places",
    params: { userId: "usr_packman_test_1" },
    redis: {
      keyPattern: "map:places:user:{userId}",
      commands: "GET, SETEX",
      strategy: "User address cache storing favorite delivery coordinates for customer app home screen.",
      strategyAmharic: "የተጠቃሚውን ተወዳጅ አድራሻዎች በመሸጎጥ መተግበሪያው ሲከፈት በ 1 ሚሊሰከንድ ያሳያል።",
      ttl: "1,800s (30 Minutes)",
      benefit: "Eliminates repeated user database queries when customers open the delivery booking screen.",
      benefitAmharic: "ደንበኛው ትዕዛዝ በሚሰጥበት ወቅት የዳታቤዝ ፍለጋን ሙሉ በሙሉ ያስቀራል።",
    },
  },
  {
    id: "saved-places-create",
    category: "places",
    name: "Create Saved Place",
    nameAmharic: "አዲስ ተወዳጅ ቦታ መመዝገብ",
    description: "Saves a reusable delivery address shortcut with custom label.",
    descriptionAmharic: "ለቀጣይ ትዕዛዞች የሚሆን አዲስ የመኖሪያ ወይም የሥራ ቦታ አድራሻ ያስቀምጣል።",
    method: "POST",
    path: "/api/v1/map/saved-places",
    body: {
      userId: "usr_packman_test_1",
      label: "Bole Office 4th Floor",
      latitude: 8.9980,
      longitude: 38.7850,
      locationType: "work",
      isDefault: true,
    },
    redis: {
      keyPattern: "map:places:user:{userId}",
      commands: "DEL",
      strategy: "Cache eviction on creation: invalidates user cache so subsequent lists fetch freshly added record.",
      strategyAmharic: "አዲስ አድራሻ ሲመዘገብ የቀደመውን መሸጎጫ ያጸዳል፤ አዲሱ መረጃ ወዲያውኑ እንዲታይ ያደርጋል።",
      ttl: "Instant Eviction",
      benefit: "Immediate data consistency across multiple mobile devices of the same user.",
      benefitAmharic: "ተጠቃሚው በሌላ ስልክም ቢሆን አዲሱን አድራሻ ወዲያውኑ እንዲያገኘው ያረጋግጣል።",
    },
  },
  {
    id: "saved-places-update",
    category: "places",
    name: "Update Saved Place",
    nameAmharic: "የተመዘገበ ቦታን ማሻሻል",
    description: "Updates an existing saved place label or coordinates.",
    descriptionAmharic: "ቀደም ሲል የተመዘገበን ቦታ ስምና መረጃ ያሻሽላል።",
    method: "PUT",
    path: "/api/v1/map/saved-places/sample_place_id",
    body: {
      label: "Bole HQ - Main Reception",
      isDefault: true,
    },
    redis: {
      keyPattern: "map:places:user:{userId}",
      commands: "DEL",
      strategy: "Cache invalidation on modification ensures updated labels render instantaneously.",
      strategyAmharic: "መረጃው ሲሻሻል የቆየውን መሸጎጫ በማጥፋት አዲሱን መረጃ በቅጽበት ያቀርባል።",
      ttl: "Instant Eviction",
      benefit: "Strict read-after-write consistency for courier pickup address tags.",
      benefitAmharic: "የተሻሻለው አድራሻ ወዲያውኑ ለአሽከርካሪው እንዲታይ ያደርጋል።",
    },
  },
  {
    id: "saved-places-delete",
    category: "places",
    name: "Delete Saved Place",
    nameAmharic: "የተመዘገበ ቦታን መሰረዝ",
    description: "Soft-deletes a saved location record without losing historical telemetry.",
    descriptionAmharic: "የተመዘገበን አድራሻ ያለመረጃ መጥፋት ለጊዜው ያስወግዳል።",
    method: "DELETE",
    path: "/api/v1/map/saved-places/sample_place_id",
    redis: {
      keyPattern: "map:places:user:{userId}",
      commands: "DEL",
      strategy: "Evicts cached list so deleted place vanishes immediately from UI without waiting for TTL expiry.",
      strategyAmharic: "የተሰረዘው ቦታ ወዲያውኑ ከመተግበሪያው ላይ እንዲጠፋ መሸጎጫውን ያጸዳል።",
      ttl: "Instant Eviction",
      benefit: "Zero ghost place recommendations in customer app dropdowns.",
      benefitAmharic: "የተሰረዙ ቦታዎች በስህተት ተመልሰው እንዳይታዩ ያደርጋል።",
    },
  },

  // ── Category 6: Tiles, Infrastructure & Admin ──
  {
    id: "admin-style-spec",
    category: "admin",
    name: "MapLibre Style Specification (Dark)",
    nameAmharic: "የማፕ ስታይል ዝርዝር (Dark Style)",
    description: "Serves MapLibre GL JSON stylesheet configured with OpenMapTiles vector sources.",
    descriptionAmharic: "ለካርታው ማሳያ የሚሆን የ MapLibre ቅንብር ያቀርባል።",
    method: "GET",
    path: "/api/v1/map/styles/dark.json",
    redis: {
      keyPattern: "map:style:{styleName}",
      commands: "GET, SETEX",
      strategy: "In-memory caching of static GL JSON style definitions with immutable client cache-control.",
      strategyAmharic: "የካርታውን ገጽታ መመሪያ በሬዲስ ሜሞሪ ውስጥ በማስቀመጥ ያለ አንዳች መዘግየት ያቀርባል።",
      ttl: "86,400s (24 Hours)",
      benefit: "Sub-1ms style bootstrap handshake when web and mobile clients load the map view.",
      benefitAmharic: "የሞባይል ካርታው ሲከፈት በ 1 ሚሊሰከንድ ውስጥ ገጽታውን እንዲያገኝ ያደርጋል።",
    },
  },
  {
    id: "admin-health-check",
    category: "admin",
    name: "System Health & Diagnostics",
    nameAmharic: "የስርዓቱ ጤናና የኦፕሬሽን ሁኔታ",
    description: "Returns health status of PostgreSQL, Redis cache, OSRM engine, and memory usage.",
    descriptionAmharic: "የዳታቤዝ፣ የሬዲስ እና የመንገድ ሞተርን የስራ ዝግጁነት ያሳያል።",
    method: "GET",
    path: "/health",
    redis: {
      keyPattern: "PING -> PONG probe",
      commands: "PING",
      strategy: "Active live connection heartbeat to Redis sentinel / cluster node.",
      strategyAmharic: "የሬዲስ ሰርቨር ግንኙነትና የስራ ዝግጁነት በየጊዜው በፒንግ (PING) ይረጋገጣል።",
      ttl: "Real-time probe",
      benefit: "Detects Redis connectivity degradation immediately and triggers graceful memory fallback.",
      benefitAmharic: "የሬዲስ ችግር ቢፈጠር ወዲያውኑ በመለየት አገልግሎቱ እንዳይቋረጥ አማራጭ መንገድ ይይዛል።",
    },
  },
  {
    id: "admin-api-keys",
    category: "admin",
    name: "List Admin API Keys & Rate Limits",
    nameAmharic: "የአገልግሎት ቁልፎችን ዝርዝርና የፍጥነት ገደብ ማየት",
    description: "Lists active API keys with scope permissions and Redis sliding-window rate limit counters.",
    descriptionAmharic: "የነቁ የኤፒአይ ቁልፎችንና በሬዲስ የሚቆጣጠሩ የፍጥነት ገደቦችን ያቀርባል።",
    method: "GET",
    path: "/api/v1/admin/api-keys",
    redis: {
      keyPattern: "ratelimit:{keyId}:{minute}",
      commands: "INCR, EXPIRE",
      strategy: "Sliding minute-window rate limiter keys tracking per-tenant API call consumption.",
      strategyAmharic: "እያንዳንዱ ደንበኛ በደቂቃ የሚልከውን የጥሪ ብዛት በሬዲስ በመቁጠር ከገደብ በላይ እንዳይሆን ይከላከላል።",
      ttl: "60s",
      benefit: "Atomic in-memory DDoS protection preventing single tenant from starving OSRM compute capacity.",
      benefitAmharic: "አንድ ተጠቃሚ ሰርቨሩን ብቻውን እንዳያጣብበው የ 60 ሰከንድ ጥበቃ ያደርጋል።",
    },
  },
];

export default function PlaygroundPage() {
  const [lang, setLang] = useState<"en" | "am">("en");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [apiKey, setApiKey] = useState("sk_delivery_live_gondar_3b1c559812a4");
  const [customApiBase, setCustomApiBase] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(ALL_API_SCENARIOS[0]);
  const [requestPath, setRequestPath] = useState(ALL_API_SCENARIOS[0].path);
  const [requestMethod, setRequestMethod] = useState<"POST" | "GET" | "PUT" | "DELETE">(ALL_API_SCENARIOS[0].method);
  const [requestBodyText, setRequestBodyText] = useState(
    JSON.stringify(ALL_API_SCENARIOS[0].body, null, 2)
  );
  const [queryParams, setQueryParams] = useState<Record<string, string>>(
    ALL_API_SCENARIOS[0].params || {}
  );

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseRawText, setResponseRawText] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  useEffect(() => {
    setCustomApiBase(getEffectiveApiUrl());
  }, []);

  const effectiveApiBase = customApiBase || getEffectiveApiUrl();

  function loadScenario(scenario: Scenario, targetLang: "en" | "am" = lang) {
    setSelectedScenario(scenario);
    setRequestPath(scenario.path);
    setRequestMethod(scenario.method);

    const initialParams: Record<string, string> = { ...(scenario.params || {}) };
    if (initialParams.lang) {
      initialParams.lang = targetLang;
    }
    setQueryParams(initialParams);

    if (scenario.body) {
      const cloned = JSON.parse(JSON.stringify(scenario.body));
      if ("lang" in cloned) {
        cloned.lang = targetLang;
      }
      setRequestBodyText(JSON.stringify(cloned, null, 2));
    } else {
      setRequestBodyText("");
    }
  }

  function handleLanguageToggle() {
    const nextLang = lang === "en" ? "am" : "en";
    setLang(nextLang);

    if (queryParams.lang) {
      setQueryParams((prev) => ({ ...prev, lang: nextLang }));
    }

    if (requestBodyText.trim()) {
      try {
        const parsed = JSON.parse(requestBodyText);
        if ("lang" in parsed) {
          parsed.lang = nextLang;
          setRequestBodyText(JSON.stringify(parsed, null, 2));
        }
      } catch {}
    }
  }

  async function handleExecute() {
    setLoading(true);
    setResponseStatus(null);
    setResponseTimeMs(null);
    setResponseData(null);
    setResponseRawText(null);

    const startTime = performance.now();

    try {
      let finalUrl = `${effectiveApiBase}${requestPath}`;

      const search = new URLSearchParams(queryParams);
      if (apiKey && requestMethod === "GET") {
        search.append("key", apiKey);
      }
      if (!search.has("lang") && requestMethod === "GET") {
        search.append("lang", lang);
      }

      const queryString = search.toString();
      if (queryString) {
        finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryString;
      }

      const headers: Record<string, string> = {
        "X-Lang": lang,
        "Accept-Language": lang === "am" ? "am,en;q=0.8" : "en,am;q=0.8",
      };

      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const fetchOptions: RequestInit = {
        method: requestMethod,
        headers,
      };

      if ((requestMethod === "POST" || requestMethod === "PUT") && requestBodyText.trim()) {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = requestBodyText;
      }

      const res = await fetch(finalUrl, fetchOptions);
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTimeMs(elapsed);
      setResponseStatus(res.status);

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        setResponseData(json);
      } else {
        const text = await res.text();
        setResponseRawText(text);
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTimeMs(elapsed);
      setResponseStatus(0);
      setResponseData({
        error: "Network / Connection Error",
        message: (err as Error).message,
        hint: `Make sure the Map Service is running at ${effectiveApiBase} or select Vercel host`,
      });
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  }

  function buildCurl(): string {
    let url = `${effectiveApiBase}${requestPath}`;
    const search = new URLSearchParams(queryParams);
    if (apiKey && requestMethod === "GET") search.append("key", apiKey);
    if (!search.has("lang") && requestMethod === "GET") search.append("lang", lang);
    const qs = search.toString();
    if (qs) url += `?${qs}`;

    let cmd = `curl -X ${requestMethod} "${url}" \\\n  -H "X-Lang: ${lang}"`;
    if (apiKey) cmd += ` \\\n  -H "X-API-Key: ${apiKey}"`;
    if ((requestMethod === "POST" || requestMethod === "PUT") && requestBodyText.trim()) {
      cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBodyText}'`;
    }
    return cmd;
  }

  function copyCurlCommand() {
    navigator.clipboard.writeText(buildCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  }

  const filteredScenarios = useMemo(() => {
    return ALL_API_SCENARIOS.filter((sc) => {
      const matchesCategory = activeCategory === "all" || sc.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        sc.name.toLowerCase().includes(q) ||
        sc.nameAmharic.toLowerCase().includes(q) ||
        sc.path.toLowerCase().includes(q) ||
        sc.description.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchFilter]);

  const categories = [
    { id: "all", label: lang === "am" ? "ሁሉም (24)" : "All APIs (24)" },
    { id: "routing", label: lang === "am" ? "የመንገድ ዕቅድ (6)" : "Routing (6)" },
    { id: "dispatch", label: lang === "am" ? "የተሽከርካሪ ስምሪት (2)" : "Dispatch (2)" },
    { id: "session", label: lang === "am" ? "የመንገድ ክፍለ ጊዜ (7)" : "Sessions (7)" },
    { id: "search", label: lang === "am" ? "ፍለጋና አድራሻ (4)" : "Search (4)" },
    { id: "places", label: lang === "am" ? "ተወዳጅ ቦታዎች (4)" : "Saved (4)" },
    { id: "admin", label: lang === "am" ? "አስተዳዳሪና ካርታ (3)" : "Admin (3)" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "1.5rem 1rem", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        {/* Top Control Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem", background: "rgba(255,255,255,0.02)", padding: "0.85rem 1.25rem", borderRadius: "10px", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.6rem" }}>⚡</span>
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                {lang === "am" ? "የኢትዮጵያ ካርታ ኤፒአይ መሞከሪያ" : "Open Ethiopia Map API Workbench"}
              </h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.785rem", margin: 0 }}>
                {lang === "am" ? "24 ኤፒአይዎች • የሬዲስ አጠቃቀም ማብራሪያ • አማርኛና እንግሊዝኛ" : "24 Operational APIs • In-Memory Redis Architecture • Universal Amharic/English"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
            {/* Universal Language Switcher */}
            <button
              onClick={handleLanguageToggle}
              className="btn-mapcn btn-mapcn-xs"
              style={{
                background: lang === "am" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                border: lang === "am" ? "1px solid #10b981" : "1px solid var(--border)",
                color: lang === "am" ? "#34d399" : "#ffffff",
                fontWeight: 700,
                borderRadius: "var(--radius-full)",
                padding: "0.35rem 0.85rem",
                cursor: "pointer",
              }}
              title="Toggle between English and Amharic"
            >
              {lang === "am" ? "🇪🇹 አማርኛ (AM)" : "🇬🇧 English (EN)"}
            </button>

            {/* Host Quick Selectors */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <button
                onClick={() => setCustomApiBase("http://localhost:8084")}
                className={`btn-mapcn btn-mapcn-xs ${effectiveApiBase.includes("localhost") ? "btn-mapcn-primary" : "btn-mapcn-outline"}`}
                style={{ fontSize: "0.7rem", padding: "0 0.5rem" }}
              >
                Local :8084
              </button>
              <button
                onClick={() => setCustomApiBase("https://open-ethiopia-map-isf6.vercel.app")}
                className={`btn-mapcn btn-mapcn-xs ${effectiveApiBase.includes("vercel") ? "btn-mapcn-primary" : "btn-mapcn-outline"}`}
                style={{ fontSize: "0.7rem", padding: "0 0.5rem" }}
              >
                Vercel
              </button>
            </div>

            {/* API Key Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(0, 0, 0, 0.4)", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Key:</span>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="X-API-Key..."
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#10b981",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.75rem",
                  width: "160px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout: Left Vertical Sidebar + Right Workbench ── */}
        <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "1.25rem", alignItems: "start" }}>

          {/* ── Left Vertical Sidebar: API Directory ─────────────────────── */}
          <aside
            style={{
              background: "#090d16",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 170px)",
              position: "sticky",
              top: "5rem",
              overflow: "hidden",
            }}
          >
            {/* Sidebar Search Bar */}
            <div style={{ marginBottom: "0.75rem" }}>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={lang === "am" ? "ኤፒአይዎችን ይፈልጉ..." : "Filter 24 APIs..."}
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "6px",
                  padding: "0.45rem 0.75rem",
                  color: "#ffffff",
                  fontSize: "0.785rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Category Filter Pills in Sidebar */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: activeCategory === cat.id ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    border: activeCategory === cat.id ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                    color: activeCategory === cat.id ? "#38bdf8" : "var(--muted-foreground)",
                    borderRadius: "4px",
                    padding: "0.2rem 0.45rem",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Vertical Scrollable List of 24 APIs */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem", paddingRight: "0.25rem" }}>
              {filteredScenarios.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                const methodColor =
                  sc.method === "POST"
                    ? "#38bdf8"
                    : sc.method === "GET"
                    ? "#34d399"
                    : sc.method === "PUT"
                    ? "#f59e0b"
                    : "#ef4444";

                return (
                  <button
                    key={sc.id}
                    onClick={() => loadScenario(sc)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      textAlign: "left",
                      padding: "0.55rem 0.7rem",
                      borderRadius: "8px",
                      background: isSelected ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", width: "100%", marginBottom: "0.2rem" }}>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          padding: "0.1rem 0.35rem",
                          borderRadius: "3px",
                          background: `${methodColor}22`,
                          color: methodColor,
                          border: `1px solid ${methodColor}44`,
                        }}
                      >
                        {sc.method}
                      </span>
                      <span style={{ fontSize: "0.78rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#ffffff" : "#cbd5e1", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lang === "am" && sc.nameAmharic ? sc.nameAmharic : sc.name}
                      </span>
                    </div>
                    <code style={{ fontSize: "0.68rem", color: isSelected ? "#38bdf8" : "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {sc.path}
                    </code>
                  </button>
                );
              })}
              {filteredScenarios.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--muted-foreground)", fontSize: "0.78rem" }}>
                  No APIs found matching filter.
                </div>
              )}
            </div>
          </aside>

          {/* ── Right Main Workbench: Request & Response Panels ──────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: "1.25rem", alignItems: "start" }}>

            {/* Left Sub-Column: Request Editor & Redis Usage Description */}
            <div className="bento-card" style={{ padding: "1.25rem" }}>
              {/* Path & Method Bar */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <select
                  value={requestMethod}
                  onChange={(e) => setRequestMethod(e.target.value as any)}
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    borderRadius: "6px",
                    padding: "0.4rem 0.65rem",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
              </div>

              {/* Scenario Description */}
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1rem", lineHeight: 1.4 }}>
                💡 {lang === "am" && selectedScenario.descriptionAmharic ? selectedScenario.descriptionAmharic : selectedScenario.description}
              </div>

              {/* ── REDIS USAGE IN PRODUCTION ARCHITECTURE CARD ────────── */}
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(220, 38, 38, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "8px",
                  padding: "0.85rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <span style={{ fontSize: "1rem" }}>⚡</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {lang === "am" ? "የሬዲስ (Redis) አጠቃቀምና ሚና" : "Redis Production Architecture"}
                    </span>
                  </div>
                  <span className="badge-pill" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", fontSize: "0.68rem" }}>
                    TTL: {selectedScenario.redis.ttl}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.35rem", fontSize: "0.74rem" }}>
                  <div>
                    <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Key Pattern: </span>
                    <code style={{ color: "#38bdf8", background: "rgba(0,0,0,0.3)", padding: "1px 4px", borderRadius: "3px" }}>
                      {selectedScenario.redis.keyPattern}
                    </code>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Commands: </span>
                    <code style={{ color: "#34d399", background: "rgba(0,0,0,0.3)", padding: "1px 4px", borderRadius: "3px" }}>
                      {selectedScenario.redis.commands}
                    </code>
                  </div>
                  <div style={{ color: "#e2e8f0", marginTop: "0.2rem", lineHeight: 1.4 }}>
                    {lang === "am" ? selectedScenario.redis.strategyAmharic : selectedScenario.redis.strategy}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.7rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.35rem", marginTop: "0.2rem" }}>
                    🚀 {lang === "am" ? selectedScenario.redis.benefitAmharic : selectedScenario.redis.benefit}
                  </div>
                </div>
              </div>

              {/* Request Body (for POST/PUT) or Query Params (for GET/DELETE) */}
              {(requestMethod === "POST" || requestMethod === "PUT") ? (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)" }}>
                      JSON Request Body:
                    </span>
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(requestBodyText);
                          setRequestBodyText(JSON.stringify(parsed, null, 2));
                        } catch {}
                      }}
                      className="btn-mapcn btn-mapcn-ghost"
                      style={{ fontSize: "0.7rem", height: "1.4rem", padding: "0 0.4rem" }}
                    >
                      Format JSON
                    </button>
                  </div>
                  <textarea
                    value={requestBodyText}
                    onChange={(e) => setRequestBodyText(e.target.value)}
                    rows={12}
                    style={{
                      width: "100%",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "6px",
                      color: "#f3f4f6",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.8rem",
                      padding: "0.65rem",
                      lineHeight: 1.45,
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)" }}>
                      Query Parameters:
                    </span>
                    <button
                      onClick={() => {
                        const key = prompt("Enter query param key:");
                        if (key) {
                          const val = prompt(`Enter value for ${key}:`) || "";
                          setQueryParams({ ...queryParams, [key]: val });
                        }
                      }}
                      className="btn-mapcn btn-mapcn-ghost"
                      style={{ fontSize: "0.7rem", height: "1.4rem", padding: "0 0.4rem" }}
                    >
                      + Add Param
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {Object.entries(queryParams).map(([key, val], idx) => (
                      <div key={idx} style={{ display: "flex", gap: "0.4rem" }}>
                        <input
                          type="text"
                          value={key}
                          disabled
                          style={{
                            width: "35%",
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#9ca3af",
                            padding: "0.35rem 0.55rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                          }}
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                          style={{
                            flex: 1,
                            background: "rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#ffffff",
                            padding: "0.35rem 0.55rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Execute & cURL Copy */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="btn-mapcn btn-mapcn-primary"
                  style={{
                    flex: 1,
                    height: "2.4rem",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.45rem",
                    cursor: "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      {lang === "am" ? "በመላክ ላይ..." : "Executing..."}
                    </>
                  ) : (
                    <>
                      <span>🚀 {lang === "am" ? "ጥሪውን ላክ" : "Send Request"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={copyCurlCommand}
                  className="btn-mapcn btn-mapcn-outline"
                  style={{ fontSize: "0.75rem", padding: "0 0.75rem" }}
                  title="Copy cURL command"
                >
                  {copiedCurl ? (lang === "am" ? "✓ ተቀድቷል" : "✓ Copied") : "cURL"}
                </button>
              </div>
            </div>

            {/* Right Sub-Column: Response Output & Visual Analytics */}
            <div className="bento-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "#ffffff" }}>
                    {lang === "am" ? "የተመለሰ ውጤት" : "Response Payload"}
                  </span>
                  {responseStatus !== null && (
                    <span
                      className="badge-pill"
                      style={{
                        background: responseStatus >= 200 && responseStatus < 300
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: responseStatus >= 200 && responseStatus < 300 ? "#10b981" : "#ef4444",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                      }}
                    >
                      {responseStatus === 0 ? "Error" : `${responseStatus}`}
                    </span>
                  )}
                  {responseTimeMs !== null && (
                    <span className="badge-pill" style={{ background: "rgba(255, 255, 255, 0.05)", color: "#38bdf8", fontSize: "0.72rem", fontWeight: 600 }}>
                      ⚡ {responseTimeMs} ms
                    </span>
                  )}
                </div>

                {(responseData || responseRawText) && (
                  <button
                    onClick={() => copyToClipboard(responseData ? JSON.stringify(responseData, null, 2) : responseRawText || "")}
                    className="btn-mapcn btn-mapcn-outline btn-mapcn-xs"
                  >
                    {copiedResponse ? (lang === "am" ? "✓ ተቀድቷል" : "✓ Copied") : (lang === "am" ? "JSON ቅዳ" : "Copy JSON")}
                  </button>
                )}
              </div>

              {/* Empty State */}
              {!responseData && !responseRawText && !loading && (
                <div style={{ textAlign: "center", padding: "4rem 1.5rem", color: "var(--muted-foreground)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📡</div>
                  <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.925rem" }}>
                    {lang === "am" ? "ጥሪ ለመላክ ዝግጁ ነው" : "Ready to Send"}
                  </div>
                  <p style={{ fontSize: "0.8rem", maxWidth: "320px", margin: "0.35rem auto 0" }}>
                    {lang === "am"
                      ? "ከግራ በኩል የሚፈልጉትን ኤፒአይ ይምረጡና 'ጥሪውን ላክ' የሚለውን ይጫኑ።"
                      : "Select an API from the left sidebar and click 'Send Request' to execute."}
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div style={{ textAlign: "center", padding: "4rem 1.5rem", color: "var(--muted-foreground)" }}>
                  <div style={{ display: "inline-block", width: "28px", height: "28px", border: "3px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", marginBottom: "0.85rem" }} />
                  <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem" }}>
                    {lang === "am" ? "በኢትዮጵያ ካርታ ሞተር ላይ በመፈለግ ላይ..." : "Querying Map Engine..."}
                  </div>
                </div>
              )}

              {/* Special Visual: Dispatch Leaderboard */}
              {responseData && Array.isArray(responseData.candidates) && responseData.candidates.length > 0 && (
                <div style={{ marginBottom: "0.85rem", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "8px", padding: "0.75rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.45rem" }}>
                    🏆 {lang === "am" ? "በእውነተኛ የመንገድ ጊዜ የተደረደሩ አሽከርካሪዎች" : "Ranked Drivers by True Ethiopian Road ETA"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {responseData.candidates.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(0, 0, 0, 0.3)",
                          padding: "0.35rem 0.55rem",
                          borderRadius: "5px",
                          fontSize: "0.775rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <span style={{ fontWeight: 800, color: idx === 0 ? "#10b981" : "#9ca3af" }}>#{idx + 1}</span>
                          <code style={{ color: "#ffffff" }}>{c.driverId}</code>
                          <span className="badge-pill" style={{ background: "rgba(255,255,255,0.06)", fontSize: "0.65rem" }}>
                            {c.vehicleLabel || c.vehicleType}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                          <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>
                            {c.roadDistanceText || `${c.roadDistanceMeters} m`}
                          </span>
                          <span style={{ color: idx === 0 ? "#10b981" : "#38bdf8", fontWeight: 700 }}>
                            {c.etaText || `${c.etaMinutes} mins`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Visual: Deviation Alert Message */}
              {responseData && responseData.data && typeof responseData.data.deviationMeters === "number" && (
                <div
                  style={{
                    marginBottom: "0.85rem",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "6px",
                    background: responseData.data.status === "off_route" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                    border: `1px solid ${responseData.data.status === "off_route" ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                    color: responseData.data.status === "off_route" ? "#fca5a5" : "#6ee7b7",
                    fontSize: "0.825rem",
                    fontWeight: 600,
                  }}
                >
                  {responseData.data.message || (responseData.data.status === "off_route" ? `Driver off route by ${responseData.data.deviationMeters}m` : `Driver on route (${responseData.data.deviationMeters}m)`)}
                </div>
              )}

              {/* Formatted JSON Output */}
              {(responseData || responseRawText) && (
                <div style={{ position: "relative" }}>
                  <pre
                    className="code-block-shadcn"
                    style={{
                      maxHeight: "560px",
                      overflowY: "auto",
                      margin: 0,
                      fontSize: "0.75rem",
                      lineHeight: 1.45,
                    }}
                  >
                    {responseData ? JSON.stringify(responseData, null, 2) : responseRawText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

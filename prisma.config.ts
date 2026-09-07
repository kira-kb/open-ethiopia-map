import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.MAP_DATABASE_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/packman_maps?schema=public",
  },
});


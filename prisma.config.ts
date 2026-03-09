import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // read the real URL from the environment
    url: process.env.DATABASE_URL!,
    // optional: shadowDatabaseUrl for migrations
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
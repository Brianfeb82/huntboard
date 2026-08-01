import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js keeps env vars in .env.local — load it for the Prisma CLI too.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

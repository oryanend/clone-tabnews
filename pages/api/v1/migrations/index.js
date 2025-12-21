import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller";

const router = createRouter();

router.get(async (request, response) => {
  await getHandler(request, response, true);
});

router.post(async (request, response) => {
  await postHandler(request, response, false);
});

export default router.handler(controller.errorsHandlers);

async function getHandler(request, response, dryRun) {
  const dbClient = await database.getNewClient();

  const migratedMigrations = await migrationRunner({
    dbClient,
    dryRun: true,
    dir: join(process.cwd(), "infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  await dbClient.end();

  if (!dryRun && migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}

async function postHandler(request, response) {
  const dbClient = await database.getNewClient();

  const migratedMigrations = await migrationRunner({
    dbClient,
    dryRun: false,
    dir: join(process.cwd(), "infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  await dbClient.end();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}

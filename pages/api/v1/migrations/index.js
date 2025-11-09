import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  if (request.method == "GET") {
    await pendingMigrations(true);
  }

  if (request.method == "POST") {
    await pendingMigrations(false);
  }

  async function pendingMigrations(dryRunValue) {
    const dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      dbClient: dbClient,
      dryRun: dryRunValue,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    await dbClient.end();

    if (migratedMigrations.length && dryRunValue !== true > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}

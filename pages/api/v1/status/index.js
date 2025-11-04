import database from "/infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersion = await database.query("SHOW server_version;");
  const databaseVersionResult = databaseVersion.rows[0].server_version;

  const maxConnections = await database.query("SHOW max_connections;");
  const maxConnectionsResult = parseInt(maxConnections.rows[0].max_connections);

  const databaseName = process.env.POSTGRES_DB;

  const currentConnections = await database.query({
    text: "SELECT COUNT(*)::int AS count FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const currentConnectionsResult = currentConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionResult,
        max_connections: maxConnectionsResult,
        current_connections: currentConnectionsResult,
      },
    },
  });
}

export default status;

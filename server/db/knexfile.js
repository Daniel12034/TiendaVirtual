const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const { loadProjectEnv } = require("../config/loadEnv");

loadProjectEnv(__dirname, "../.env");

function buildSSLConfig() {
  if (process.env.KNEX_REJECT_UNAUTHORIZED_SSL_CERTIFICATE === "false") {
    return {
      rejectUnauthorized: false,
    };
  }

  return false;
}

module.exports = {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: buildSSLConfig(),
  },
  migrations: {
    tableName: "migration",
    directory: path.join(__dirname, "migrations"),
    sortDirsSeparately: false,
    // Ordena las migraciones por nombre de archivo alfabéticamente
    migrationSource: {
      getMigrations: async (loadExtensions) => {
        const dir = path.join(__dirname, "migrations");
        return fs
          .readdirSync(dir)
          .filter(file => loadExtensions.some(ext => file.endsWith(ext)))
          .sort()
          .map(file => path.join(dir, file));
      }
    }
  },
  seeds: {
    directory: path.join(__dirname, "seeds"),
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};

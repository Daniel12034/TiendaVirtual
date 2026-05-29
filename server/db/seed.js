const initKnex = require("knex");
const knexfile = require("./migrations/knexfile");

const knex = initKnex(knexfile);

async function seedDatabase() {
  try {

    // Run migrations first
    await knex.migrate.latest();

    // Run seeds using the existing default.js seed file
    await knex.seed.run();


  } catch (error) {
    process.exitCode = 1;
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

// Start seeding
seedDatabase();

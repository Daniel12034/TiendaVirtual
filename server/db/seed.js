const initKnex = require("knex");
const knexfile = require("./knexfile");

const knex = initKnex(knexfile);

async function seedDatabase() {
  try {
    await knex.migrate.latest();
    await knex.seed.run();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await knex.destroy();
  }
}

// Start seeding
seedDatabase();

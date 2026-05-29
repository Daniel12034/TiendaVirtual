const UUID_PK = (table) => {
  table.uuid("id").primary();
};

const TIMESTAMP_COLUMNS = (table) => {
  table.bigInteger("created_at").notNullable();
  table.bigInteger("updated_at").notNullable();
};

const AUTOCREATED_DATETIME = (knex, table, name) => {
  table.dateTime(name).notNullable().defaultTo(knex.fn.now());
};

exports.up = async function up(knex) {
  await knex.schema.createTable("recuperaciones_contrasena", (table) => {
    UUID_PK(table);

    table.string("email", 191).notNullable();
    table.string("token", 191).notNullable().unique();
    AUTOCREATED_DATETIME(knex, table, "fecha_solicitud");
    table.dateTime("fecha_expiracion").notNullable();
    table.dateTime("fecha_consumo").nullable();
    table
      .enu("estado", ["PENDIENTE", "EXPIRADA", "USADA"])
      .notNullable()
      .defaultTo("PENDIENTE");
    table
      .uuid("usuario")
      .nullable()
      .references("id")
      .inTable("usuarios")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    TIMESTAMP_COLUMNS(table);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("recuperaciones_contrasena");
};

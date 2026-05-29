const UUID_PK = (table) => {
  table.uuid("id").primary();
};

const TIMESTAMP_COLUMNS = (table) => {
  table.bigInteger("createdAt").notNullable();
  table.bigInteger("updatedAt").notNullable();
};

const AUTOCREATED_DATETIME = (knex, table, name) => {
  table.dateTime(name).notNullable().defaultTo(knex.fn.now());
};

exports.up = async function up(knex) {
  await knex.schema
    .createTable("usuarios", (table) => {
      UUID_PK(table);

      table.string("nombre", 120).notNullable();
      table.string("email", 191).notNullable().unique();
      table.string("password", 255).notNullable();
      table.dateTime("fechaNacimiento").nullable();
      table.enu("estado", ["ACTIVO", "SUSPENDIDO", "ELIMINADO"]).notNullable().defaultTo("ACTIVO");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("categorias", (table) => {
      UUID_PK(table);

      table.string("nombre", 191).notNullable().unique();
      table.text("descripcion").nullable();

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("clientes", (table) => {
      UUID_PK(table);

      table.string("telefono", 20).nullable();
      table.string("direccion", 255).nullable();
      table
        .uuid("usuario")
        .notNullable()
        .unique()
        .references("id")
        .inTable("usuarios")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("sesiones", (table) => {
      UUID_PK(table);

      table.string("token", 191).notNullable().unique();
      AUTOCREATED_DATETIME(knex, table, "fechaInicio");
      table.dateTime("fechaExpiracion").notNullable();
      table
        .enu("estado", ["ACTIVA", "EXPIRADA", "INVALIDA"])
        .notNullable()
        .defaultTo("ACTIVA");
      table
        .uuid("usuario")
        .notNullable()
        .references("id")
        .inTable("usuarios")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("productos", (table) => {
      UUID_PK(table);

      table.string("nombre", 191).notNullable();
      table.text("descripcion").nullable();
      table.decimal("precio", 10, 2).notNullable();
      table
        .enu("estado", ["ACTIVO", "INACTIVO", "AGOTADO"])
        .notNullable()
        .defaultTo("ACTIVO");
      table
        .uuid("categoria")
        .notNullable()
        .references("id")
        .inTable("categorias")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("variantes_producto", (table) => {
      UUID_PK(table);

      table.string("nombre", 191).notNullable();
      table.string("valor", 191).notNullable();
      table.integer("stock").unsigned().notNullable().defaultTo(0);
      table
        .uuid("producto")
        .notNullable()
        .references("id")
        .inTable("productos")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("carritos", (table) => {
      UUID_PK(table);

      AUTOCREATED_DATETIME(knex, table, "fechaCreacion");
      table
        .uuid("cliente")
        .nullable()
        .unique()
        .references("id")
        .inTable("clientes")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    });

  await knex.schema.alterTable("clientes", (table) => {
    table
      .uuid("carrito")
      .nullable()
      .unique()
      .references("id")
      .inTable("carritos")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");
  });
};

exports.down = async function down(knex) {
  await knex.schema.alterTable("clientes", (table) => {
    table.dropUnique(["carrito"]);
    table.dropForeign(["carrito"]);
    table.dropColumn("carrito");
  });

  await knex.schema
    .dropTableIfExists("carritos")
    .dropTableIfExists("variantes_producto")
    .dropTableIfExists("productos")
    .dropTableIfExists("sesiones")
    .dropTableIfExists("clientes")
    .dropTableIfExists("categorias")
    .dropTableIfExists("usuarios");
};

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
    .createTable("items_carrito", (table) => {
      UUID_PK(table);

      table.integer("cantidad").unsigned().notNullable();
      table.decimal("precioUnitario", 10, 2).notNullable();
      table
        .uuid("carrito")
        .notNullable()
        .references("id")
        .inTable("carritos")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .uuid("variante")
        .notNullable()
        .references("id")
        .inTable("variantes_producto")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("pedidos", (table) => {
      UUID_PK(table);

      AUTOCREATED_DATETIME(knex, table, "fecha");
      table.decimal("total", 10, 2).notNullable().defaultTo(0);
      table
        .enu("estado", ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"])
        .notNullable()
        .defaultTo("PENDIENTE");
      table
        .uuid("cliente")
        .notNullable()
        .references("id")
        .inTable("clientes")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    })
    .createTable("detalle_pedido", (table) => {
      UUID_PK(table);

      table.integer("cantidad").unsigned().notNullable();
      table.decimal("precioUnitario", 10, 2).notNullable();
      table
        .uuid("pedido")
        .notNullable()
        .references("id")
        .inTable("pedidos")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .uuid("variante")
        .notNullable()
        .references("id")
        .inTable("variantes_producto")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      TIMESTAMP_COLUMNS(table);
    });
};

exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists("detalle_pedido")
    .dropTableIfExists("pedidos")
    .dropTableIfExists("items_carrito");
};

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function extractArrayLiteral(source, startMarker, endMarker) {
  const startIndex = source.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`No se encontro el marcador ${startMarker}`);
  }

  const arrayStart = source.indexOf('[', startIndex);

  if (arrayStart === -1) {
    throw new Error(`No se encontro el arreglo para ${startMarker}`);
  }

  const endIndex = source.indexOf(endMarker, arrayStart);

  if (endIndex === -1) {
    throw new Error(`No se encontro el cierre ${endMarker}`);
  }

  const arrayLiteral = source.slice(arrayStart, endIndex).replace(/;\s*$/, '').trim();
  return eval(`(${arrayLiteral})`);
}

function loadFrontendSeedCatalog() {
  const seedPath = path.resolve(
    __dirname,
    '../../../client/src/data/catalogoSeed.ts'
  );
  const source = fs.readFileSync(seedPath, 'utf8');

  const categoriasSeed = extractArrayLiteral(
    source,
    'const categoriasSeed: CategoriaSeed[] =',
    'const productosSeed: ProductoSeed[] ='
  );

  const productosSeed = extractArrayLiteral(
    source,
    'const productosSeed: ProductoSeed[] =',
    'const productosPorCategoria = new Map<string, Producto[]>();'
  );

  return {
    categoriasSeed,
    productosSeed
  };
}

function timestamp() {
  return Date.now();
}

function buildProductEstado(productoSeed) {
  const variantes = Array.isArray(productoSeed.variantes)
    ? productoSeed.variantes
    : [];
  const tieneStockDirecto = Number(productoSeed.stock || 0) > 0;
  const tieneStockVariante = variantes.some((variante) => Number(variante.stock || 0) > 0);

  if (tieneStockDirecto || tieneStockVariante) {
    return 'ACTIVO';
  }

  return 'AGOTADO';
}

function buildProductRow(productoSeed, categoriaId) {
  return {
    id: productoSeed.id,
    nombre: productoSeed.nombre,
    descripcion: productoSeed.descripcion,
    precio: productoSeed.precio,
    stock: productoSeed.stock ?? 0,
    etiqueta: productoSeed.etiqueta ?? null,
    imagen_url: productoSeed.imagen?.url ?? null,
    imagen_alt: productoSeed.imagen?.alt ?? null,
    imagen_source_name: productoSeed.imagen?.sourceName ?? null,
    imagen_source_page_url: productoSeed.imagen?.sourcePageUrl ?? null,
    imagen_creator_name: productoSeed.imagen?.creatorName ?? null,
    imagen_creator_url: productoSeed.imagen?.creatorUrl ?? null,
    imagen_license_label: productoSeed.imagen?.licenseLabel ?? null,
    imagen_width: productoSeed.imagen?.width ?? null,
    imagen_height: productoSeed.imagen?.height ?? null,
    imagen_verified_real_photo: true,
    imagen_verified_hd:
      Number(productoSeed.imagen?.width || 0) >= 1280 ||
      Number(productoSeed.imagen?.height || 0) >= 1280,
    estado: buildProductEstado(productoSeed),
    categoria: categoriaId,
    created_at: timestamp(),
    updated_at: timestamp()
  };
}

module.exports.seed = async function seed(knex) {
  const { categoriasSeed, productosSeed } = loadFrontendSeedCatalog();
  const now = timestamp();
  const demoUserId = uuidv4();
  const demoClientId = uuidv4();
  const demoCartId = uuidv4();
  const demoUserPassword = await bcrypt.hash('compras123', 10);

  await knex('recuperaciones_contrasena').del();
  await knex('detalle_pedido').del();
  await knex('items_carrito').del();
  await knex('pedidos').del();
  await knex('sesiones').del();
  await knex('carritos').del();
  await knex('variantes_producto').del();
  await knex('productos').del();
  await knex('clientes').del();
  await knex('usuarios').del();
  await knex('categorias').del();

  const categoriasRows = categoriasSeed.map((categoriaSeed) => ({
    id: categoriaSeed.id,
    nombre: categoriaSeed.nombre,
    descripcion: categoriaSeed.descripcion,
    created_at: now,
    updated_at: now
  }));

  await knex('categorias').insert(categoriasRows);

  const productsRows = [];
  const variantsRows = [];

  for (const productoSeed of productosSeed) {
    productsRows.push(buildProductRow(productoSeed, productoSeed.categoriaId));

    for (const varianteSeed of productoSeed.variantes ?? []) {
      variantsRows.push({
        id: varianteSeed.id,
        nombre: varianteSeed.nombre,
        valor: varianteSeed.valor,
        stock: varianteSeed.stock,
        producto: productoSeed.id,
        created_at: now,
        updated_at: now
      });
    }
  }

  await knex('productos').insert(productsRows);

  if (variantsRows.length > 0) {
    await knex('variantes_producto').insert(variantsRows);
  }

  await knex('usuarios').insert({
    id: demoUserId,
    nombre: 'Camila Torres',
    email: 'demo@tiendaonline.com',
    password: demoUserPassword,
    fecha_nacimiento: new Date('1996-07-02T00:00:00'),
    estado: 'ACTIVO',
    created_at: now,
    updated_at: now
  });

  await knex('clientes').insert({
    id: demoClientId,
    telefono: null,
    direccion: null,
    usuario: demoUserId,
    created_at: now,
    updated_at: now
  });

  await knex('carritos').insert({
    id: demoCartId,
    fechaCreacion: new Date(),
    cliente: demoClientId,
    created_at: now,
    updated_at: now
  });

  await knex('clientes')
    .where({ id: demoClientId })
    .update({
      carrito: demoCartId,
      updated_at: now
    });
};
